"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManager() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError("Failed to load users");
      }
    } catch (err) {
      setError("An error occurred while loading users");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, role: string) => {
    if (role === 'admin') {
      showToast("You cannot delete an Administrator account.", "error");
        return;
    }
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete user", "error");
      }
    } catch (err) {
      showToast("An error occurred while deleting user", "error");
      console.error(err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/approve`, {
        method: "PUT",
      });
      if (res.ok) {
        fetchUsers();
        showToast("Mentor approved and profile created successfully.", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to approve mentor", "error");
      }
    } catch (err) {
      showToast("An error occurred while approving", "error");
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="text-outline text-center py-8 font-mono-label animate-pulse">LOADING USERS...</div>;
  }

  if (error) {
    return <div className="text-error text-center py-8 font-mono-label">{error}</div>;
  }

  return (
    <div className="glass-panel p-8 rounded-2xl border border-white/5 mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="font-h2 text-2xl">Registered Users</h2>
        <button onClick={fetchUsers} className="text-outline hover:text-primary transition-colors flex items-center gap-1 font-mono-label text-xs">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          REFRESH
        </button>
      </div>
      <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full min-w-[640px] text-left font-body-md text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant text-outline font-mono-label">
              <th className="pb-4 pr-4">NAME</th>
              <th className="pb-4 pr-4">EMAIL</th>
              <th className="pb-4 pr-4">ROLE</th>
              <th className="pb-4 pr-4">JOINED</th>
              <th className="pb-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-outline">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-surface-container-high transition-colors">
                  <td className="py-4 pr-4 text-on-surface font-medium">{user.name || 'N/A'}</td>
                  <td className="py-4 pr-4 text-sm">{user.email}</td>
                  <td className="py-4 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-mono-label ${user.role === 'admin' ? 'bg-error-container text-on-error-container' : user.role === 'pending_mentor' ? 'bg-secondary/20 text-secondary' : user.role === 'mentor' ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {user.role === 'pending_mentor' && (
                        <button onClick={() => handleApprove(user._id)} className="bg-secondary/20 text-secondary hover:bg-secondary hover:text-surface px-2 py-1 rounded font-mono-label text-[10px] transition-colors uppercase">
                          Approve
                        </button>
                      )}
                      {user.role === 'admin' ? (
                          <span className="text-outline font-mono-label text-[10px] uppercase pt-1">Protected</span>
                      ) : (
                          <button onClick={() => handleDelete(user._id, user.role)} className="text-outline hover:text-error transition-colors flex items-center justify-center p-1" title="Delete User">
                              <span className="material-symbols-outlined text-[20px]">person_remove</span>
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
