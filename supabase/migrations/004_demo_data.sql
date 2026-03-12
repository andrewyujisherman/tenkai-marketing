-- ============================================================
-- Tenkai Marketing — Demo Data
-- Migration: 004_demo_data.sql
-- Safe to re-run (ON CONFLICT DO NOTHING)
-- ============================================================

-- Demo client — Sarah Chen / Premier Plumbing Co.
INSERT INTO public.clients (
  id,
  email,
  name,
  company_name,
  website_url,
  tier,
  status,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sarah@premierplumbing.com',
  'Sarah Chen',
  'Premier Plumbing Co.',
  'https://premierplumbing.com',
  'pro',
  'demo',
  NOW() - INTERVAL '90 days'
) ON CONFLICT (id) DO NOTHING;

-- Demo content posts (mix of statuses) — plumbing industry content
INSERT INTO public.content_posts (id, client_id, title, content, status, topic, keywords, agent_author, seo_score, ai_detection_score, published_url, created_at) VALUES

('00000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 '7 Signs You Need to Replace Your Water Heater Before It Fails',
 'Most homeowners wait until their water heater completely fails before calling a plumber. Here are the seven warning signs every homeowner should know...',
 'published', 'Water Heaters', ARRAY['water heater replacement', 'plumbing maintenance', 'water heater signs'],
 'Sakura', 92, 10.3, 'https://premierplumbing.com/blog/water-heater-replacement-signs',
 NOW() - INTERVAL '60 days'),

('00000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'Emergency Plumbing: What to Do Before the Plumber Arrives',
 'A burst pipe or major leak can cause thousands in water damage within minutes. Knowing these emergency steps can save your home and your wallet...',
 'published', 'Emergency Services', ARRAY['emergency plumber', 'burst pipe', 'water damage prevention'],
 'Sakura', 89, 9.1, 'https://premierplumbing.com/blog/emergency-plumbing-guide',
 NOW() - INTERVAL '45 days'),

('00000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'The Complete Guide to Drain Cleaning: DIY vs Professional',
 'Clogged drains are the most common plumbing issue homeowners face. Here is when to grab the plunger yourself and when to call a professional...',
 'approved', 'Drain Services', ARRAY['drain cleaning', 'clogged drain', 'professional plumber'],
 'Sakura', 85, 13.7, NULL,
 NOW() - INTERVAL '30 days'),

('00000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'Tankless vs Traditional Water Heaters: Which Saves You More?',
 'The tankless water heater market has exploded, but is it really worth the higher upfront cost? We break down the numbers for homeowners...',
 'approved', 'Water Heaters', ARRAY['tankless water heater', 'water heater comparison', 'energy savings'],
 'Sakura', 81, 11.4, NULL,
 NOW() - INTERVAL '20 days'),

('00000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'How to Prepare Your Pipes for Winter: A Homeowner''s Checklist',
 'Frozen pipes cause over $1 billion in damage across the US every winter. This checklist will protect your home from costly burst pipes...',
 'pending_approval', 'Seasonal Tips', ARRAY['frozen pipes', 'winter plumbing', 'pipe insulation'],
 'Sakura', 87, 8.9, NULL,
 NOW() - INTERVAL '10 days'),

('00000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
 '5 Bathroom Renovation Plumbing Mistakes That Cost Thousands',
 'Planning a bathroom remodel? These five plumbing mistakes are shockingly common — and expensive. Here is how to avoid them...',
 'pending_approval', 'Renovations', ARRAY['bathroom renovation', 'plumbing mistakes', 'remodel plumbing'],
 'Sakura', 78, 12.6, NULL,
 NOW() - INTERVAL '7 days'),

('00000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
 'Why Your Water Bill Keeps Going Up (And How to Fix It)',
 'An unexpectedly high water bill usually means a hidden leak. Here is how to find it and what a professional plumber will check...',
 'draft', 'Water Conservation', ARRAY['high water bill', 'hidden leak', 'water conservation'],
 'Sakura', NULL, NULL, NULL,
 NOW() - INTERVAL '3 days'),

('00000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
 'Sump Pump Maintenance: The 15-Minute Check That Prevents Flooding',
 'Most homeowners forget about their sump pump until their basement floods. This quick quarterly check takes 15 minutes and can save you thousands...',
 'draft', 'Maintenance', ARRAY['sump pump', 'basement flooding', 'plumbing maintenance'],
 'Sakura', NULL, NULL, NULL,
 NOW() - INTERVAL '1 day'),

