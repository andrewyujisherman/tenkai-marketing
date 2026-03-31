// ============================================================
// NAP (Name, Address, Phone) Directory Consistency Checker
// Searches top business directories via Serper API and compares
// listed NAP info against the client's source of truth.
// ============================================================

import { searchSerp } from './serper'

// --------------- Types ---------------

export interface DirectoryListing {
  directory: string
  found: boolean
  url: string | null
  nameMatch: boolean | null
  addressMatch: boolean | null
  phoneMatch: boolean | null
  extractedName: string | null
  extractedAddress: string | null
  extractedPhone: string | null
  snippet: string | null
}

export interface NAPConsistencyReport {
  businessName: string
  sourceOfTruth: { name: string; address: string; phone: string }
  directories: DirectoryListing[]
  consistencyScore: number // 0-100
  issues: string[] // human-readable list of inconsistencies
}

// --------------- Directory Config ---------------

interface DirectoryDef {
  name: string
  siteFilter: string
}

const DIRECTORIES: DirectoryDef[] = [
  { name: 'Yelp', siteFilter: 'site:yelp.com' },
  { name: 'Facebook', siteFilter: 'site:facebook.com' },
  { name: 'Bing Places', siteFilter: 'site:bing.com/maps' },
  { name: 'BBB', siteFilter: 'site:bbb.org' },
  { name: 'Yellow Pages', siteFilter: 'site:yellowpages.com' },
  { name: 'Angi', siteFilter: 'site:angi.com' },
  { name: 'Thumbtack', siteFilter: 'site:thumbtack.com' },
  { name: 'MapQuest', siteFilter: 'site:mapquest.com' },
]

// --------------- Normalization Helpers ---------------

/** Strip to digits only for phone comparison */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Strip leading country code "1" if 11 digits
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1)
  }
  return digits
}

