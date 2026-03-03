import { useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Code2,
  BarChart3,
  Search,
  ShoppingCart,
  Star,
  Tag,
  Trophy,
  HelpCircle,
  Store,
  Check,
  Copy,
} from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white hover:bg-neutral-800"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

const endpoints = [
  { icon: ShoppingCart, name: '/product', desc: 'Title, price, images, specs, ASIN' },
  { icon: Star, name: '/product/reviews', desc: 'Ratings, review text, verified purchase' },
  { icon: Tag, name: '/product/offers', desc: 'Seller offers, prices, Prime status' },
  { icon: Search, name: '/search', desc: 'Search results, sponsored products' },
  { icon: Trophy, name: '/bestsellers', desc: 'Best seller rankings per category' },
  { icon: BarChart3, name: '/category', desc: 'Browse node listings, pagination' },
  { icon: Tag, name: '/deals', desc: 'Lightning deals, coupons' },
  { icon: HelpCircle, name: '/questions', desc: 'Customer Q&A' },
  { icon: Store, name: '/seller', desc: 'Seller profile, ratings, products' },
]

const plans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '',
    requests: '100',
    features: ['100 requests/month', 'All endpoints', 'JSON responses', 'Community support'],
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    requests: '5,000',
    features: ['5,000 requests/month', 'All endpoints', 'Priority queue', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/mo',
    requests: '50,000',
    features: [
      '50,000 requests/month',
      'All endpoints',
      'Priority queue',
      'Webhook support',
      'Dedicated support',
    ],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$299',
    period: '/mo',
    requests: '500,000',
    features: [
      '500,000 requests/month',
      'All endpoints',
      'Top priority queue',
      'Webhook support',
      'Dedicated account manager',
    ],
    highlighted: false,
  },
]

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-5 pt-24 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,103,79,0.08),transparent)]" />
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-6 px-3 py-1 text-sm font-normal">
            Real-time Amazon data API
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1]">
            Amazon product data,
            <br />
            <span className="text-primary">delivered as JSON</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Scrape Amazon product data, search results, reviews, and pricing at scale.
            One API call. Structured JSON. No browser automation on your end.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" render={<Link route="new_account.create" />}>
              Start for free
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#endpoints" />}>
              View endpoints
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            100 free requests. No credit card required.
          </p>
        </div>
      </section>

      {/* Code example */}
      <section className="px-5 pb-24">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-xl border bg-neutral-950 text-neutral-100 overflow-hidden shadow-2xl shadow-black/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
              <div className="size-3 rounded-full bg-neutral-700" />
              <div className="size-3 rounded-full bg-neutral-700" />
              <div className="size-3 rounded-full bg-neutral-700" />
              <span className="ml-2 text-xs text-neutral-500 font-mono">terminal</span>
            </div>
            <div className="relative group">
              <CopyButton text={`curl "https://api.emerald.dev/api/v1/request?\n  type=product&\n  asin=B08J65DST5&\n  amazon_domain=amazon.com" \\\n  -H "Authorization: Bearer em_your_api_key"`} />
              <pre className="p-6 text-sm leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-neutral-500">$ </span>
                  <span className="text-emerald-400">curl</span>
                  {' "https://api.emerald.dev/api/v1/request?\n'}
                  {'  type=product&\n'}
                  {'  asin=B08J65DST5&\n'}
                  {'  amazon_domain=amazon.com" \\\n'}
                  {'  -H '}
                  <span className="text-amber-300">"Authorization: Bearer em_your_api_key"</span>
                </code>
              </pre>
            </div>
            <div className="border-t border-neutral-800 p-6">
              <pre className="text-sm leading-relaxed overflow-x-auto text-neutral-400">
                <code>
{`{
  "product": {
    "title": "Apple AirPods Pro (2nd Generation)",
    "price": { "value": 189.99, "currency": "USD" },
    "rating": 4.7,
    "reviews_count": 92384,
    "asin": "B08J65DST5",
    "in_stock": true,
    "images": ["https://m.media-amazon.com/..."],
    ...
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Why Emerald */}
      <section className="px-5 py-24 bg-neutral-50/60">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">Why Emerald?</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Built for developers who need reliable Amazon data without the infrastructure headache.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Zap className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Fast responses</CardTitle>
                <CardDescription className="mt-1 leading-relaxed">
                  Most requests return in under 3 seconds. We use intelligent routing between
                  Cheerio and Playwright based on page complexity.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Shield className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Anti-block infrastructure</CardTitle>
                <CardDescription className="mt-1 leading-relaxed">
                  Rotating residential proxies, CAPTCHA solving, and automatic retries.
                  We handle blocks so you don't have to.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Globe className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Global coverage</CardTitle>
                <CardDescription className="mt-1 leading-relaxed">
                  Scrape from any Amazon locale — .com, .co.uk, .de, .co.jp, and more.
                  Geo-targeted requests from local proxies.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section id="endpoints" className="px-5 py-24 scroll-mt-10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">Every Amazon data point</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              One unified API for products, reviews, search, pricing, and more.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {endpoints.map((ep) => (
              <Card key={ep.name} className="group hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-md bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                      <ep.icon className="size-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-mono">{ep.name}</CardTitle>
                      <CardDescription className="mt-0.5">{ep.desc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-5 py-24 bg-neutral-50/60">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'border-primary shadow-lg shadow-primary/8 relative'
                    : ''
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-0.5">Most popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardDescription className="font-medium text-foreground">
                    {plan.name}
                  </CardDescription>
                  <div className="mt-2">
                    <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.requests} requests/mo
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlighted ? 'default' : 'outline'}
                    className="w-full mt-6"
                    render={<Link route="new_account.create" />}
                  >
                    Get started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="px-5 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">Works with your stack</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              A simple REST API. If you can make an HTTP request, you can use Emerald.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                lang: 'Node.js',
                code: `const res = await fetch(
  "https://api.emerald.dev/api/v1/request" +
  "?type=product&asin=B08J65DST5",
  {
    headers: {
      Authorization: "Bearer em_your_key"
    }
  }
);
const data = await res.json();`,
              },
              {
                lang: 'Python',
                code: `import requests

res = requests.get(
    "https://api.emerald.dev/api/v1/request",
    params={
        "type": "product",
        "asin": "B08J65DST5"
    },
    headers={
        "Authorization": "Bearer em_your_key"
    }
)
data = res.json()`,
              },
              {
                lang: 'PHP',
                code: `$response = Http::withHeaders([
    'Authorization' => 'Bearer em_your_key'
])->get(
    'https://api.emerald.dev/api/v1/request',
    [
        'type' => 'product',
        'asin' => 'B08J65DST5'
    ]
);
$data = $response->json();`,
              },
            ].map((ex) => (
              <div key={ex.lang} className="rounded-xl border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-neutral-50">
                  <Code2 className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{ex.lang}</span>
                </div>
                <div className="relative group">
                  <CopyButton text={ex.code} />
                  <pre className="p-4 text-xs leading-relaxed overflow-x-auto bg-neutral-950 text-neutral-300">
                    <code>{ex.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to get Amazon data?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Sign up in 30 seconds. Get your API key. Make your first request.
            100 free requests every month — no credit card required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" render={<Link route="new_account.create" />}>
              Create free account
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 border-t">
        <div className="container mx-auto max-w-5xl flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L4 9h16L12 2z" fill="#6EE7B7" />
                <path d="M4 9l8 13 8-13H4z" fill="#10B981" />
                <path d="M8.5 9L12 2l3.5 7L12 22l-3.5-13z" fill="#059669" fillOpacity="0.3" />
              </svg>
              <span className="font-semibold text-sm">emerald</span>
            </div>
          </div>
          <span>&copy; {new Date().getFullYear()} Emerald. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
