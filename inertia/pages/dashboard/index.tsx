import React from 'react'
import { Form } from '@adonisjs/inertia/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Link } from '@adonisjs/inertia/react'
import {
  Activity,
  Key,
  Zap,
  TrendingUp,
  Copy,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Download,
  ArrowUpRight,
} from 'lucide-react'
import { useState } from 'react'

interface ApiKey {
  id: number
  name: string
  key: string
  maskedKey: string
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
}

interface RecentRequest {
  id: number
  type: string
  amazonDomain: string
  asin: string | null
  query: string | null
  status: 'success' | 'error' | 'pending'
  responseCached: boolean
  creditsUsed: number
  errorMessage: string | null
  createdAt: string
}

interface Plan {
  name: string
  slug: string
  requestLimit: number
}

interface DailyUsage {
  date: string
  count: number
}

interface Props {
  apiKeys: ApiKey[]
  plan: Plan
  monthlyUsage: number
  dailyUsage: DailyUsage[]
  successRate: number
  recentRequests: RecentRequest[]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-7 w-7 shrink-0">
      <Copy className="size-3.5" />
      <span className="sr-only">{copied ? 'Copied' : 'Copy'}</span>
    </Button>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'success')
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">success</Badge>
  if (status === 'error')
    return <Badge className="bg-red-100 text-red-700 border-red-200">error</Badge>
  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">pending</Badge>
}

