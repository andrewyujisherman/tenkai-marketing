'use client'

import {
  Lightbulb,
  UserCheck,
  ShieldCheck,
  PenTool,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react'

const workflowSteps = [
  {
    title: 'Topic Generation',
    description: 'Haruki identifies high-value topics aligned with your strategy and audience intent.',
    icon: Lightbulb,
    clientStep: false,
  },
  {
    title: 'Client Approval',
    description: 'You review and approve topics before any writing begins. Full control over your content direction.',
    icon: UserCheck,
    clientStep: true,
  },
  {
    title: 'EEAT Check',
    description: 'Every topic is validated against Google\'s Experience, Expertise, Authoritativeness, and Trust guidelines.',
    icon: ShieldCheck,
    clientStep: false,
  },
  {
    title: 'AI Drafting',
    description: 'Sakura crafts well-researched, original content optimized for search and readability.',
    icon: PenTool,
    clientStep: false,
  },
  {
    title: 'Internal Review',
    description: 'Kenji audits for technical SEO, factual accuracy, and content quality before you see it.',
    icon: ClipboardCheck,
    clientStep: false,
  },
  {
    title: 'Client Final Approval',
    description: 'You have the final say. Approve, request changes, or reject — nothing publishes without your sign-off.',
    icon: CheckCircle2,
    clientStep: true,
  },
]

export function ContentWorkflow() {
  return (
    <section>
      <div className="w-full max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">
            You stay in control
          </h2>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto">
            Every piece of content goes through a rigorous 6-step process
          </p>
        </div>

        {/* Workflow steps */}
        <div className="max-w-2xl mx-auto">
          {workflowSteps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex gap-5 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Vertical connector */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    step.clientStep
                      ? 'bg-torii border-torii text-white'
                      : 'bg-cream border-tenkai-border text-warm-gray'
                  }`}
                >
                  <step.icon className="size-4" />
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="w-px flex-1 min-h-[32px] bg-tenkai-border" />
                )}
              </div>

              {/* Content */}
              <div className="pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg text-charcoal">
                    {step.title}
                  </h3>
                  {step.clientStep && (
                    <span className="text-xs font-medium text-torii bg-torii-subtle px-2 py-0.5 rounded-full">
                      Your approval
                    </span>
                  )}
                </div>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
