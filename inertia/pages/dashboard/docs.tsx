import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tabs, TabsList, TabsTab, TabsPanel } from '~/components/ui/tabs'
import { Copy } from 'lucide-react'

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group">
      <pre className="bg-neutral-950 text-neutral-100 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
        {text}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={copy}
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
      >
        <Copy className="size-3.5" />
      </Button>
      {copied && (
        <span className="absolute top-2.5 right-10 text-[10px] text-emerald-400">Copied!</span>
      )}
    </div>
  )
}

interface EndpointDoc {
  type: string
  description: string
  requiredParams: { name: string; description: string }[]
  optionalParams: { name: string; description: string }[]
  exampleAsin?: string
}

const ENDPOINTS: EndpointDoc[] = [
  {
    type: 'product',
    description: 'Get detailed product data including title, price, images, features, and specifications.',
    requiredParams: [{ name: 'asin', description: 'Amazon Standard Identification Number (10-character alphanumeric)' }],
    optionalParams: [
      { name: 'amazon_domain', description: 'Amazon marketplace domain (default: amazon.com)' },
    ],
    exampleAsin: 'B08J65DST5',
  },
  {
    type: 'search',
    description: 'Search Amazon and get structured results with prices, ratings, and Prime status.',
    requiredParams: [{ name: 'search_term', description: 'The search query' }],
    optionalParams: [
      { name: 'page', description: 'Page number (default: 1)' },
      { name: 'amazon_domain', description: 'Amazon marketplace domain' },
    ],
  },
  {
    type: 'reviews',
    description: 'Get customer reviews for a product including ratings, verified purchase status, and helpful votes.',
    requiredParams: [{ name: 'asin', description: 'Product ASIN' }],
    optionalParams: [
      { name: 'page', description: 'Page number (default: 1)' },
      { name: 'amazon_domain', description: 'Amazon marketplace domain' },
    ],
    exampleAsin: 'B08J65DST5',
  },
  {
    type: 'offers',
    description: 'Get all seller offers for a product including prices, conditions, and shipping info.',
    requiredParams: [{ name: 'asin', description: 'Product ASIN' }],
    optionalParams: [{ name: 'amazon_domain', description: 'Amazon marketplace domain' }],
    exampleAsin: 'B08J65DST5',
  },
  {
    type: 'category',
    description: 'Browse products by category (browse node) with pagination.',
    requiredParams: [{ name: 'browse_node_id', description: 'Amazon browse node ID' }],
    optionalParams: [
      { name: 'page', description: 'Page number (default: 1)' },
      { name: 'amazon_domain', description: 'Amazon marketplace domain' },
    ],
  },
  {
    type: 'bestsellers',
    description: 'Get best seller rankings for a category or all of Amazon.',
    requiredParams: [],
    optionalParams: [
      { name: 'category', description: 'Category slug (e.g. "electronics")' },
      { name: 'amazon_domain', description: 'Amazon marketplace domain' },
    ],
  },
  {
    type: 'deals',
    description: 'Get current deals, lightning deals, and coupons.',
    requiredParams: [],
    optionalParams: [{ name: 'amazon_domain', description: 'Amazon marketplace domain' }],
  },
  {
    type: 'questions',
    description: 'Get customer questions and answers for a product.',
    requiredParams: [{ name: 'asin', description: 'Product ASIN' }],
    optionalParams: [
      { name: 'page', description: 'Page number (default: 1)' },
      { name: 'amazon_domain', description: 'Amazon marketplace domain' },
    ],
    exampleAsin: 'B08J65DST5',
  },
  {
    type: 'seller',
    description: 'Get seller profile information including ratings and feedback.',
    requiredParams: [{ name: 'seller_id', description: 'Amazon seller ID' }],
    optionalParams: [{ name: 'amazon_domain', description: 'Amazon marketplace domain' }],
  },
]

