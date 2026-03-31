# Schema Markup & Structured Data — Agent Reference (Kenji / schema_generation)

## What This Produces
JSON-LD structured data implementations for client pages — validated against Google's 2026 active types, optimized for rich result eligibility and AI credibility signaling, with per-page schema recommendations and ready-to-deploy code blocks.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **2026-accurate type selection.** Only recommends from the 31 active rich result types. Never recommends FAQ schema for non-government/health sites. Never recommends HowTo schema (removed entirely). Knows which types Google deprecated in January 2026.
- **AI credibility integration.** Schema is positioned not just for traditional rich results but for Gemini-powered AI Mode verification — JSON-LD helps AI systems verify claims and assess source credibility for citation.
- **Validation against Google Rich Results Test.** Every JSON-LD block passes the Rich Results Test before delivery. Invalid schema is worse than no schema — it signals incompetence to search engines.
- **Nested and connected schema.** Premium implementations use nested types (Organization with ContactPoint, Article with author Person, Product with AggregateRating and Offer) rather than flat, minimal implementations.
- **Per-page specificity.** Each page gets schema tailored to its actual content — not a single Organization block copied across every page.

## Build Process (Ordered Steps)

1. **Receive page inventory and page types.** Accept crawl data from site audit with page URLs, page types (homepage, about, service, product, blog article, contact, FAQ, location), and existing schema inventory.
2. **Audit existing schema.** For each page with existing JSON-LD: parse the schema, validate against Google's current requirements, flag deprecated types (FAQ on non-gov/health, HowTo on any site), flag required properties that are missing, flag properties with incorrect values.
3. **Map page types to schema types.** Apply the type mapping: homepage → Organization + WebSite + SearchAction, about → Organization + Person (founders), service pages → Service + Organization, product pages → Product + AggregateRating + Offer, blog articles → Article + Person (author) + BreadcrumbList, contact → Organization + ContactPoint, location pages → LocalBusiness, event pages → Event.
4. **Check for missing foundational schema.** Every site needs: Organization on homepage (with logo, sameAs, contactPoint), BreadcrumbList on all pages (navigation path), WebSite with SearchAction on homepage (enables sitelinks search box).
5. **Generate JSON-LD blocks.** For each page: produce complete, valid JSON-LD including all required and recommended properties. Use nested types where appropriate. Include @context, @type, and all properties that the page content can support.
6. **Validate every block.** Run each JSON-LD block through Google Rich Results Test validation logic. Verify: no required properties missing, no deprecated types, no conflicting types, values match expected formats (dates in ISO 8601, URLs as absolute, images as URLs not base64).
7. **Generate implementation instructions.** For each page: specify where to inject the JSON-LD (in <head>, before </body>, or via tag manager), CMS-specific guidance if platform is known, and testing steps post-deployment.
8. **Prioritize by impact.** Rank schema implementations: (1) Organization on homepage — foundational, (2) BreadcrumbList site-wide — breadcrumb rich results, (3) Article on blog posts — article rich results, (4) Product/Service on commercial pages — product rich results, (5) LocalBusiness for local businesses — local panel enhancement, (6) FAQPage only if client is government or health authority.

## Critical Patterns

### 1. 2026 Schema Type Restrictions
**WHEN:** Recommending any structured data type.
**HOW:** Check against Google's March 2026 active type list (31 types): Article, Book, BreadcrumbList, Carousel, Course, CreativeWorkSeries, Dataset, DiscussionForumPosting, EducationalOccupationalProgram, EmployerAggregateRating, EstimatedSalary, Event, FactCheck, HomeActivity, ImageObject, JobPosting, LearningResource, LocalBusiness, MathSolver, Movie, Organization, Practice, Problem, Product, ProfilePage, Recipe, Review, SoftwareApplication, SpecialAnnouncement, VideoObject, VehicleListing. FAQ is restricted to authoritative government and health sites. HowTo was removed entirely in 2024-2025.
**WHY:** Recommending deprecated schema types destroys credibility — clients who test the recommendation in Rich Results Test and get warnings will lose trust immediately. Google's January 2026 deprecation wave removed 7 types.
**DON'T:** Recommend FAQ schema for any non-government/health site. Don't recommend HowTo schema for any site. Don't assume a type generates rich results without verifying against the current active list.

