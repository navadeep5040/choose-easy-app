/** Client-safe role → home route mapping (no server imports). */
export function getHomePathForRole(role?: string | null): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "mentor":
      return "/mentor-dashboard";
    case "pending_mentor":
    case "user":
    default:
      return "/dashboard";
  }
}