('00000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001',
 'Hard Water Solutions: Water Softeners, Filters, and What Actually Works',
 'Hard water damages fixtures, appliances, and even your skin. Here are the real solutions — from whole-house softeners to point-of-use filters...',
 'draft', 'Water Quality', ARRAY['hard water', 'water softener', 'water filtration'],
 'Sakura', NULL, NULL, NULL,
 NOW()),

('00000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
 'How Premier Plumbing Reduced Emergency Calls by 40% with Preventive Maintenance Plans',
 'Our new preventive maintenance program has transformed how our customers think about plumbing. Here are the results after six months...',
 'draft', 'Case Study', ARRAY['preventive maintenance', 'plumbing plan', 'customer retention'],
 'Sakura', NULL, NULL, NULL,
 NOW() - INTERVAL '2 hours')

ON CONFLICT (id) DO NOTHING;

-- Demo audit
INSERT INTO public.audits (id, client_id, url, overall_score, technical_score, content_score, authority_score, issues, recommendations, status, created_at) VALUES (
  '00000002-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'https://premierplumbing.com',
  74,
  81,
  72,
  69,
  '[
    {"severity": "critical", "title": "Missing meta descriptions on 14 pages", "description": "14 pages are missing meta descriptions, which reduces click-through rates from search results.", "agent": "Yuki", "affected_count": 14},
    {"severity": "critical", "title": "3 broken internal links detected", "description": "Internal links pointing to 404 pages create a poor user experience and waste crawl budget.", "agent": "Yuki", "affected_count": 3},
    {"severity": "warning", "title": "Images missing alt text", "description": "22 images lack descriptive alt text, hurting both accessibility and image search visibility.", "agent": "Yuki", "affected_count": 22},
    {"severity": "warning", "title": "Page load speed below 2.5s threshold", "description": "Average page load time is 3.8 seconds. Google recommends under 2.5s for good Core Web Vitals.", "agent": "Yuki"},
    {"severity": "warning", "title": "Low domain authority (DA 31)", "description": "Domain authority is below the competitive threshold for your target keywords. Link building campaign recommended.", "agent": "Yuki"},
    {"severity": "passed", "title": "SSL certificate valid", "description": "HTTPS is properly configured with a valid certificate.", "agent": "Yuki"},
    {"severity": "passed", "title": "XML sitemap present and valid", "description": "Sitemap is accessible and contains 47 URLs.", "agent": "Yuki"},
    {"severity": "passed", "title": "Mobile-friendly design", "description": "Site passes Google Mobile-Friendly Test with no issues.", "agent": "Yuki"},
    {"severity": "passed", "title": "Robots.txt configured correctly", "description": "No critical pages are being blocked by robots.txt.", "agent": "Yuki"}
  ]'::jsonb,
  '[
    {"priority": "high", "title": "Fix broken internal links", "description": "Update or remove the 3 broken internal links immediately to restore crawl flow.", "agent": "Yuki"},
    {"priority": "high", "title": "Add meta descriptions to priority pages", "description": "Focus on top 5 trafficked pages first. Target 150-160 characters with primary keyword inclusion.", "agent": "Sakura"},
    {"priority": "medium", "title": "Image optimization sprint", "description": "Add descriptive alt text to all 22 flagged images. Compress images to reduce load time.", "agent": "Yuki"},
    {"priority": "medium", "title": "Launch targeted link-building campaign", "description": "Secure 5-8 high-quality backlinks from industry publications to raise DA above 40.", "agent": "Kenji"}
  ]'::jsonb,
  'complete',
  NOW() - INTERVAL '14 days'
) ON CONFLICT (id) DO NOTHING;

-- Demo reports
INSERT INTO public.reports (id, client_id, type, period_start, period_end, metrics, insights, agent_commentary, created_at) VALUES