### 2. JSON-LD as Sole Implementation Format
**WHEN:** Every schema recommendation.
**HOW:** Always generate JSON-LD. Never generate Microdata or RDFa. JSON-LD is placed in a `<script type="application/ld+json">` tag, either in `<head>` or before `</body>`. It doesn't require changes to the HTML structure of the page — making it easier to implement, maintain, and debug.
**WHY:** Google explicitly recommends JSON-LD as the preferred structured data format. It's less error-prone than inline markup, doesn't break if page layout changes, can be managed independently of content, and is the only format that works reliably with tag managers.
**DON'T:** Generate Microdata, RDFa, or mixed-format implementations. Don't recommend embedding schema attributes in HTML tags.

### 3. Organization Schema as Foundation
**WHEN:** Every client's homepage, at minimum.
**HOW:** Generate Organization schema with: name, url, logo (ImageObject with url, width, height), description, foundingDate, contactPoint (ContactPoint with telephone, contactType, areaServed), sameAs (array of all official social profiles and directory listings), address (PostalAddress — critical for local businesses). For businesses with a knowledge panel, include additional properties: legalName, numberOfEmployees, founder.
**WHY:** Organization schema is the foundation of entity identity for search engines and AI systems. The sameAs array establishes entity connections across platforms — critical for Knowledge Graph inclusion and AI citation (entities present on 4+ third-party platforms see 2.8x citation likelihood increase). Gemini-powered AI Mode uses Organization schema to verify business legitimacy.
**DON'T:** Generate minimal Organization schema with just name and url. Every property the client can truthfully fill strengthens the entity signal. Don't include social profiles the business doesn't actively maintain.

### 4. LocalBusiness Schema for Local Businesses
**WHEN:** Client has a physical location or serves a local area (service area business).
**HOW:** Use the most specific LocalBusiness subtype (Plumber, Electrician, Restaurant, DentalClinic, etc. — schema.org has 100+ subtypes). Include: name, address (PostalAddress), telephone, openingHoursSpecification (DayOfWeek, opens, closes for each day), geo (latitude/longitude), priceRange, areaServed (for SABs), image, url. For multi-location businesses, generate separate LocalBusiness schema per location page.
**WHY:** LocalBusiness schema feeds directly into Google's local panel and Maps results. The specific subtype (Plumber vs. generic LocalBusiness) signals industry relevance. Post-March 2026 core update, GBP completeness became an even stronger ranking lever — LocalBusiness schema reinforces GBP signals.
**DON'T:** Use generic LocalBusiness when a specific subtype exists. Don't omit opening hours or geo coordinates — these are effectively required for local panel eligibility. Don't generate one LocalBusiness block for a multi-location business.

### 5. Article Schema for Blog Content
**WHEN:** Every blog post, news article, or editorial content page.
**HOW:** Generate Article (or NewsArticle, BlogPosting — use the most specific applicable type) with: headline, author (Person with name, url to author page, sameAs to social profiles), datePublished (ISO 8601), dateModified (ISO 8601, critical for freshness signals), publisher (Organization), image (ImageObject — required for article rich results), description, mainEntityOfPage (canonical URL). For in-depth articles, include wordCount and articleSection.
**WHY:** Article schema enables article rich results (headline, image, author, date in SERPs). The author Person schema with sameAs links is an E-E-A-T signal — it helps Google connect the article to the author's expertise across platforms. dateModified is critical: AI systems use it to assess content freshness, and pages not updated quarterly are 3x more likely to lose AI citations.
**DON'T:** Omit author information. Don't use a fake or generic author name. Don't set dateModified to the current date without actually modifying content — Google can detect this and it's a negative trust signal.

