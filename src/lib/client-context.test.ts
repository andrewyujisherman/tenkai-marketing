import test from 'node:test'
import assert from 'node:assert/strict'

import { buildClientContextForm, splitLines } from './client-context'

test('buildClientContextForm merges onboarding answers and integration metadata', () => {
  const form = buildClientContextForm(
    {
      company_name: 'Premier Plumbing',
      website_url: 'https://premier.example',
      onboarding_data: {
        business: { name: 'Premier Plumbing', url: 'https://premier.example' },
        industry: 'Plumbing',
        location: 'Austin, TX',
        products: 'Drain cleaning\nWater heater repair',
        unique: 'Same-day service',
        years: '12 years',
        testimonials: 'Rated 4.9 stars across 400 reviews',
        challenge: 'Need more emergency leads',
        goals: 'Increase local traffic',
        competitors: { comp1: 'competitor-a.com', comp2: 'competitor-b.com' },
      },
    },
    [
      {
        integration_type: 'target_keywords',
        metadata: { keywords: ['emergency plumber austin', 'water heater repair austin'] },
      },
      {
        integration_type: 'business_info',
        metadata: { target_audience: 'Homeowners in Austin', service_areas: ['Austin', 'Round Rock'] },
      },
    ]
  )

  assert.equal(form.business_name, 'Premier Plumbing')
  assert.equal(form.services, 'Drain cleaning\nWater heater repair')
  assert.equal(form.competitors, 'competitor-a.com\ncompetitor-b.com')
  assert.equal(form.business_target_audience, 'Homeowners in Austin')
  assert.equal(form.service_areas, 'Austin\nRound Rock')
  assert.equal(form.target_keywords, 'emergency plumber austin\nwater heater repair austin')
})

test('splitLines removes blanks and trims values', () => {
  assert.deepEqual(splitLines(' Austin \n\nRound Rock\n'), ['Austin', 'Round Rock'])
})
