import { PLAN_COMPARISON_ROWS } from "@/data/marketing";

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <span className="material-symbols-outlined text-secondary text-[20px]">check</span>;
  }
  if (value === false) {
    return <span className="text-outline">—</span>;
  }
  return <span className="font-mono-label text-xs sm:text-sm text-on-surface-variant">{value}</span>;
}

export default function PlanComparisonTable() {
  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
      <div className="p-5 sm:p-8 border-b border-white/10 bg-white/[0.03]">
        <h3 className="font-h2 text-xl sm:text-2xl text-on-surface">Compare plans</h3>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">
          See what&apos;s included at each tier.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="font-mono-label text-[10px] sm:text-xs text-outline uppercase tracking-wider border-b border-white/10">
              <th className="p-4 sm:p-6 font-normal">Feature</th>
              <th className="p-4 sm:p-6 text-center font-normal">Free</th>
              <th className="p-4 sm:p-6 text-center font-normal text-secondary">Pro Student</th>
              <th className="p-4 sm:p-6 text-center font-normal">Mentor Plus</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-4 sm:p-6 font-body-md text-on-surface text-sm">{row.label}</td>
                <td className="p-4 sm:p-6 text-center">
                  <CellValue value={row.free} />
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <CellValue value={row.pro} />
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <CellValue value={row.mentor} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