### 6. Product Schema for Commercial Pages
**WHEN:** Product or service pages where pricing, availability, or reviews exist.
**HOW:** Generate Product schema with: name, description, image, sku (if applicable), brand (Organization or Brand), offers (Offer with price, priceCurrency, availability, url), aggregateRating (AggregateRating with ratingValue, reviewCount — only if real reviews exist), review (individual Review objects with author, datePublished, reviewBody, reviewRating).
**WHY:** Product schema enables product rich results (price, availability, rating stars in SERPs). Rating stars increase CTR by 20-30%. For service businesses, Service schema with similar properties achieves comparable results.
**DON'T:** Generate fake reviews or ratings. Don't include AggregateRating without real review data — this violates Google's guidelines and risks manual action. Don't mix up Product and Service types.

### 7. BreadcrumbList on Every Page
**WHEN:** Every page on the site (except homepage, which is the root).
**HOW:** Generate BreadcrumbList with itemListElement array reflecting the navigation path: Home > Category > Subcategory > Current Page. Each item: @type ListItem, position (integer starting at 1), name (page title), item (URL). The last item should not have an item URL (it represents the current page).
**WHY:** BreadcrumbList schema enables breadcrumb rich results in SERPs (showing the navigation path instead of the raw URL). This improves CTR and helps users understand site structure before clicking. It's one of the easiest schema types to implement site-wide.
**DON'T:** Generate breadcrumbs that don't match the actual site navigation. Don't include the current page as a link (it should just have a name). Don't hardcode breadcrumbs — they should be dynamic based on actual page hierarchy.

### 8. WebSite + SearchAction on Homepage
**WHEN:** Homepage schema implementation.
**HOW:** Generate WebSite schema with: name (site/brand name), url (homepage URL), potentialAction (SearchAction with target URL template using {search_term_string}, query-input required). This enables the sitelinks search box in SERPs — users can search the site directly from Google results.
**WHY:** The sitelinks search box is a prominent SERP feature that signals site authority and provides direct search access. It only appears for sites that implement WebSite+SearchAction schema and have sufficient search authority.
**DON'T:** Include SearchAction if the site doesn't have a functional search feature. The target URL must actually work and return relevant results.

### 9. AI Credibility Signaling via Schema
**WHEN:** Optimizing for AI search citation (Google AI Overviews, Perplexity, ChatGPT).
**HOW:** Ensure Organization schema includes comprehensive sameAs array (all platform profiles), author Person schema on all content with expertise signals, Article schema with dateModified for freshness verification, and factual claims in content that schema can help AI verify. Schema acts as machine-readable metadata that AI systems use to assess source credibility and verify claims.
**WHY:** Google's Gemini-powered AI Mode uses schema to verify claims and assess source credibility. Schema now matters for AI citation even without traditional rich results. Only 12% of AI-cited URLs also rank in Google's top 10 — AI citation is a separate channel where schema plays a verification role.
**DON'T:** Treat schema as only relevant for traditional rich results. AI credibility signaling is now equally important. Don't omit dateModified — AI systems heavily weight freshness.