function UsageChart({ data }: { data: DailyUsage[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-[3px] h-32">
      {data.map((d) => {
        const height = Math.max(2, (d.count / max) * 100)
        const label = d.date.slice(5) // MM-DD
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center group relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {label}: {d.count}
            </div>
            <div
              className="w-full rounded-sm bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-default"
              style={{ height: `${height}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

function LimitAlert({ usagePercent, plan }: { usagePercent: number; plan: Plan }) {
  if (usagePercent >= 95) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <XCircle className="size-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-red-800 text-sm">Usage limit almost reached</p>
          <p className="text-red-600 text-xs mt-0.5">
            You've used {usagePercent}% of your {plan.name} plan limit. Upgrade to avoid interruptions.
          </p>
        </div>
      </div>
    )
  }
  if (usagePercent >= 80) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <AlertTriangle className="size-5 text-yellow-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-yellow-800 text-sm">Approaching usage limit</p>
          <p className="text-yellow-600 text-xs mt-0.5">
            You've used {usagePercent}% of your {plan.name} plan limit. Consider upgrading for more requests.
          </p>
        </div>
      </div>
    )
  }
  return null
}

function RequestDetailDialog({ request }: { request: RecentRequest }) {
  const date = new Date(request.createdAt)
  const formatted = date.toLocaleString()

  return (
    <Dialog>
      <DialogTrigger
        className="w-full text-left"
        render={
          <button className="py-2.5 flex items-center gap-3 text-sm w-full hover:bg-neutral-50 -mx-2 px-2 rounded transition-colors cursor-pointer" />
        }
      >
        <Badge variant="outline" className="font-mono text-xs shrink-0">
          {request.type}
        </Badge>
        <span className="flex-1 text-neutral-600 truncate">
          {request.asin ?? request.query ?? '—'}
        </span>
        <span className="text-xs text-neutral-400 shrink-0">{request.amazonDomain}</span>
        {request.responseCached && (
          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 shrink-0">
            cached
          </Badge>
        )}
        <StatusBadge status={request.status} />
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Request #{request.id}</DialogTitle>
          <DialogDescription>Details of this API request</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Type</p>
              <Badge variant="outline" className="font-mono">{request.type}</Badge>
            </div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Status</p>
              <StatusBadge status={request.status} />
            </div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Domain</p>
              <p className="text-neutral-700">{request.amazonDomain}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Credits</p>
              <p className="text-neutral-700">{request.creditsUsed}</p>
            </div>
            {request.asin && (
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">ASIN</p>
                <code className="text-sm font-mono bg-neutral-50 px-1.5 py-0.5 rounded">{request.asin}</code>
              </div>
            )}
            {request.query && (
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Query</p>
                <p className="text-neutral-700">{request.query}</p>
              </div>
            )}
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Cached</p>
              <p className="text-neutral-700">{request.responseCached ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Timestamp</p>
              <p className="text-neutral-700 text-xs">{formatted}</p>
            </div>
          </div>
          {request.errorMessage && (
            <div className="mt-3">
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Error</p>
              <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 whitespace-pre-wrap">
                {request.errorMessage}
              </pre>
            </div>
          )}
        </div>
      </DialogPopup>
    </Dialog>
  )
}

const Dashboard: React.FC<Props> = ({
  apiKeys,
  plan,
  monthlyUsage,
  dailyUsage,
  successRate,
  recentRequests,
}) => {
  const usagePercent = Math.min(100, Math.round((monthlyUsage / plan.requestLimit) * 100))

  return (
    <div className="container mx-auto px-5 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Manage your API keys and monitor usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {plan.name}
          </Badge>
          <Button variant="ghost" size="sm" render={<Link route={'billing.index' as any} />}>
            Upgrade
            <ArrowUpRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>

      <LimitAlert usagePercent={usagePercent} plan={plan} />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Requests this month</CardDescription>
              <Activity className="size-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl font-semibold">
              {monthlyUsage.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-neutral-500">
              of {plan.requestLimit.toLocaleString()} limit
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Remaining</CardDescription>
              <Zap className="size-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl font-semibold">
              {Math.max(0, plan.requestLimit - monthlyUsage).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-neutral-500">{usagePercent}% used</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Success rate</CardDescription>
              <CheckCircle className="size-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl font-semibold">{successRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-neutral-500">last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Active API keys</CardDescription>
              <Key className="size-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl font-semibold">{apiKeys.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-neutral-500">max 5 per account</div>
          </CardContent>
        </Card>
      </div>

      {/* Usage chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily requests</CardTitle>
              <CardDescription className="mt-1">Last 30 days</CardDescription>
            </div>
            <BarChart3 className="size-4 text-neutral-400" />
          </div>
        </CardHeader>
        <CardContent>
          <UsageChart data={dailyUsage} />
          <div className="flex justify-between mt-2 text-[10px] text-neutral-400">
            <span>{dailyUsage[0]?.date.slice(5)}</span>
            <span>{dailyUsage[Math.floor(dailyUsage.length / 2)]?.date.slice(5)}</span>
            <span>{dailyUsage[dailyUsage.length - 1]?.date.slice(5)}</span>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription className="mt-1">
                Use your API key to authenticate requests
              </CardDescription>
            </div>
            {apiKeys.length < 5 && (
              <Form route="api_keys.store">
                <Button size="sm" type="submit">
                  <Plus className="size-4 mr-1.5" />
                  New key
                </Button>
              </Form>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <Key className="size-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No API keys yet.</p>
              <Form route="api_keys.store" className="mt-4 flex justify-center">
                <Button size="sm" type="submit">
                  Generate your first key
                </Button>
              </Form>
            </div>
          ) : (
            <div className="divide-y">
              {apiKeys.map((k) => (
                <div key={k.id} className="py-3 flex items-center gap-3">
                  <code className="flex-1 font-mono text-sm bg-neutral-50 border rounded px-3 py-1.5 text-neutral-700 truncate">
                    {k.maskedKey}
                  </code>
                  <CopyButton text={k.key} />
                  <Form route={'api_keys.rotate' as any} routeParams={{ id: k.id }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      className="h-7 w-7 text-neutral-400 hover:text-emerald-500"
                      title="Rotate key"
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>
                  </Form>
                  <Form route="api_keys.destroy" routeParams={{ id: k.id }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      className="h-7 w-7 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </Form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick start */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <CardDescription>Make your first API request</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
                Product details
              </p>
              <pre className="bg-neutral-950 text-neutral-100 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">{`curl "https://yourapp.com/api/v1/request?type=product&asin=B08J65DST5" \\
  -H "Authorization: Bearer ${apiKeys[0]?.key ?? '<your-api-key>'}"`}</pre>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
                Search results
              </p>
              <pre className="bg-neutral-950 text-neutral-100 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">{`curl "https://yourapp.com/api/v1/request?type=search&search_term=iphone+15" \\
  -H "Authorization: Bearer ${apiKeys[0]?.key ?? '<your-api-key>'}"`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent requests — clickable rows with detail dialog */}
      {recentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent requests</CardTitle>
                <CardDescription className="mt-1">Last 20 API calls — click for details</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<a href="/export/requests" />}
                >
                  <Download className="size-3.5 mr-1.5" />
                  Export CSV
                </Button>
                <TrendingUp className="size-4 text-neutral-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentRequests.map((r) => (
                <RequestDetailDialog key={r.id} request={r} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
