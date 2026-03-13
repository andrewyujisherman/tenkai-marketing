import test from 'node:test'
import assert from 'node:assert/strict'

import { buildDeliverableTitle, extractScore, generateSummary } from './deliverables'

test('content brief title prefers topic over placeholder fallback', () => {
  const title = buildDeliverableTitle('content_brief', { topic: 'AI task automation' }, null)
  assert.equal(title, 'Content Brief: AI task automation')
})

test('keyword research title uses topic when no URL is provided', () => {
  const title = buildDeliverableTitle('keyword_research', { topic: 'local SEO for dentists' }, null)
  assert.equal(title, 'Keyword Research: local SEO for dentists')
})

test('analytics summary includes keyword opportunities and action plan counts', () => {
  const summary = generateSummary('analytics_audit', {
    analytics_score: 62,
    traffic_analysis: {
      estimated_monthly_organic: 1800,
    },
    content_performance: {
      top_pages: [{}, {}],
    },
    keyword_performance: {
      top_opportunities: [{}, {}, {}],
    },
    monthly_action_plan: [{}, {}],
  })

  assert.equal(
    summary,
    'Analytics score: 62/100. Est. organic traffic: 1800. 2 top pages analyzed. 3 keyword opportunities surfaced. 2 action items in the plan.'
  )
})

test('extractScore reads nested score paths', () => {
  const score = extractScore('content_brief', {
    brief: {
      seo_score: 78,
    },
  })

  assert.equal(score, 78)
})