('00000003-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 'monthly',
 (NOW() - INTERVAL '60 days')::date,
 (NOW() - INTERVAL '31 days')::date,
 '{"organic_traffic": 3420, "organic_traffic_change": 18.5, "keywords_ranked": 127, "keywords_top_10": 23, "avg_position": 14.2, "impressions": 48300, "clicks": 1840, "ctr": 3.8}'::jsonb,
 '["Organic traffic grew 18.5% month-over-month, driven by two newly published articles entering top-10 positions.", "The SEO audit fixes from last month contributed to a 0.6 point improvement in average position.", "High-volume keyword ''local seo services'' moved from position 18 to position 9."]'::jsonb,
 '{"recommendations": ["Publish 2 more pillar content pieces targeting your highest-volume keyword clusters.", "The link-building campaign is showing early results — continue outreach to 3 more domains."], "agent": "Kenji"}'::jsonb,
 NOW() - INTERVAL '31 days'),

('00000003-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 'monthly',
 (NOW() - INTERVAL '30 days')::date,
 NOW()::date,
 '{"organic_traffic": 4105, "organic_traffic_change": 20.0, "keywords_ranked": 143, "keywords_top_10": 31, "avg_position": 12.8, "impressions": 57200, "clicks": 2290, "ctr": 4.0}'::jsonb,
 '["Organic traffic hit 4,105 sessions — a 20% increase and the highest month on record.", "8 new keywords entered the top 10, bringing the total to 31 tracked keywords ranking in position 1-10.", "CTR improved from 3.8% to 4.0% following meta description optimizations.", "The two published pillar articles are already generating backlinks organically."]'::jsonb,
 '{"recommendations": ["Expand the content cluster around ''technical seo'' — 3 supporting articles would significantly strengthen topical authority.", "Consider targeting featured snippets for the 12 keywords currently ranking positions 4-8."], "agent": "Kenji"}'::jsonb,
 NOW() - INTERVAL '1 day'),

('00000003-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'quarterly',
 (NOW() - INTERVAL '90 days')::date,
 NOW()::date,
 '{"organic_traffic": 11840, "organic_traffic_change": 34.2, "keywords_ranked": 143, "keywords_top_10": 31, "avg_position": 12.8, "impressions": 164000, "clicks": 6520, "ctr": 3.97, "new_backlinks": 18, "domain_authority": 34}'::jsonb,
 '["Q1 2026 delivered 34% organic growth quarter-over-quarter — ahead of the 25% target.", "Domain authority increased from 28 to 34 following the link-building campaign.", "Top performing content: ''10 SEO Strategies That Actually Work in 2026'' generated 1,240 organic sessions.", "Technical SEO fixes (broken links, meta descriptions) contributed measurably to improved crawl efficiency."]'::jsonb,
 '{"recommendations": ["Q2 priority: deepen topical authority in core content clusters before expanding to new topics.", "DA 40+ target is achievable by end of Q2 with continued link acquisition pace.", "Recommend A/B testing title tag formats to further improve CTR on position 5-15 keywords."], "agent": "Kenji"}'::jsonb,
 NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

-- Demo approvals
INSERT INTO public.approvals (id, client_id, content_post_id, title, type, agent_name, description, status, created_at) VALUES

('00000004-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 '00000001-0000-0000-0000-000000000005',
 'How to Prepare Your Pipes for Winter: A Homeowner''s Checklist',
 'content',
 'Sakura',
 'Seasonal plumbing article ready for review. Covers pipe insulation, thermostat settings, and outdoor faucet prep. 1,800 words, SEO score 87/100.',
 'pending',
 NOW() - INTERVAL '10 days'),

('00000004-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 '00000001-0000-0000-0000-000000000006',
 '5 Bathroom Renovation Plumbing Mistakes That Cost Thousands',
 'content',
 'Sakura',
 'Renovation plumbing article ready for review. Covers common remodel mistakes with cost estimates and prevention tips. 2,100 words.',
 'pending',
 NOW() - INTERVAL '7 days'),

('00000004-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 '00000001-0000-0000-0000-000000000003',
 'Drain Cleaning Guide — Publish to WordPress',
 'content',
 'Kenji',
 'The drain cleaning guide has been approved and is ready to publish. High search volume keyword. Recommend scheduling for Tuesday 9am ET.',
 'approved',
 NOW() - INTERVAL '25 days'),

('00000004-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 NULL,
 'Q2 Content Strategy: Seasonal Plumbing Campaigns',
 'strategy',
 'Kenji',
 'Q2 content calendar targeting summer plumbing topics: sprinkler systems, sewer line maintenance, outdoor plumbing. 10 planned articles across 3 clusters.',
 'approved',
 NOW() - INTERVAL '35 days')

ON CONFLICT (id) DO NOTHING;
