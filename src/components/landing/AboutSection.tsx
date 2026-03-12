import { agents } from '@/lib/design-system'

export function AboutSection() {
  return (
    <section id="about" className="w-full max-w-container mx-auto px-6">
      {/* Section header */}
      <div className="text-center mb-14">
        <p className="text-torii font-serif text-lg mb-3 tracking-wide">天界について</p>
        <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-5">
          Built different, by design
        </h2>
        <p className="text-warm-gray text-lg max-w-2xl mx-auto leading-relaxed">
          Most agencies hire freelancers. We built a dedicated team of AI specialists —
          each one trained deeply on a single discipline, working around the clock with
          no sick days, no handoffs, and no guesswork.
        </p>
      </div>

      {/* Differentiators */}
      <div className="grid sm:grid-cols-3 gap-6 mb-16">
        {[
          {
            jp: '専門性',
            en: 'Deep Specialization',
            body: 'Each agent owns one job. Haruki does strategy. Sakura writes content. Kenji audits your tech. No one-size-fits-all generalists.',
          },
          {
            jp: '24時間',
            en: 'Always On',
            body: 'AI agents don\'t sleep, take vacations, or get distracted. Your marketing keeps moving whether it\'s 2pm or 2am.',
          },
          {
            jp: '透明性',
            en: 'Full Transparency',
            body: 'Every action is logged. You see exactly what each agent did, when, and why — no black boxes, no vague monthly reports.',
          },
        ].map((item) => (
          <div
            key={item.en}
            className="bg-cream rounded-2xl border border-tenkai-border p-7 flex flex-col gap-3"
          >
            <span className="text-torii font-serif text-xl">{item.jp}</span>
            <h3 className="text-charcoal font-serif text-lg">{item.en}</h3>
            <p className="text-warm-gray text-sm leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      {/* Agent roster */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-serif text-charcoal">Meet the team</h3>
        <p className="text-warm-gray text-sm mt-2">Six specialists. One mission.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-tenkai-border-light bg-white"
          >
            <span className="text-2xl">{agent.icon}</span>
            <div>
              <p className="font-serif text-charcoal text-sm font-semibold">{agent.name}</p>
              <p className="text-torii font-serif text-xs">{agent.nameJp}</p>
            </div>
            <p className="text-muted-gray text-xs leading-snug">{agent.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
