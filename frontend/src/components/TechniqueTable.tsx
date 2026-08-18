import { Link } from 'react-router-dom'
import type { AttackTechnique } from '../catalog/types'

type TechniqueTableProps = {
  techniques: AttackTechnique[]
  ruleCounts: Map<string, number>
}

export function TechniqueTable({ techniques, ruleCounts }: TechniqueTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-soc-border text-xs uppercase tracking-wider text-soc-muted">
            <th className="px-3.5 py-3 font-medium">Technique ID</th>
            <th className="px-3.5 py-3 font-medium">Technique name</th>
            <th className="px-3.5 py-3 font-medium">Tactic</th>
            <th className="px-3.5 py-3 font-medium">Type</th>
            <th className="px-3.5 py-3 font-medium text-right">Sigma Rules</th>
          </tr>
        </thead>
        <tbody>
          {techniques.map((technique) => {
            const count = ruleCounts.get(technique.id) ?? 0
            return (
              <tr key={technique.id} className="border-b border-soc-border/70 align-top hover:bg-soc-elevated/60 transition-colors">
                <td className="px-3.5 py-3 whitespace-nowrap">
                  <Link
                    to={`/mitre/${encodeURIComponent(technique.id)}`}
                    className="font-mono text-xs font-semibold text-soc-accent hover:underline inline-flex items-center gap-1"
                  >
                    {technique.id}
                  </Link>
                  {technique.parentId ? (
                    <p className="font-mono text-[10px] text-soc-muted mt-0.5">
                      Sub of {technique.parentId}
                    </p>
                  ) : null}
                </td>
                <td className="px-3.5 py-3">
                  <Link
                    to={`/mitre/${encodeURIComponent(technique.id)}`}
                    className="font-medium text-soc-text hover:text-soc-accent transition-colors"
                  >
                    {technique.name}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-soc-muted">
                    {technique.description || 'No description provided.'}
                  </p>
                </td>
                <td className="px-3.5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {technique.tactics.length > 0 ? (
                      technique.tactics.map((tactic) => (
                        <span
                          key={tactic}
                          className="rounded bg-soc-elevated/80 border border-soc-border px-2 py-0.5 text-[11px] text-soc-muted whitespace-nowrap"
                        >
                          {tactic}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-soc-muted">—</span>
                    )}
                  </div>
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                      technique.isSubtechnique
                        ? 'border-soc-border bg-soc-panel text-soc-muted'
                        : 'border-soc-accent/30 bg-soc-accent-dim text-soc-accent'
                    }`}
                  >
                    {technique.isSubtechnique ? 'Sub-technique' : 'Technique'}
                  </span>
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap text-right">
                  <Link
                    to={`/mitre/${encodeURIComponent(technique.id)}`}
                    className={`inline-flex items-center justify-center font-mono text-xs font-medium px-2.5 py-0.5 rounded-full border transition-colors ${
                      count > 0
                        ? 'border-soc-accent/40 bg-soc-accent-dim text-soc-accent hover:bg-soc-accent/20'
                        : 'border-soc-border bg-soc-elevated/40 text-soc-muted hover:text-soc-text'
                    }`}
                  >
                    {count} {count === 1 ? 'rule' : 'rules'}
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
