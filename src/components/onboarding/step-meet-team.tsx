'use client'

import { AgentCard } from '@/components/ui/agent-card'
import { TENKAI_AGENTS, type AgentId } from '@/lib/agents/index'

const tierAgents: Record<string, AgentId[]> = {
  starter: ['haruki', 'sakura', 'kenji', 'yumi', 'mika'],
  growth: ['haruki', 'sakura', 'kenji', 'yumi', 'mika', 'takeshi', 'hana'],
  pro: ['haruki', 'sakura', 'kenji', 'yumi', 'mika', 'takeshi', 'hana', 'ryo', 'daichi'],
}

interface StepMeetTeamProps {
  tier: string
  customNames: Record<string, string>
  onRename: (agentId: string, newName: string) => void
}

export function StepMeetTeam({ tier, customNames, onRename }: StepMeetTeamProps) {
  const agents = tierAgents[tier.toLowerCase()] || tierAgents.starter

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-2xl text-charcoal">Meet Your AI Team</h2>
        <p className="text-warm-gray text-sm">
          These specialists work on your SEO around the clock.
          Double-click any name to give them a custom name.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agentId) => {
          const agent = TENKAI_AGENTS[agentId]
          return (
            <AgentCard
              key={agentId}
              name={agent.name}
              kanji={agent.kanji}
              role={agent.role}
              customName={customNames[agentId]}
              size="editable"
              editable
              showStatus={false}
              onRename={(newName) => onRename(agentId, newName)}
            />
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-gray">
        {agents.length} specialist{agents.length !== 1 ? 's' : ''} included in your plan
      </p>
    </div>
  )
}