### 10. Nested vs. Flat Schema Architecture
**WHEN:** Generating any schema block with related entities.
**HOW:** Use nested structures: Article should nest author (Person), publisher (Organization), and image (ImageObject) inline rather than using @id references to separate blocks. For pages with multiple schema types, use @graph to combine them in a single JSON-LD block. This keeps everything in one script tag and makes relationships explicit.
**WHY:** Nested schema makes entity relationships unambiguous for parsers. Flat schema with only @id references can fail when crawlers don't resolve references correctly. The @graph pattern is the recommended approach for multiple types on one page.
**DON'T:** Generate separate `<script>` tags for each schema type on a page when they can be combined with @graph. Don't create circular references. Don't nest so deeply that the JSON becomes unreadable — 3 levels of nesting is usually the practical maximum.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| Site scraper / BFS crawler | Existing JSON-LD on each page, page type classification, page content for property extraction | `src/lib/integrations/crawler.ts` — always available |
| Google Rich Results Test | Validation of generated schema, eligible rich result types, errors and warnings | Manual test or API — always available |
| Schema.org documentation | Full type hierarchy, required/recommended properties per type | Reference documentation |
| Google Structured Data docs | Google-specific requirements, supported types, enhancement reports | Reference documentation |
| Site audit output | Page inventory, page types, existing schema issues | From upstream site_audit service |
| Google Search Console | Rich result performance, enhancement errors, structured data issues | OAuth — only when client connects |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **Schema Health Summary** — Current schema coverage (pages with valid schema / total pages), deprecated schema warnings, missing foundational schema (Organization, BreadcrumbList), top 3 schema opportunities.
2. **Existing Schema Audit** — Per-page: current schema types, validation status (valid/errors/warnings), specific issues found, deprecated type flags.
3. **Foundational Schema** — Organization JSON-LD for homepage, WebSite+SearchAction for homepage, BreadcrumbList template for site-wide deployment. Ready-to-deploy code blocks.
4. **Page-Type Schema Recommendations** — Grouped by page type: Article pages, Product/Service pages, Location pages, etc. Each group gets a template with property mapping instructions.
5. **Per-Page JSON-LD Blocks** — For priority pages: complete, validated JSON-LD code ready for deployment. Each block includes implementation location (head vs. body), CMS-specific instructions if applicable.
6. **AI Credibility Enhancements** — Schema additions specifically for AI citation optimization: sameAs expansion, author expertise signals, dateModified enforcement.
7. **Implementation Guide** — Step-by-step deployment instructions per CMS (WordPress, Shopify, custom), testing checklist, monitoring setup via GSC Enhancement reports.
8. **Prioritized Implementation Plan** — Each schema addition as a row: Page/Template, Schema Type, Expected Rich Result, Effort, Priority, Dependencies.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] No FAQ schema recommended for non-government/health sites
- [ ] No HowTo schema recommended for any site
- [ ] All recommended types are on the 31 active rich result types list (March 2026)
- [ ] Every JSON-LD block is syntactically valid JSON (parseable without errors)
- [ ] Every JSON-LD block includes all required properties per Google's documentation
- [ ] Organization schema on homepage includes logo, contactPoint, and sameAs array
- [ ] Article schema includes author Person with name and url at minimum
- [ ] LocalBusiness uses the most specific subtype available
- [ ] BreadcrumbList matches actual site navigation hierarchy
- [ ] No fake reviews or ratings in Product/Service schema
- [ ] All dates are ISO 8601 format
- [ ] All URLs are absolute (not relative paths)
- [ ] Each JSON-LD block includes implementation instructions (where to place, how to test)

## Cross-Service Connections

- **Receives from:**
  - `site_audit` (Haruki) — existing schema inventory per page, page type classification, deprecated schema flags
  - `on_page_audit` (Mika) — pages missing schema with page type identification, content analysis for property extraction
  - `gbp_optimization` (Mika) — GBP data for LocalBusiness schema properties (hours, categories, attributes)
- **Sends to:**
  - `content_article` (Sakura) — Article schema template for inclusion in every new article
  - `technical_audit` (Kenji) — schema validation results for technical health assessment
  - `geo_audit` (Haruki) — schema completeness for AI credibility scoring
  - `monthly_report` (Yumi) — rich result performance changes, new schema deployments

**Data fields that transfer:**
- `schema_inventory[]` — `{url, types[], valid: bool, errors[], warnings[], deprecated_types[]}`
- `schema_recommendations[]` — `{url, page_type, recommended_types[], json_ld_block, priority, effort}`
- `organization_schema{}` — complete Organization JSON-LD for site-wide reference
- `article_template{}` — Article schema template with variable placeholders for content production

## Production-Ready JSON-LD Templates

