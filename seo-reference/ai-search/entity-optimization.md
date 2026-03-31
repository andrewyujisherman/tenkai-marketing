# Entity Optimization — Agent Daichi Reference

## What This Produces

A comprehensive entity presence audit and optimization plan that establishes the client as a recognized, consistent entity across the web. Includes Wikidata/Wikipedia assessment, Knowledge Graph inclusion evaluation, cross-platform entity consistency scoring, Organization schema with sameAs array, and a prioritized plan to achieve the 2.8x citation likelihood increase from 4+ third-party platform presence.

**Deliverable type:** `entity_report`
**Agent:** Daichi (大地) — GEO / AI Search Specialist
**Model:** gemini-2.5-flash

---

## Professional Standard

Entity optimization is what separates businesses that AI systems recognize as real-world entities from those that appear as isolated website content. Premium agencies treat entity work as foundational infrastructure — not optional enhancement.

The research is clear: brands with consistent entity presence across 4+ third-party platforms see a 2.8x increase in AI citation likelihood. Knowledge Graph inclusion requires cross-platform entity consistency. Every AI platform uses entity signals to assess credibility.

Premium entity optimization delivers:
- Complete entity presence audit across all relevant platforms
- Cross-platform consistency scoring (name, description, relationships)
- Organization schema with properly configured sameAs array
- Wikidata entry assessment (create or claim if eligible)
- Entity home page evaluation (comprehensive about page)
- Platform-specific registration plan with priority ordering
- Knowledge Graph inclusion strategy

---

## Build Process (Ordered Steps)

1. **Establish the canonical entity** — Define the exact brand name, description, founding date, founder, industry, headquarters, and key relationships. This becomes the reference for all platform consistency checks.

2. **Audit current platform presence** — Scan for existing profiles on:
   - Google Business Profile (if local)
   - LinkedIn company page
   - Crunchbase
   - Wikipedia (if notable)
   - Wikidata
   - Industry-specific directories
   - Social platforms (Twitter/X, Facebook, Instagram, YouTube)
   - BBB, Trustpilot, G2, Capterra (as relevant)
   - Apple Maps, Bing Places (if local)

3. **Score cross-platform consistency** — For each platform found, compare:
   - Business name (exact match?)
   - Description (consistent messaging?)
   - Address/location (if applicable)
   - Phone number (if applicable)
   - Website URL (canonical?)
   - Category/industry classification
   - Logo and imagery

4. **Evaluate entity home page** — The client's About page (or equivalent) must serve as a comprehensive entity home. Check for: founding story, team/leadership, location, contact, certifications, awards, media mentions, and structured data.

5. **Assess Wikidata eligibility** — Check whether the client meets notability criteria. If yes, check for existing Wikidata entry or plan creation. If no, document what would be needed for future eligibility.

6. **Check Organization schema** — Evaluate existing JSON-LD for Organization/LocalBusiness type. Verify sameAs array includes all official profile URLs. Check for logo, foundingDate, founder, address, contactPoint.

7. **Knowledge Graph evaluation** — Search for the brand in Google's Knowledge Panel. Document what appears (or doesn't). Identify gaps preventing Knowledge Graph inclusion.

8. **Build the optimization plan** — Prioritized list of platforms to create/claim profiles on, consistency fixes needed, schema improvements, and entity home page enhancements.

---

## Critical Patterns

### 1. The 4+ Platform Threshold
**WHEN:** Setting the target for entity presence breadth.
**HOW:** Brands present on 4+ third-party platforms see 2.8x citation likelihood increase. Count current platforms. If under 4, the primary recommendation is expanding presence.
**WHY:** AI systems cross-reference entity information across sources. More sources = higher confidence = more citations.
**DON'T:** Count the client's own website as a "platform." Only third-party sources count.

### 2. Consistency Beats Breadth
**WHEN:** Client has profiles on many platforms but with inconsistent information.
**HOW:** Fix existing inconsistencies BEFORE creating new profiles. NAP (Name, Address, Phone) must be identical. Description should use the same core messaging.
**WHY:** Inconsistent entity information creates confusion for AI systems. A brand with 8 inconsistent profiles is worse than one with 4 consistent ones.
**DON'T:** Rush to create new profiles while existing ones contain conflicting information.