/** Normalize address for fuzzy comparison */
function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\broad\b/g, 'rd')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bcourt\b/g, 'ct')
    .replace(/\bplace\b/g, 'pl')
    .replace(/\bsuite\b/gi, 'ste')
    .replace(/\bapartment\b/gi, 'apt')
    .replace(/\bnorth\b/g, 'n')
    .replace(/\bsouth\b/g, 's')
    .replace(/\beast\b/g, 'e')
    .replace(/\bwest\b/g, 'w')
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Normalize business name for comparison */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(llc|inc|corp|ltd|co|company)\b\.?/g, '')
    .replace(/[''`]/g, '')
    .replace(/[&]/g, 'and')
    .replace(/[.,\-!]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Fuzzy match: checks if normalized strings share substantial content */
function fuzzyMatch(a: string, b: string): boolean {
  if (!a || !b) return false
  if (a === b) return true
  // One contains the other
  if (a.includes(b) || b.includes(a)) return true
  // Token overlap — if 60%+ of words match, consider it a match
  const aTokens = a.split(' ').filter(Boolean)
  const bTokens = new Set(b.split(' ').filter(Boolean))
  if (aTokens.length === 0) return false
  const overlap = aTokens.filter((t) => bTokens.has(t)).length
  return overlap / Math.max(aTokens.length, bTokens.size) >= 0.6
}

// --------------- Extraction Helpers ---------------

/** Extract phone number from text (US format) */
function extractPhone(text: string): string | null {
  // Match common US phone patterns
  const patterns = [
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
    /\d{3}[\s.-]\d{3}[\s.-]\d{4}/,
    /\+?1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  return null
}

/** Extract a street address from text (heuristic) */
function extractAddress(text: string): string | null {
  // Match patterns like "123 Main St" or "123 Main Street, City, ST 12345"
  const pattern = /\d+\s+[\w\s]+(?:st|ave|blvd|dr|rd|ln|ct|pl|way|pkwy|cir|hwy|street|avenue|boulevard|drive|road|lane|court|place)[\w\s,]*(?:\d{5}(?:-\d{4})?)?/i
  const match = text.match(pattern)
  if (match) return match[0].trim()
  return null
}

/** Extract business name from a search result title (strip directory suffix) */
function extractBusinessName(title: string, directory: string): string {
  // Remove common directory suffixes like " - Yelp", " | Facebook", " | BBB"
  return title
    .replace(new RegExp(`\\s*[-|–—]\\s*${directory}.*$`, 'i'), '')
    .replace(/\s*[-|–—]\s*(Yelp|Facebook|BBB|Yellow Pages|Angi|Thumbtack|MapQuest|Bing|Better Business Bureau).*$/i, '')
    .replace(/\s*\|\s*.*$/, '')
    .trim()
}

// --------------- Core Logic ---------------

async function checkDirectory(
  dir: DirectoryDef,
  businessName: string,
  city: string,
  state: string,
  truthName: string,
  truthAddress: string,
  truthPhone: string
): Promise<DirectoryListing> {
  const query = `${dir.siteFilter} "${businessName}" "${city} ${state}"`

  try {
    const serpData = await searchSerp(query, { num: 3 })

    if (serpData.error || serpData.organic.length === 0) {
      return {
        directory: dir.name,
        found: false,
        url: null,
        nameMatch: null,
        addressMatch: null,
        phoneMatch: null,
        extractedName: null,
        extractedAddress: null,
        extractedPhone: null,
        snippet: null,
      }
    }

    // Take the first result as the most likely match
    const top = serpData.organic[0]
    const combinedText = `${top.title} ${top.snippet}`

    const extractedName = extractBusinessName(top.title, dir.name)
    const extractedAddress = extractAddress(combinedText)
    const extractedPhone = extractPhone(combinedText)

    // Compare against source of truth
    const nameMatch = fuzzyMatch(normalizeName(extractedName), truthName)

    let addressMatch: boolean | null = null
    if (extractedAddress) {
      addressMatch = fuzzyMatch(normalizeAddress(extractedAddress), truthAddress)
    }

    let phoneMatch: boolean | null = null
    if (extractedPhone) {
      phoneMatch = normalizePhone(extractedPhone) === truthPhone
    }

    return {
      directory: dir.name,
      found: true,
      url: top.link,
      nameMatch,
      addressMatch,
      phoneMatch,
      extractedName,
      extractedAddress,
      extractedPhone,
      snippet: top.snippet,
    }
  } catch {
    return {
      directory: dir.name,
      found: false,
      url: null,
      nameMatch: null,
      addressMatch: null,
      phoneMatch: null,
      extractedName: null,
      extractedAddress: null,
      extractedPhone: null,
      snippet: null,
    }
  }
}

/**
 * Check NAP consistency across top business directories.
 * Searches each directory via Serper API in parallel and compares
 * extracted NAP data against the provided source of truth.
 */
export async function checkNAPConsistency(
  businessName: string,
  address: string,
  phone: string,
  city: string,
  state: string
): Promise<NAPConsistencyReport> {
  const truthName = normalizeName(businessName)
  const truthAddress = normalizeAddress(address)
  const truthPhone = normalizePhone(phone)

  // Search all directories in parallel
  const directoryResults = await Promise.all(
    DIRECTORIES.map((dir) =>
      checkDirectory(dir, businessName, city, state, truthName, truthAddress, truthPhone)
    )
  )

  // Calculate consistency score and collect issues
  const issues: string[] = []
  let totalChecks = 0
  let consistentChecks = 0

  for (const listing of directoryResults) {
    if (!listing.found) {
      issues.push(`${listing.directory}: Business not found — consider creating a listing`)
      continue
    }

    if (listing.nameMatch !== null) {
      totalChecks++
      if (listing.nameMatch) {
        consistentChecks++
      } else {
        issues.push(`${listing.directory}: Name mismatch — found "${listing.extractedName}" vs "${businessName}"`)
      }
    }

    if (listing.addressMatch !== null) {
      totalChecks++
      if (listing.addressMatch) {
        consistentChecks++
      } else {
        issues.push(`${listing.directory}: Address mismatch — found "${listing.extractedAddress}" vs "${address}"`)
      }
    }

    if (listing.phoneMatch !== null) {
      totalChecks++
      if (listing.phoneMatch) {
        consistentChecks++
      } else {
        issues.push(`${listing.directory}: Phone mismatch — found "${listing.extractedPhone}" vs "${phone}"`)
      }
    }

    // If found but couldn't extract address or phone, note it
    if (listing.found && listing.addressMatch === null && listing.phoneMatch === null) {
      issues.push(`${listing.directory}: Found listing but could not extract address/phone from snippet — manual verification recommended`)
    }
  }

  const consistencyScore = totalChecks > 0
    ? Math.round((consistentChecks / totalChecks) * 100)
    : 0

  return {
    businessName,
    sourceOfTruth: { name: businessName, address, phone },
    directories: directoryResults,
    consistencyScore,
    issues,
  }
}