### Organization (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Tenkai Digital Marketing",
  "legalName": "Tenkai Digital Marketing, Inc.",
  "url": "https://www.tenkaidigital.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.tenkaidigital.com/images/tenkai-logo.png",
    "width": 300,
    "height": 80
  },
  "description": "Full-service digital marketing agency specializing in SEO, content strategy, and AI search optimization for B2B SaaS companies.",
  "foundingDate": "2019-06-01",
  "founder": {
    "@type": "Person",
    "name": "Kenji Tanaka",
    "url": "https://www.tenkaidigital.com/team/kenji-tanaka"
  },
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "minValue": 20,
    "maxValue": 50
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "500 Terry A Francois Blvd, Suite 300",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94158",
    "addressCountry": "US"
  },
  "telephone": "+1-415-555-0172",
  "email": "hello@tenkaidigital.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-415-555-0172",
    "contactType": "sales",
    "areaServed": "US",
    "availableLanguage": ["English"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/tenkai-digital",
    "https://twitter.com/tenkaidigital",
    "https://www.facebook.com/tenkaidigital",
    "https://www.youtube.com/@tenkaidigital",
    "https://www.crunchbase.com/organization/tenkai-digital",
    "https://clutch.co/profile/tenkai-digital",
    "https://www.g2.com/products/tenkai-digital/reviews"
  ]
}
```

---

### Article (Blog Post)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Detect Content Decay Before Your Rankings Collapse",
  "description": "A data-driven framework for identifying declining content using Google Search Console, with triage strategies for refresh, rewrite, or retire decisions.",
  "image": {
    "@type": "ImageObject",
    "url": "https://www.tenkaidigital.com/blog/images/content-decay-detection-chart.webp",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "Yumi Sato",
    "url": "https://www.tenkaidigital.com/team/yumi-sato",
    "sameAs": [
      "https://www.linkedin.com/in/yumisato",
      "https://twitter.com/yumisato_seo"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Tenkai Digital Marketing",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.tenkaidigital.com/images/tenkai-logo.png",
      "width": 300,
      "height": 80
    }
  },
  "datePublished": "2026-01-15T08:00:00-08:00",
  "dateModified": "2026-03-20T10:30:00-07:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.tenkaidigital.com/blog/content-decay-detection"
  },
  "wordCount": 2450,
  "articleSection": "Content Strategy"
}
```

---

### LocalBusiness (Location Page)

Use the most specific subtype available. This example uses `Plumber` — replace with `Dentist`, `Restaurant`, `Electrician`, etc. as appropriate.

```json
{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "Greenfield Plumbing & Heating",
  "url": "https://www.greenfieldplumbing.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.greenfieldplumbing.com/images/greenfield-logo.png",
    "width": 300,
    "height": 100
  },
  "image": "https://www.greenfieldplumbing.com/images/storefront.webp",
  "description": "Family-owned plumbing and heating company serving the greater Portland, Oregon area since 1998. Licensed, bonded, and insured.",
  "telephone": "+1-503-555-0198",
  "priceRange": "$$",
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
  "areaServed": [
    { "@type": "City", "name": "Portland" },
    { "@type": "City", "name": "Beaverton" },
    { "@type": "City", "name": "Lake Oswego" },
    { "@type": "City", "name": "Tigard" }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "247",
    "bestRating": "5"
  },
  "sameAs": [
    "https://www.facebook.com/GreenfieldPlumbingPDX",
    "https://www.yelp.com/biz/greenfield-plumbing-and-heating-portland",
    "https://www.bbb.org/us/or/portland/profile/plumber/greenfield-plumbing-heating-1296-12345678",
    "https://nextdoor.com/pages/greenfield-plumbing-heating-portland-or"
  ]
}
```

**Important:** Only include `aggregateRating` if real reviews exist on the page. Fabricating ratings violates Google's guidelines and risks manual action.

---