### 3. sameAs Array Is the Entity Glue
**WHEN:** Implementing or reviewing Organization schema.
**HOW:** The sameAs property in Organization JSON-LD must include URLs to ALL official profiles: LinkedIn, Twitter/X, Facebook, YouTube, Wikipedia, Wikidata, Crunchbase, GBP, and any industry directories.
**WHY:** sameAs is the explicit signal that tells search engines "these are all the same entity." Without it, AI systems may not connect disparate profiles.
**DON'T:** Include only 1-2 social URLs. The array should be comprehensive — every official profile.

### 4. Wikidata as Entity Anchor
**WHEN:** Client meets notability criteria or operates in a space where Wikipedia/Wikidata presence is achievable.
**HOW:** Check for existing Wikidata item (search wikidata.org). If none exists and the entity is notable, outline the creation process. Include properties: instance of (Q4830453 for business), official website, social media accounts, industry.
**WHY:** Wikidata is a primary data source for Google's Knowledge Graph and multiple AI platforms. It provides machine-readable entity data that directly feeds AI systems.
**DON'T:** Create a Wikidata entry for every client. Notability requirements exist and creating entries for non-notable entities will result in deletion.

### 5. Entity Home Page Requirements
**WHEN:** Evaluating the client's About page or entity home.
**HOW:** The page must be comprehensive: founding story, leadership team, location(s), contact information, certifications, awards, media mentions, community involvement, and full Organization schema. This is the canonical source AI systems reference.
**WHY:** When AI systems encounter conflicting information, they look for a definitive source. The entity home page must BE that source.
**DON'T:** Accept a thin "About Us" page with two paragraphs. Entity home pages must be substantial.

### 6. Knowledge Graph Inclusion Requires Convergence
**WHEN:** Client wants to appear in Google's Knowledge Panel.
**HOW:** Knowledge Graph inclusion requires: (a) consistent entity information across multiple authoritative sources, (b) structured data on the entity home page, (c) ideally Wikidata presence, (d) Wikipedia article if notable, (e) Google Business Profile if applicable.
**WHY:** The Knowledge Graph cross-validates information from multiple sources. Missing or conflicting sources prevent inclusion.
**DON'T:** Promise Knowledge Graph inclusion on a timeline. It's a convergence of signals, not a toggle.

### 7. Industry-Specific Directories Matter
**WHEN:** Selecting which platforms to prioritize for entity presence.
**HOW:** General platforms (LinkedIn, Crunchbase) establish baseline presence. Industry-specific directories establish topical authority. A law firm on Avvo, a SaaS on G2, a restaurant on Yelp — these carry more entity weight in their verticals.
**WHY:** AI systems use industry directories as topical authority signals. Being on G2 tells AI "this is a real software company" more credibly than a generic business listing.
**DON'T:** Only target general directories. Always include 2-3 industry-specific platforms.

### 8. Schema Must Match Reality
**WHEN:** Writing or reviewing Organization schema.
**HOW:** Every property in the schema must match information available on the page AND on third-party platforms. foundingDate, address, telephone, and name must be verifiable.
**WHY:** Schema that contradicts visible page content or external sources is worse than no schema. AI systems detect and penalize inconsistencies.
**DON'T:** Fill schema properties with aspirational or inaccurate information.

### 9. Regular Entity Health Checks
**WHEN:** Setting up ongoing entity maintenance.
**HOW:** Entity consistency degrades over time — platforms update their formats, profiles get claimed by third parties, information changes. Recommend quarterly entity audits.
**WHY:** A profile that was accurate 6 months ago may now have outdated information, especially if the client changed addresses, phone numbers, or leadership.
**DON'T:** Treat entity optimization as a one-time project. It requires ongoing maintenance.

