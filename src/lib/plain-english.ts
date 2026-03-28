// ============================================================
// Plain-English Renderer — zero-jargon deliverable summaries
// for business owners who don't know SEO terminology
// ============================================================

type DeliverableContent = Record<string, unknown>

interface PlainEnglishResult {
  headline: string
  summary: string
  impact: string
  recommendedAction: string
}

function val(content: DeliverableContent, path: string): unknown {
  return path.split('.').reduce<unknown>((v, k) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) return (v as Record<string, unknown>)[k]
    return undefined
  }, content)
}

function num(content: DeliverableContent, path: string): number | null {
  const v = val(content, path)
  return typeof v === 'number' ? v : null
}

function str(content: DeliverableContent, path: string): string | null {
  const v = val(content, path)
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function arrLen(content: DeliverableContent, ...paths: string[]): number | null {
  for (const p of paths) {
    const v = val(content, p)
    if (Array.isArray(v)) return v.length
  }
  return null
}

function scoreLabel(score: number | null): string {
  if (score === null) return 'not yet scored'
  if (score >= 80) return 'strong'
  if (score >= 60) return 'decent but has room to improve'
  if (score >= 40) return 'needs work'
  return 'needs serious attention'
}

function scoreSentence(score: number | null, subject: string): string {
  if (score === null) return ''
  if (score >= 80) return `Your ${subject} is in good shape.`
  if (score >= 60) return `Your ${subject} is okay but there's room for improvement.`
  if (score >= 40) return `Your ${subject} needs some work to keep up with competitors.`
  return `Your ${subject} needs serious attention — it's holding your business back online.`
}

export function renderForBusinessOwner(
  deliverableType: string,
  content: DeliverableContent
): PlainEnglishResult {
  switch (deliverableType) {
    // ─── Content ───────────────────────────────────
    case 'content_brief': {
      const topic = str(content, 'brief.target_keyword') ?? str(content, 'target_keyword') ?? 'your topic'
      const wordCount = num(content, 'brief.recommended_word_count') ?? num(content, 'recommended_word_count')
      return {
        headline: `Writing plan ready for "${topic}"`,
        summary: `We've created a detailed outline for a new piece of content about "${topic}".${wordCount ? ` It should be about ${wordCount} words to compete well in search results.` : ''}`,
        impact: 'A well-structured article following this plan can bring in new visitors who are searching for this topic.',
        recommendedAction: 'Review the outline. Let us know if the angle matches what your customers ask about — we can adjust before writing.',
      }
    }

    case 'content_article': {
      const topic = str(content, 'meta.target_keyword') ?? 'your topic'
      const score = num(content, 'article_score')
      const wordCount = num(content, 'meta.estimated_word_count')
      return {
        headline: `New article written: "${topic}"`,
        summary: `We've written a full article targeting "${topic}"${wordCount ? ` (~${wordCount} words)` : ''}. Quality score: ${score ?? 'N/A'}/100 — ${scoreLabel(score)}.`,
        impact: 'Publishing optimized content helps your website show up when people search for topics you serve.',
        recommendedAction: 'Read through the article. Check that it sounds like your brand. Once approved, we can publish it.',
      }
    }

    case 'content_rewrite': {
      const topic = str(content, 'meta.target_keyword') ?? 'your page'
      const issueCount = arrLen(content, 'diagnosis.identified_issues')
      return {
        headline: `Content refresh done for "${topic}"`,
        summary: `We've updated your existing content to make it more relevant and competitive.${issueCount ? ` Fixed ${issueCount} issue${issueCount > 1 ? 's' : ''} that were hurting performance.` : ''}`,
        impact: 'Refreshed content often recovers lost search rankings and brings back traffic that dropped off.',
        recommendedAction: 'Review the changes and approve them for publishing.',
      }
    }

    case 'content_calendar': {
      const itemCount = arrLen(content, 'calendar_items')
      const score = num(content, 'calendar_score')
      return {
        headline: `Your content plan is ready${itemCount ? ` — ${itemCount} pieces planned` : ''}`,
        summary: `We've mapped out what content to publish and when.${score !== null ? ` Plan quality: ${scoreLabel(score)}.` : ''}`,
        impact: 'Consistent publishing builds trust with search engines and keeps your audience coming back.',
        recommendedAction: 'Look at the calendar. Flag any topics that do not resonate with your customers so we can swap them out.',
      }
    }

    case 'topic_cluster_map': {
      const clusterCount = arrLen(content, 'clusters')
      return {
        headline: `Content strategy mapped${clusterCount ? ` — ${clusterCount} topic groups` : ''}`,
        summary: `We've organized your content into topic groups so search engines see you as an authority in each area.${clusterCount ? ` ${clusterCount} clusters identified.` : ''}`,
        impact: 'Topic clustering helps search engines understand your expertise, which can boost rankings across related pages.',
        recommendedAction: 'Review the topic groups. Let us know if any do not fit your business focus.',
      }
    }

    case 'content_decay_audit': {
      const decayingCount = arrLen(content, 'decaying_pages')
      const score = num(content, 'decay_score')
      return {
        headline: `Found ${decayingCount ?? 'several'} pages losing traffic`,
        summary: `Some of your content is getting stale and losing visitors.${score !== null ? ` Decay score: ${score}/100 — ${score >= 60 ? 'most content is still fresh' : 'several pages need updating'}.` : ''}`,
        impact: 'Outdated content drops in search rankings. Refreshing it is often faster and cheaper than writing from scratch.',
        recommendedAction: 'We recommend refreshing the top declining pages first — these have the biggest recovery potential.',
      }
    }

    // ─── Website Health & Technical ─────────────────
    case 'site_audit': {
      const score = num(content, 'overall_score')
      const quickWins = arrLen(content, 'quick_wins')
      const recs = arrLen(content, 'top_recommendations')
      return {
        headline: `Website health check: ${score ?? '?'}/100`,
        summary: `We've checked your website for issues that affect how it appears in search results. ${scoreSentence(score, 'website health')}`,
        impact: `${recs ? `We found ${recs} things to fix. ` : ''}${quickWins ? `${quickWins} of them are quick wins you can see results from fast.` : 'Fixing these issues helps more people find your business online.'}`,
        recommendedAction: 'Start with the quick wins — they give the fastest visible improvement.',
      }
    }

    case 'technical_audit': {
      const score = num(content, 'technical_score')
      const fixCount = arrLen(content, 'priority_fixes')
      return {
        headline: `Technical health: ${score ?? '?'}/100`,
        summary: `We looked under the hood of your website — how fast it loads, whether search engines can read it properly, and security basics. ${scoreSentence(score, 'technical foundation')}`,
        impact: `${fixCount ? `${fixCount} priority fixes identified. ` : ''}A technically sound website loads faster and ranks better.`,
        recommendedAction: 'The priority fixes are ordered by impact. Start from the top.',
      }
    }

    case 'on_page_audit': {
      const score = num(content, 'on_page_score')
      const issueCount = arrLen(content, 'issues')
      return {
        headline: `Page optimization check: ${score ?? '?'}/100`,
        summary: `We analyzed individual pages on your site to see how well they're optimized for search.${issueCount ? ` Found ${issueCount} issue${issueCount > 1 ? 's' : ''}.` : ''}`,
        impact: 'Optimized pages rank higher and attract more of the right visitors.',
        recommendedAction: 'Review the issues and let us handle the fixes — most are straightforward.',
      }
    }

    case 'meta_optimization': {
      const score = num(content, 'optimization_score')
      const pageCount = arrLen(content, 'pages_analyzed')
      return {
        headline: `Search result descriptions updated`,
        summary: `We've optimized how your pages appear in Google search results — the titles and descriptions people see before clicking.${pageCount ? ` ${pageCount} pages reviewed.` : ''} ${scoreSentence(score, 'search appearance')}`,
        impact: 'Better titles and descriptions mean more people click through to your website from search results.',
        recommendedAction: 'Review the suggested titles and descriptions. They should sound like your brand.',
      }
    }

    case 'schema_generation': {
      const schemaCount = arrLen(content, 'schemas')
      return {
        headline: `Rich search features ready to install`,
        summary: `We've created special code that tells Google exactly what your business does.${schemaCount ? ` ${schemaCount} type${schemaCount > 1 ? 's' : ''} of enhanced listing prepared.` : ''} This can make your search results show stars, prices, FAQ answers, and more.`,
        impact: 'Rich results stand out in search and typically get 20-30% more clicks than plain listings.',
        recommendedAction: 'These need to be added to your website code. We can handle the installation.',
      }
    }

    case 'redirect_map': {
      const totalRedirects = num(content, 'summary.total_redirects')
      return {
        headline: `URL redirect plan ready${totalRedirects ? ` — ${totalRedirects} redirects` : ''}`,
        summary: `We've mapped out which old URLs should point to which new ones. This prevents visitors from hitting dead-end pages.`,
        impact: 'Proper redirects preserve your search rankings when you move or rename pages. Without them, you lose the ranking power those pages built up.',
        recommendedAction: 'Review the redirect map. We generated it in multiple formats ready for your hosting setup.',
      }
    }

    case 'robots_sitemap': {
      const score = num(content, 'robots_sitemap_score')
      return {
        headline: `Search engine access optimized`,
        summary: `We've reviewed the technical files that tell search engines which pages to visit and which to skip. ${scoreSentence(score, 'search engine access setup')}`,
        impact: 'Proper configuration ensures Google finds all your important pages and skips irrelevant ones.',
        recommendedAction: 'Implement the recommended changes to your robots.txt and sitemap files.',
      }
    }

    // ─── Link Building ──────────────────────────────
    case 'link_analysis': {
      const score = num(content, 'link_profile_score')
      const domains = num(content, 'current_profile.estimated_referring_domains')
      return {
        headline: `Link profile: ${score ?? '?'}/100`,
        summary: `We checked how many other websites link to yours — this is one of the biggest factors in search rankings.${domains ? ` About ${domains} other websites currently link to you.` : ''} ${scoreSentence(score, 'link profile')}`,
        impact: 'More quality links from relevant websites = higher rankings. This is how Google judges your authority.',
        recommendedAction: 'Review the link building opportunities we identified. We can start outreach to grow your profile.',
      }
    }

    case 'outreach_emails': {
      const templateCount = arrLen(content, 'email_templates')
      return {
        headline: `${templateCount ?? 'Several'} outreach email templates ready`,
        summary: `We've written personalized emails to send to other websites to earn links back to your site.`,
        impact: 'Each quality link earned improves your authority in search engines, leading to better rankings.',
        recommendedAction: 'Review the emails. Personalize them with any details about your relationship with these contacts.',
      }
    }

    case 'guest_post_draft': {
      const topic = str(content, 'meta.topic') ?? str(content, 'topic') ?? 'your industry'
      return {
        headline: `Guest article drafted for publication`,
        summary: `We've written an article designed to be published on another website, with a link back to yours. Topic: ${topic}.`,
        impact: 'Guest posts on respected sites build your authority and send referral traffic directly to your business.',
        recommendedAction: 'Review the article for accuracy. Once approved, we can submit it to the target publication.',
      }
    }

    case 'directory_submissions': {
      const profileCount = arrLen(content, 'directory_profiles')
      return {
        headline: `${profileCount ?? 'Business'} directory profiles prepared`,
        summary: `We've created optimized profiles for your business across online directories.`,
        impact: 'Consistent business listings across the web improve your local search visibility and help customers find you.',
        recommendedAction: 'Review the profiles for accuracy — especially your address, phone, and hours.',
      }
    }

    // ─── Local & Reviews ────────────────────────────
    case 'local_seo_audit': {
      const score = num(content, 'local_seo_score')
      const issueCount = arrLen(content, 'issues')
      return {
        headline: `Local search visibility: ${score ?? '?'}/100`,
        summary: `We checked how easy it is for nearby customers to find you when they search.${issueCount ? ` Found ${issueCount} issue${issueCount > 1 ? 's' : ''} affecting your local visibility.` : ''} ${scoreSentence(score, 'local search presence')}`,
        impact: 'Most customers search for local businesses on their phone. Better local SEO means more foot traffic and calls.',
        recommendedAction: 'Start with the highest-impact local fixes — they often show results within weeks.',
      }
    }

    case 'gbp_optimization': {
      const score = num(content, 'gbp_score')
      const recCount = arrLen(content, 'recommendations')
      return {
        headline: `Google Business Profile: ${score ?? '?'}/100`,
        summary: `We've reviewed your Google Business Profile — the listing that shows up in Google Maps and local searches.${recCount ? ` ${recCount} improvements recommended.` : ''} ${scoreSentence(score, 'Google listing')}`,
        impact: 'An optimized Google Business Profile can dramatically increase calls, direction requests, and website visits from local searchers.',
        recommendedAction: 'Implement the recommendations. Key areas: photos, business description, categories, and regular posts.',
      }
    }

    case 'review_responses': {
      const responseCount = arrLen(content, 'responses')
      const patternCount = arrLen(content, 'patterns_detected')
      return {
        headline: `${responseCount ?? 'Review'} response drafts ready`,
        summary: `We've written professional responses to your customer reviews.${patternCount ? ` We also spotted ${patternCount} recurring theme${patternCount > 1 ? 's' : ''} in the feedback.` : ''}`,
        impact: 'Responding to reviews shows potential customers you care and can improve your Google ranking.',
        recommendedAction: 'Post the responses on your review platforms. Personalize any that need a specific detail.',
      }
    }

    case 'review_campaign': {
      const emailCount = arrLen(content, 'email_templates')
      const smsCount = arrLen(content, 'sms_templates')
      return {
        headline: `Review generation campaign ready`,
        summary: `We've built a campaign to help you collect more customer reviews.${emailCount ? ` ${emailCount} email template${emailCount > 1 ? 's' : ''}.` : ''}${smsCount ? ` ${smsCount} SMS template${smsCount > 1 ? 's' : ''}.` : ''}`,
        impact: 'More reviews = higher trust + better local rankings. Businesses with 50+ reviews significantly outperform those with fewer.',
        recommendedAction: 'Set up these templates in your email/SMS platform. Start sending to recent happy customers.',
      }
    }

    // ─── Research & Strategy ────────────────────────
    case 'keyword_research': {
      const primaryCount = arrLen(content, 'primary_keywords')
      const gapCount = arrLen(content, 'content_gaps')
      return {
        headline: `${primaryCount ?? 'Key'} search terms your customers use`,
        summary: `We've researched what words and phrases people type into Google when looking for businesses like yours.${primaryCount ? ` Found ${primaryCount} high-value terms.` : ''}${gapCount ? ` ${gapCount} content gaps where you could rank but don't yet.` : ''}`,
        impact: 'Targeting the right keywords means showing up when your ideal customers are actively looking for what you offer.',
        recommendedAction: 'Review the keyword list. Let us know which ones match your most profitable services.',
      }
    }

    case 'competitor_analysis': {
      const competitorCount = arrLen(content, 'competitors')
      const score = num(content, 'competitive_score')
      return {
        headline: `Competitor intelligence: ${competitorCount ?? 'several'} competitors analyzed`,
        summary: `We've studied what your competitors are doing online and where you can beat them. ${scoreSentence(score, 'competitive position')}`,
        impact: 'Understanding competitor strategies reveals gaps you can exploit and mistakes you can avoid.',
        recommendedAction: 'Look at the opportunities column — these are areas where competitors are weak and you can win.',
      }
    }

    case 'geo_audit': {
      const score = num(content, 'geo_score')
      const platformCount = num(content, 'ai_visibility.platforms_present')
      return {
        headline: `AI search visibility: ${score ?? '?'}/100`,
        summary: `We checked how your business appears in AI-powered search tools like ChatGPT, Perplexity, and Google's AI overviews.${platformCount !== null ? ` You're currently visible on ${platformCount} AI platform${platformCount !== 1 ? 's' : ''}.` : ''}`,
        impact: 'More people are using AI to find businesses. Being visible in AI search is becoming as important as regular Google rankings.',
        recommendedAction: 'Focus on the entity and content recommendations — these help AI systems understand and recommend your business.',
      }
    }

    case 'entity_optimization': {
      const score = num(content, 'entity_score')
      const entityCount = arrLen(content, 'entities')
      return {
        headline: `Brand identity signals: ${score ?? '?'}/100`,
        summary: `We've analyzed how well search engines and AI systems recognize your brand as an authority.${entityCount ? ` ${entityCount} entities analyzed.` : ''} ${scoreSentence(score, 'brand recognition online')}`,
        impact: 'Strong entity signals mean Google and AI tools are more likely to feature your business prominently.',
        recommendedAction: 'Implement the recommended entity signals across your website and profiles.',
      }
    }

    // ─── Analytics & Reports ────────────────────────
    case 'analytics_audit': {
      const score = num(content, 'analytics_score')
      const traffic = num(content, 'traffic_analysis.estimated_monthly_organic') ?? num(content, 'traffic_analysis.organic_sessions')
      const opportunities = arrLen(content, 'keyword_performance.keyword_opportunities', 'keyword_performance.top_opportunities', 'keyword_performance.opportunities')
      return {
        headline: `Analytics review: ${score ?? '?'}/100`,
        summary: `We've analyzed your website's traffic and performance data.${traffic ? ` Estimated ${traffic} monthly organic visitors.` : ''}${opportunities ? ` ${opportunities} keyword opportunities found.` : ''} ${scoreSentence(score, 'analytics setup')}`,
        impact: 'Good analytics means better decisions. You can see exactly what is working and where to invest more.',
        recommendedAction: 'Review the action items. Implementing the tracking improvements will give us better data for future decisions.',
      }
    }

    case 'monthly_report': {
      const summary = str(content, 'executive_summary')
      const traffic = num(content, 'kpi_dashboard.organic_traffic')
      return {
        headline: `Your monthly SEO progress report`,
        summary: summary?.slice(0, 200) ?? `Here's what happened with your online presence this month.${traffic ? ` ${traffic} organic visitors.` : ''}`,
        impact: 'This report shows whether your investment in SEO is paying off and where to focus next month.',
        recommendedAction: 'Look at the wins section first, then the priorities for next month. Let us know if you want to adjust the strategy.',
      }
    }

    default:
      return {
        headline: 'Your report is ready',
        summary: 'We\'ve completed an analysis for your business.',
        impact: 'This information helps improve your online presence and attract more customers.',
        recommendedAction: 'Review the report and let us know if you have any questions.',
      }
  }
}
