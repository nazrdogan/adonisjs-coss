import type { AxiosProxyConfig } from 'axios'

interface GeoInfo {
  countryCode: string
  locale: string
  acceptLanguage: string
}

const DOMAIN_GEO_MAP: Record<string, GeoInfo> = {
  'amazon.com': { countryCode: 'US', locale: 'en-US', acceptLanguage: 'en-US,en;q=0.9' },
  'amazon.co.uk': { countryCode: 'GB', locale: 'en-GB', acceptLanguage: 'en-GB,en;q=0.9' },
  'amazon.de': { countryCode: 'DE', locale: 'de-DE', acceptLanguage: 'de-DE,de;q=0.9,en;q=0.5' },
  'amazon.fr': { countryCode: 'FR', locale: 'fr-FR', acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.5' },
  'amazon.it': { countryCode: 'IT', locale: 'it-IT', acceptLanguage: 'it-IT,it;q=0.9,en;q=0.5' },
  'amazon.es': { countryCode: 'ES', locale: 'es-ES', acceptLanguage: 'es-ES,es;q=0.9,en;q=0.5' },
  'amazon.ca': { countryCode: 'CA', locale: 'en-CA', acceptLanguage: 'en-CA,en;q=0.9' },
  'amazon.com.au': { countryCode: 'AU', locale: 'en-AU', acceptLanguage: 'en-AU,en;q=0.9' },
  'amazon.co.jp': { countryCode: 'JP', locale: 'ja-JP', acceptLanguage: 'ja-JP,ja;q=0.9,en;q=0.5' },
  'amazon.in': { countryCode: 'IN', locale: 'en-IN', acceptLanguage: 'en-IN,en;q=0.9,hi;q=0.5' },
  'amazon.com.br': { countryCode: 'BR', locale: 'pt-BR', acceptLanguage: 'pt-BR,pt;q=0.9,en;q=0.5' },
  'amazon.com.mx': { countryCode: 'MX', locale: 'es-MX', acceptLanguage: 'es-MX,es;q=0.9,en;q=0.5' },
  'amazon.nl': { countryCode: 'NL', locale: 'nl-NL', acceptLanguage: 'nl-NL,nl;q=0.9,en;q=0.5' },
  'amazon.sg': { countryCode: 'SG', locale: 'en-SG', acceptLanguage: 'en-SG,en;q=0.9' },
  'amazon.se': { countryCode: 'SE', locale: 'sv-SE', acceptLanguage: 'sv-SE,sv;q=0.9,en;q=0.5' },
  'amazon.pl': { countryCode: 'PL', locale: 'pl-PL', acceptLanguage: 'pl-PL,pl;q=0.9,en;q=0.5' },
  'amazon.com.be': { countryCode: 'BE', locale: 'nl-BE', acceptLanguage: 'nl-BE,nl;q=0.9,fr;q=0.7,en;q=0.5' },
  'amazon.com.tr': { countryCode: 'TR', locale: 'tr-TR', acceptLanguage: 'tr-TR,tr;q=0.9,en;q=0.5' },
  'amazon.sa': { countryCode: 'SA', locale: 'ar-SA', acceptLanguage: 'ar-SA,ar;q=0.9,en;q=0.5' },
  'amazon.ae': { countryCode: 'AE', locale: 'en-AE', acceptLanguage: 'en-AE,en;q=0.9,ar;q=0.5' },
  'amazon.eg': { countryCode: 'EG', locale: 'ar-EG', acceptLanguage: 'ar-EG,ar;q=0.9,en;q=0.5' },
}

export class GeoTargetingService {
  private proxyUrls: string[]
  private proxyGeos: string[]

  constructor() {
    const urlsEnv = process.env.SCRAPER_PROXY_URLS
    const singleProxy = process.env.SCRAPER_PROXY_URL

    this.proxyUrls = urlsEnv
      ? urlsEnv.split(',').map((u) => u.trim()).filter(Boolean)
      : singleProxy
        ? [singleProxy]
        : []

    const geosEnv = process.env.SCRAPER_PROXY_GEOS
    this.proxyGeos = geosEnv
      ? geosEnv.split(',').map((g) => g.trim())
      : this.proxyUrls.map(() => '*')
  }

  getGeoInfo(domain: string): GeoInfo {
    return DOMAIN_GEO_MAP[domain] ?? DOMAIN_GEO_MAP['amazon.com']
  }

  getAcceptLanguage(domain: string): string {
    return this.getGeoInfo(domain).acceptLanguage
  }

  getLocale(domain: string): string {
    return this.getGeoInfo(domain).locale
  }

  getCountryCode(domain: string): string {
    return this.getGeoInfo(domain).countryCode
  }

  selectProxy(domain: string): AxiosProxyConfig | undefined {
    if (this.proxyUrls.length === 0) return undefined

    const targetGeo = this.getCountryCode(domain)

    // Find proxies matching the target geo
    const geoMatches: number[] = []
    const wildcards: number[] = []

    for (let i = 0; i < this.proxyUrls.length; i++) {
      const geo = this.proxyGeos[i] ?? '*'
      if (geo === targetGeo) {
        geoMatches.push(i)
      } else if (geo === '*') {
        wildcards.push(i)
      }
    }

    // Prefer geo-specific proxies, fall back to wildcards, fall back to random
    const candidates = geoMatches.length > 0
      ? geoMatches
      : wildcards.length > 0
        ? wildcards
        : Array.from({ length: this.proxyUrls.length }, (_, i) => i)

    const chosenIdx = candidates[Math.floor(Math.random() * candidates.length)]
    return this.parseProxyUrl(this.proxyUrls[chosenIdx])
  }

  selectProxyUrl(domain: string): string | undefined {
    if (this.proxyUrls.length === 0) return undefined

    const targetGeo = this.getCountryCode(domain)

    const geoMatches: number[] = []
    const wildcards: number[] = []

    for (let i = 0; i < this.proxyUrls.length; i++) {
      const geo = this.proxyGeos[i] ?? '*'
      if (geo === targetGeo) {
        geoMatches.push(i)
      } else if (geo === '*') {
        wildcards.push(i)
      }
    }

    const candidates = geoMatches.length > 0
      ? geoMatches
      : wildcards.length > 0
        ? wildcards
        : Array.from({ length: this.proxyUrls.length }, (_, i) => i)

    const chosenIdx = candidates[Math.floor(Math.random() * candidates.length)]
    return this.proxyUrls[chosenIdx]
  }

  private parseProxyUrl(url: string): AxiosProxyConfig {
    const parsed = new URL(url)
    return {
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.hostname,
      port: Number.parseInt(parsed.port || '80'),
      auth: parsed.username
        ? { username: decodeURIComponent(parsed.username), password: decodeURIComponent(parsed.password) }
        : undefined,
    }
  }
}