### 10. Third-Party Mentions > Self-Published Content
**WHEN:** Building entity authority signals.
**HOW:** AI engines strongly favor earned media (third-party sources mentioning the brand) over brand-owned content. Identify earned media opportunities: press mentions, industry publications, podcast appearances, guest posts.
**WHY:** AI systems assess authority by how OTHER sources talk about you, not how you talk about yourself.
**DON'T:** Count the client's own blog posts or press releases as entity authority signals. Only third-party mentions count.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| Site Scraper | About page content, existing schema markup | `scrapeUrl()` |
| BFS Crawler | Full-site schema detection, page inventory | `crawlSite()` |
| Serper API | Knowledge Panel presence, brand SERP | `fetchKeywordSerpData()` |
| `client_seo_context` | Business context, competitors, prior findings | Supabase `client_seo_context` table |
| Google Search (grounding) | Real-time brand mention discovery | Gemini `googleSearch` tool |

---

## Output Structure

```json
{
  "entity_health_score": 0-100,
  "canonical_entity": {
    "name": "...",
    "description": "...",
    "industry": "...",
    "founded": "...",
    "headquarters": "...",
    "website": "..."
  },
  "platform_presence": [
    { "platform": "...", "url": "...", "status": "found/not_found/claimed/unclaimed", "consistency_score": 0-100, "issues": [] }
  ],
  "platform_count": { "total": 0, "consistent": 0, "threshold_met": true/false },
  "entity_home_page": {
    "url": "...",
    "completeness_score": 0-100,
    "has_founding_story": true/false,
    "has_leadership": true/false,
    "has_contact": true/false,
    "has_schema": true/false,
    "missing_elements": [],
    "recommendations": []
  },
  "schema_audit": {
    "organization_schema_found": true/false,
    "sameAs_urls": [],
    "missing_sameAs": [],
    "schema_completeness": 0-100,
    "recommended_schema": "..."
  },
  "wikidata_assessment": {
    "existing_entry": null or "Q...",
    "notability_met": true/false,
    "recommendation": "...",
    "properties_to_add": []
  },
  "knowledge_graph": {
    "panel_exists": true/false,
    "panel_completeness": 0-100,
    "missing_signals": [],
    "inclusion_strategy": "..."
  },
  "cross_platform_consistency": {
    "overall_score": 0-100,
    "name_consistent": true/false,
    "description_consistent": true/false,
    "contact_consistent": true/false,
    "inconsistencies": []
  },
  "action_plan": [
    { "priority": 1, "action": "...", "platform": "...", "expected_impact": "...", "effort": "low/medium/high" }
  ]
}
```

---

## Quality Gate

- [ ] All major platforms audited (minimum 8-10 platforms checked)
- [ ] Cross-platform consistency scored with specific inconsistencies identified
- [ ] Organization schema reviewed with complete sameAs array recommendation
- [ ] Wikidata eligibility assessed with honest notability evaluation
- [ ] Entity home page evaluated against comprehensive requirements
- [ ] Knowledge Graph inclusion status documented with gap analysis
- [ ] Industry-specific directories identified and included (not just general platforms)
- [ ] Action plan prioritized by citation impact (4+ platform threshold first)
- [ ] No recommendations to create Wikidata entries for non-notable entities
- [ ] All cited platforms and URLs are real and verified
- [ ] Plain English business impact framing ("AI assistants will be more likely to mention your business")

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `geo_audit` | Entity gaps from GEO → entity work | GEO audit identifies entity signal weakness → entity_optimization addresses them |
| `local_seo_audit` | Shared NAP consistency data | Local SEO NAP audit findings feed entity consistency scoring |
| `gbp_optimization` | GBP is a key entity platform | GBP optimization status → entity presence count |
| `schema_generation` | Entity schema requirements → schema service | Organization schema spec from entity audit → schema_generation implementation |
| `content_brief` | Entity authority signals → content strategy | Third-party mention opportunities → content brief topics |
| `on_page_audit` | About page evaluation | On-page audit of entity home page → entity optimization recommendations |

---

## Concrete Examples

### Complete Organization JSON-LD with sameAs Array

This is a production-ready example for a mid-size plumbing company. Every property is filled with realistic values. The `sameAs` array includes 12 URLs across all relevant platforms.