### BreadcrumbList (All Non-Homepage Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.tenkaidigital.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://www.tenkaidigital.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Content Decay Detection"
    }
  ]
}
```

**Note:** The last item (current page) has `name` but no `item` URL — this is intentional per Google's documentation.

---

### Product + Offer (E-commerce or Service with Pricing)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SEO Site Audit — Comprehensive Technical Analysis",
  "description": "A 50+ page technical SEO audit covering crawlability, Core Web Vitals, schema markup, internal linking, and site architecture. Delivered within 10 business days with prioritized action plan.",
  "image": "https://www.tenkaidigital.com/images/seo-audit-sample-report.webp",
  "brand": {
    "@type": "Organization",
    "name": "Tenkai Digital Marketing"
  },
  "sku": "TENKAI-AUDIT-COMP",
  "offers": {
    "@type": "Offer",
    "url": "https://www.tenkaidigital.com/services/seo-audit",
    "price": "2500.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2026-12-31",
    "seller": {
      "@type": "Organization",
      "name": "Tenkai Digital Marketing"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "38",
    "bestRating": "5"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sarah Mitchell"
      },
      "datePublished": "2026-02-10",
      "reviewBody": "The audit uncovered 23 critical crawl issues we had no idea existed. Traffic increased 31% within 3 months of implementing the recommendations.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  ]
}
```

**Important:** Only include `aggregateRating` and `review` properties if real customer reviews exist. The review content must match reviews actually displayed on the page.

---

### Combining Multiple Types with @graph

When a page needs multiple schema types (e.g., a blog post page needs Article + BreadcrumbList + Organization), combine them in a single `<script>` tag using `@graph`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "How to Detect Content Decay Before Your Rankings Collapse",
      "author": { "@type": "Person", "name": "Yumi Sato", "url": "https://www.tenkaidigital.com/team/yumi-sato" },
      "publisher": { "@type": "Organization", "name": "Tenkai Digital Marketing" },
      "datePublished": "2026-01-15T08:00:00-08:00",
      "dateModified": "2026-03-20T10:30:00-07:00",
      "image": "https://www.tenkaidigital.com/blog/images/content-decay-detection-chart.webp",
      "mainEntityOfPage": "https://www.tenkaidigital.com/blog/content-decay-detection"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.tenkaidigital.com" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.tenkaidigital.com/blog" },
        { "@type": "ListItem", "position": 3, "name": "Content Decay Detection" }
      ]
    }
  ]
}
```

---

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| Recommending FAQ schema for a plumber's website | FAQ rich results restricted to authoritative government and health sites since 2026 | Use Service schema for service pages, Article schema for informational content, LocalBusiness for the business entity |
| Recommending HowTo schema | HowTo rich results completely removed in 2024-2025 | Structure how-to content with clear headings for featured snippet eligibility instead |
| Generating minimal Organization schema (name + url only) | Misses the entity signal opportunity — sameAs, logo, contactPoint are where the value lives | Generate comprehensive Organization with every truthful property: logo, sameAs (all platforms), contactPoint, address, foundingDate, description |
| Copy-pasting one schema block across all pages | Each page should have schema specific to its content and type | Generate per-page or per-template schema. A blog post needs Article; a service page needs Service; a location page needs LocalBusiness |
| Including AggregateRating without real reviews | Violates Google's guidelines — can trigger manual action and penalties | Only include ratings/reviews that exist on the page and come from real customers. Omit AggregateRating if no reviews exist |
| Using Microdata or RDFa instead of JSON-LD | Google prefers JSON-LD; inline markup is error-prone and harder to maintain | Always use JSON-LD in a `<script type="application/ld+json">` tag |
| Generating invalid JSON (missing commas, unclosed brackets) | Invalid schema is actively harmful — it signals technical incompetence to search engines | Validate every JSON-LD block is parseable before delivery. Use a JSON validator as a minimum check |
| Ignoring dateModified on Article schema | AI systems use dateModified for freshness verification — omitting it forfeits AI citation eligibility | Always include dateModified with the actual last-modified date. Update it only when content genuinely changes |
