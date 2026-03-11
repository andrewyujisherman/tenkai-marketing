'use client'

import { agents } from '@/lib/design-system'

export function AgentShowcase() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="w-full max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">
            Meet your Tenkai team
          </h2>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto">
            Six AI experts, each dedicated to a piece of your SEO success
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {agents.map((agent, i) => (
            <div
              key={agent.name}
              className="group bg-cream rounded-xl border border-tenkai-border-light p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-torii-subtle animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif text-lg md:text-xl text-charcoal group-hover:text-torii transition-colors">
                    {agent.name}
                  </h3>
                  <span className="text-sm text-torii/60 font-serif">
                    {agent.nameJp}
                  </span>
                </div>
                <span className="text-2xl" aria-hidden>
                  {agent.icon}
                </span>
              </div>
              <p className="text-sm font-medium text-torii mb-2">
                {agent.role}
              </p>
              <p className="text-sm text-warm-gray leading-relaxed">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
