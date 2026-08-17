import { Link } from 'react-router-dom'
import type { AttackTechnique } from '../catalog/types'
import type { SigmaRuleRecord } from '../catalog/types'

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
            <th className="px-3 py-3 font-medium">Technique ID</th>
            <th className="px-3 py-3 font-medium">Technique name</th>
            <th className="px-3 py-3 font-medium">Tactic</th>
            <th className="px-3 py-3 font-medium">Type</th>
            <th className="px-3 py-3 font-medium">Related Sigma rules</th>
          </tr>
        </thead>
        <tbody>
          {techniques.map((technique) => {
            const count = ruleCounts.get(technique.id) ?? 0
            return (
              <tr key={technique.id} className="border-b border-soc-border/70 align-top hover:bg-soc-elevated/60">
                <td className="px-3 py-3">
                  <Link
                    to={`/mitre/${encodeURIComponent(technique.id)}`}
                    className="font-mono text-xs text-soc-accent hover:underline"
                  >
                    {technique.id}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <Link to={`/mitre/${encodeURIComponent(technique.id)}`} className="font-medium text-soc-text hover:text-soc-accent">
                    {technique.name}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-soc-muted">{technique.description}</p>
                </td>
                <td className="px-3 py-3 text-xs text-soc-muted">{technique.tactics.join(', ') || '—'}</td>
                <td className="px-3 py-3 text-xs text-soc-muted">
                  {technique.isSubtechnique ? 'Sub-technique' : 'Technique'}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-soc-muted">{count}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ruleCountMap(rulesByTechnique: Map<string, SigmaRuleRecord[]>) {
  const counts = new Map<string, number>()
  for (const [id, rules] of rulesByTechnique) {
    counts.set(id, rules.length)
  }
  return counts
}