```json
{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "Greenfield Plumbing & Heating",
  "legalName": "Greenfield Plumbing & Heating, LLC",
  "url": "https://www.greenfieldplumbing.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.greenfieldplumbing.com/images/greenfield-logo.png",
    "width": 300,
    "height": 100
  },
  "description": "Family-owned plumbing and heating company serving the greater Portland, Oregon area since 1998. Licensed, bonded, and insured for residential and commercial plumbing, water heater installation, drain cleaning, and HVAC services.",
  "foundingDate": "1998-03-15",
  "founder": {
    "@type": "Person",
    "name": "Robert Greenfield"
  },
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "minValue": 25,
    "maxValue": 50
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4521 SE Division Street",
    "addressLocality": "Portland",
    "addressRegion": "OR",
    "postalCode": "97206",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.5045,
    "longitude": -122.6185
  },
  "telephone": "+1-503-555-0198",
  "email": "info@greenfieldplumbing.com",
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "08:00",
      "closes": "14:00"
    }
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+1-503-555-0198",
      "contactType": "customer service",
      "areaServed": "US-OR",
      "availableLanguage": ["English", "Spanish"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+1-503-555-0199",
      "contactType": "emergency service",
      "contactOption": "TollFree",
      "availableLanguage": "English"
    }
  ],
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 45.5045,
      "longitude": -122.6185
    },
    "geoRadius": "30 mi"
  },
  "sameAs": [
    "https://www.facebook.com/GreenfieldPlumbingPDX",
    "https://www.instagram.com/greenfieldplumbing",
    "https://twitter.com/GreenfieldPDX",
    "https://www.youtube.com/@GreenfieldPlumbingPDX",
    "https://www.linkedin.com/company/greenfield-plumbing-heating",
    "https://www.yelp.com/biz/greenfield-plumbing-and-heating-portland",
    "https://www.bbb.org/us/or/portland/profile/plumber/greenfield-plumbing-heating-1296-12345678",
    "https://www.angieslist.com/companylist/us/or/portland/greenfield-plumbing-heating",
    "https://www.homeadvisor.com/rated.GreenfieldPlumbing.12345678.html",
    "https://nextdoor.com/pages/greenfield-plumbing-heating-portland-or",
    "https://maps.apple.com/?address=4521+SE+Division+St,+Portland,+OR+97206",
    "https://www.google.com/maps/place/?q=place_id:ChIJN1t_tDeuEmsRUsoyG83frY4"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Plumbing & Heating Services",
    "itemListElement": [
      { "@type": "OfferCatalog", "name": "Residential Plumbing" },
      { "@type": "OfferCatalog", "name": "Commercial Plumbing" },
      { "@type": "OfferCatalog", "name": "Water Heater Installation" },
      { "@type": "OfferCatalog", "name": "Drain Cleaning" },
      { "@type": "OfferCatalog", "name": "HVAC Services" }
    ]
  }
}
```

**Key points:** The `sameAs` array has 12 URLs spanning social media, review platforms, directories, and maps — exceeding the 4+ platform threshold for the 2.8x citation lift. Every URL must be verified to resolve. The schema uses the most specific `@type` (`Plumber` not generic `LocalBusiness`).

---

### Sample Entity Home Page Evaluation — Thin vs. Comprehensive

**THIN entity home page (score: 25/100):**
> **About Us**
>
> Greenfield Plumbing has been serving Portland since 1998. We offer plumbing services for residential and commercial customers. Contact us today for a free estimate!
>
> Phone: 503-555-0198

**What's missing:** No founding story, no leadership team, no specific services listed, no certifications or licenses, no awards, no media mentions, no service area details, no Organization schema, no images, no customer count or project history. AI systems scanning this page get almost no entity signals.