const SUPPORTED_DOMAINS = [
  'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it',
  'amazon.es', 'amazon.ca', 'amazon.com.au', 'amazon.co.jp', 'amazon.in',
  'amazon.com.br', 'amazon.com.mx', 'amazon.nl', 'amazon.sg', 'amazon.se',
  'amazon.pl', 'amazon.com.be', 'amazon.com.tr', 'amazon.sa', 'amazon.ae', 'amazon.eg',
]

function buildExampleUrl(ep: EndpointDoc): string {
  const params: string[] = [`type=${ep.type}`]
  if (ep.exampleAsin) params.push(`asin=${ep.exampleAsin}`)
  if (ep.type === 'search') params.push('search_term=wireless+headphones')
  if (ep.type === 'category') params.push('browse_node_id=172282')
  if (ep.type === 'seller') params.push('seller_id=A2R2RITDJNW1Q6')
  return `https://yourapp.com/api/v1/request?${params.join('&')}`
}

function EndpointSection({ ep }: { ep: EndpointDoc }) {
  const url = buildExampleUrl(ep)
  const curlExample = `curl "${url}" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`
  const nodeExample = `const res = await fetch("${url}", {
  headers: { "Authorization": "Bearer YOUR_API_KEY" }
});
const data = await res.json();
console.log(data);`
  const pythonExample = `import requests

res = requests.get("${url}", headers={
    "Authorization": "Bearer YOUR_API_KEY"
})
data = res.json()
print(data)`

  return (
    <Card id={ep.type} className="scroll-mt-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-sm px-2.5">
            {ep.type}
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">GET</Badge>
        </div>
        <CardDescription className="mt-2">{ep.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parameters */}
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Parameters</p>
          <div className="border rounded-lg divide-y text-sm">
            <div className="grid grid-cols-[120px_80px_1fr] gap-3 px-3 py-2 bg-neutral-50 text-xs text-neutral-500 font-medium">
              <span>Name</span>
              <span>Required</span>
              <span>Description</span>
            </div>
            {ep.requiredParams.map((p) => (
              <div key={p.name} className="grid grid-cols-[120px_80px_1fr] gap-3 px-3 py-2">
                <code className="text-xs font-mono text-emerald-700">{p.name}</code>
                <Badge className="bg-red-100 text-red-600 border-red-200 text-[10px] w-fit">required</Badge>
                <span className="text-xs text-neutral-600">{p.description}</span>
              </div>
            ))}
            {ep.optionalParams.map((p) => (
              <div key={p.name} className="grid grid-cols-[120px_80px_1fr] gap-3 px-3 py-2">
                <code className="text-xs font-mono text-neutral-600">{p.name}</code>
                <Badge variant="outline" className="text-[10px] w-fit">optional</Badge>
                <span className="text-xs text-neutral-600">{p.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code examples */}
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Example</p>
          <Tabs defaultValue="curl">
            <TabsList variant="underline">
              <TabsTab value="curl">cURL</TabsTab>
              <TabsTab value="node">Node.js</TabsTab>
              <TabsTab value="python">Python</TabsTab>
            </TabsList>
            <TabsPanel value="curl" className="mt-3">
              <CopyBlock text={curlExample} />
            </TabsPanel>
            <TabsPanel value="node" className="mt-3">
              <CopyBlock text={nodeExample} />
            </TabsPanel>
            <TabsPanel value="python" className="mt-3">
              <CopyBlock text={pythonExample} />
            </TabsPanel>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

const Docs: React.FC = () => {
  return (
    <div className="container mx-auto px-5 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">API Documentation</h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          Complete reference for the Emerald API
        </p>
      </div>

      {/* Auth section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>All API requests require authentication via API key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-neutral-600">
            Pass your API key via the <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">Authorization</code> header or the <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">api_key</code> query parameter.
          </p>
          <CopyBlock
            text={`# Header (recommended)\ncurl "https://yourapp.com/api/v1/request?type=product&asin=B08J65DST5" \\\n  -H "Authorization: Bearer em_your_api_key_here"\n\n# Query parameter\ncurl "https://yourapp.com/api/v1/request?type=product&asin=B08J65DST5&api_key=em_your_api_key_here"`}
          />
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="bg-neutral-100 px-3 py-2 rounded-lg font-mono text-sm block">
            GET /api/v1/request?type=&#123;type&#125;&amp;...params
          </code>
          <p className="text-sm text-neutral-500 mt-3">
            All endpoints use a single URL with the <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">type</code> parameter to specify the data you want.
          </p>
        </CardContent>
      </Card>

      {/* Supported domains */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Supported Amazon Domains</CardTitle>
          <CardDescription>Pass via the <code className="font-mono text-xs">amazon_domain</code> parameter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_DOMAINS.map((d) => (
              <Badge key={d} variant="outline" className="font-mono text-xs">
                {d}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick nav */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>9 data types available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ENDPOINTS.map((ep) => (
              <a
                key={ep.type}
                href={`#${ep.type}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm hover:bg-neutral-50 transition-colors"
              >
                <code className="font-mono text-emerald-700">{ep.type}</code>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Endpoint sections */}
      <div className="space-y-6">
        {ENDPOINTS.map((ep) => (
          <EndpointSection key={ep.type} ep={ep} />
        ))}
      </div>

      {/* Rate limiting */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 mb-3">
            Requests are rate-limited per API key based on your plan:
          </p>
          <div className="border rounded-lg divide-y text-sm">
            <div className="grid grid-cols-3 gap-3 px-3 py-2 bg-neutral-50 text-xs text-neutral-500 font-medium">
              <span>Plan</span>
              <span>Per second</span>
              <span>Per month</span>
            </div>
            {[
              { plan: 'Free', rps: 1, monthly: '100' },
              { plan: 'Starter', rps: 5, monthly: '5,000' },
              { plan: 'Growth', rps: 10, monthly: '50,000' },
              { plan: 'Pro', rps: 25, monthly: '500,000' },
            ].map((r) => (
              <div key={r.plan} className="grid grid-cols-3 gap-3 px-3 py-2">
                <span className="font-medium">{r.plan}</span>
                <span className="text-neutral-600">{r.rps} req/s</span>
                <span className="text-neutral-600">{r.monthly}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            When rate limited, the API returns HTTP 429 with a <code className="font-mono">retry_after_ms</code> field.
          </p>
        </CardContent>
      </Card>

      {/* Error codes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg divide-y text-sm">
            <div className="grid grid-cols-[80px_160px_1fr] gap-3 px-3 py-2 bg-neutral-50 text-xs text-neutral-500 font-medium">
              <span>HTTP</span>
              <span>Error</span>
              <span>Description</span>
            </div>
            {[
              { http: 401, error: 'api_key_missing', desc: 'No API key provided' },
              { http: 401, error: 'api_key_invalid', desc: 'Invalid or revoked key' },
              { http: 422, error: 'invalid_type', desc: 'Unknown request type' },
              { http: 422, error: 'invalid_domain', desc: 'Unsupported Amazon domain' },
              { http: 422, error: 'missing_*', desc: 'Required parameter missing' },
              { http: 429, error: 'rate_limit_exceeded', desc: 'Per-second limit exceeded' },
              { http: 429, error: 'monthly_limit_exceeded', desc: 'Monthly plan limit reached' },
              { http: 502, error: 'scraping_failed', desc: 'Failed to fetch data from Amazon' },
            ].map((e) => (
              <div key={e.error} className="grid grid-cols-[80px_160px_1fr] gap-3 px-3 py-2">
                <Badge className={e.http >= 500 ? 'bg-red-100 text-red-700 border-red-200' : e.http >= 400 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}>
                  {e.http}
                </Badge>
                <code className="text-xs font-mono">{e.error}</code>
                <span className="text-neutral-600 text-xs">{e.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Docs