**COMPREHENSIVE entity home page (score: 92/100):**
> **About Greenfield Plumbing & Heating**
>
> **Our Story**
> Robert Greenfield started Greenfield Plumbing from a single van in 1998 after 15 years as a journeyman plumber. Today, we're a team of 35 licensed plumbers and HVAC technicians serving over 12,000 residential and commercial customers across the greater Portland metro area.
>
> **Leadership**
> - **Robert Greenfield, Founder & Master Plumber** — Oregon CCB License #12345, 40+ years experience, Past President of Portland Plumbing Contractors Association
> - **Maria Greenfield, Operations Director** — MBA, Portland State University. Oversees scheduling, fleet management, and customer experience for 15,000+ annual service calls
> - **David Chen, Lead HVAC Technician** — EPA Section 608 Universal Certified, 18 years experience
>
> **Certifications & Licenses**
> - Oregon Construction Contractors Board License #12345
> - EPA Lead-Safe Certified Firm
> - Rinnai Authorized Service Provider
> - BBB A+ Rating since 2005
>
> **Service Area**
> Portland, Beaverton, Lake Oswego, Tigard, Tualatin, Milwaukie, Gresham, and surrounding communities within 30 miles of downtown Portland.
>
> **In the Community**
> Proud sponsor of Portland Youth Soccer League since 2010. Annual participant in Habitat for Humanity Portland builds. Featured in The Oregonian's "Best of Portland" (2023, 2024, 2025).
>
> **Awards & Recognition**
> - Angi Super Service Award: 2022, 2023, 2024, 2025
> - Portland Business Journal "Best Workplaces": 2024
> - Better Business Bureau Torch Award for Ethics: 2023
>
> **Contact**
> 4521 SE Division Street, Portland, OR 97206
> Phone: (503) 555-0198 | Emergency: (503) 555-0199
> Email: info@greenfieldplumbing.com
> Hours: Mon-Fri 7am-6pm, Sat 8am-2pm

**Why the comprehensive version works:** Provides verifiable credentials (license numbers, certifications), named leadership with real titles, specific numbers (12,000 customers, 35 employees), third-party recognition (BBB, awards, media), community involvement, and detailed contact/location information. AI systems can cross-reference this against other platforms. Every claim is specific and verifiable.

---

### Sample Wikidata Property List for a Local Business

For a business that meets Wikidata notability criteria (e.g., covered in multiple independent reliable sources), here are the properties to populate:

| Wikidata Property | Property ID | Example Value | Notes |
|---|---|---|---|
| instance of | P31 | Q4830453 (business enterprise) | Core classification — required |
| official name | P1448 | "Greenfield Plumbing & Heating, LLC" | Legal name as registered |
| short name | P1813 | "Greenfield Plumbing" | Common/trade name |
| industry | P452 | Q164800 (plumbing) | Primary business category |
| inception | P571 | 1998-03-15 | Founding date |
| founded by | P112 | Robert Greenfield (Q-item if exists) | Link to founder's Wikidata item if available |
| headquarters location | P159 | Portland (Q6106) | City-level link |
| country | P17 | United States (Q30) | Country of operation |
| official website | P856 | https://www.greenfieldplumbing.com | Canonical URL |
| Facebook ID | P2013 | GreenfieldPlumbingPDX | Facebook page identifier |
| X (Twitter) username | P2002 | GreenfieldPDX | X/Twitter handle |
| LinkedIn organization ID | P4264 | greenfield-plumbing-heating | LinkedIn company page slug |
| YouTube channel ID | P2397 | UCxxxxxx | YouTube channel identifier |
| number of employees | P1128 | 25-50 | Range or specific number |
| BBB rating | — | A+ (add as qualifier to BBB ID) | If BBB property exists |
| described by source | P1343 | The Oregonian, Portland Business Journal | Links to media coverage |

**Important:** Only create Wikidata entries for businesses that genuinely meet notability criteria — independent coverage in multiple reliable sources. Creating entries for non-notable businesses results in speedy deletion and wastes effort.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| Creating Wikidata entries for non-notable businesses | Entries get deleted, wastes effort, looks spammy | Assess notability honestly; document path to eligibility |
| Only checking 2-3 platforms | Misses the 4+ platform threshold for 2.8x citation lift | Audit 8-10+ platforms including industry-specific ones |
| Listing sameAs URLs without verifying they exist | Broken sameAs links hurt more than help | Verify every URL in the sameAs array resolves |
| Treating entity optimization as a one-time task | Entity information degrades over time | Establish quarterly entity health check cadence |
| Counting client's own content as entity authority | AI systems distinguish self-published from earned media | Focus on third-party mentions and profiles |
| Stuffing Organization schema with unverifiable claims | AI systems detect and penalize schema inconsistencies | Only include properties that match verifiable reality |
| Ignoring industry directories | General platforms don't convey topical authority | Include 2-3 vertical-specific directories |
| Recommending Wikipedia editing for every client | Wikipedia has strict notability and conflict-of-interest policies | Only recommend for genuinely notable entities; never suggest editing Wikipedia directly |
