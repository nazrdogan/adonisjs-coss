import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Plus, Trash2, Send, Eye, EyeOff, Webhook } from 'lucide-react'

interface Endpoint {
  id: number
  url: string
  secret: string
  events: string[]
  isActive: boolean
  createdAt: string
}

interface Delivery {
  id: number
  endpointId: number
  event: string
  status: string
  attempts: number
  lastResponseCode: number | null
  lastError: string | null
  createdAt: string
}

interface Props {
  endpoints: Endpoint[]
  deliveries: Delivery[]
}

const AVAILABLE_EVENTS = ['scrape.completed', 'scrape.failed', 'test']

function SecretReveal({ secret }: { secret: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs font-mono bg-neutral-50 border rounded px-2 py-1 flex-1 truncate">
        {visible ? secret : `${secret.slice(0, 10)}${'•'.repeat(20)}`}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
    </div>
  )
}

function DeliveryStatusBadge({ status }: { status: string }) {
  if (status === 'delivered')
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">delivered</Badge>
  if (status === 'failed')
    return <Badge className="bg-red-100 text-red-700 border-red-200">failed</Badge>
  if (status === 'retrying')
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">retrying</Badge>
  return <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200">pending</Badge>
}

function CreateEndpointForm() {
  const { data, setData, post, processing } = useForm({
    url: '',
    events: ['scrape.completed', 'scrape.failed'] as string[],
  })

  const toggleEvent = (event: string) => {
    if (data.events.includes(event)) {
      setData('events', data.events.filter((e) => e !== event))
    } else {
      setData('events', [...data.events, event])
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        post('/webhooks' as any, { preserveScroll: true })
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Endpoint URL</label>
        <Input
          type="url"
          placeholder="https://your-app.com/webhooks/emerald"
          value={data.url}
          onChange={(e) => setData('url', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-neutral-700 mb-2 block">Events</label>
        <div className="flex flex-wrap gap-3">
          {AVAILABLE_EVENTS.map((event) => (
            <label key={event} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={data.events.includes(event)}
                onCheckedChange={() => toggleEvent(event)}
              />
              <span className="text-sm font-mono">{event}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" size="sm" disabled={processing || !data.url || data.events.length === 0}>
        <Plus className="size-4 mr-1.5" />
        Add endpoint
      </Button>
    </form>
  )
}

const Webhooks: React.FC<Props> = ({ endpoints, deliveries }) => {
  return (
    <div className="container mx-auto px-5 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Webhooks</h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          Receive real-time notifications when scrape jobs complete or fail
        </p>
      </div>

      {/* Create new endpoint */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add webhook endpoint</CardTitle>
          <CardDescription>We'll POST JSON to your URL when events occur</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateEndpointForm />
        </CardContent>
      </Card>

      {/* Existing endpoints */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Endpoints</CardTitle>
              <CardDescription className="mt-1">
                {endpoints.length} of 5 endpoints configured
              </CardDescription>
            </div>
            <Webhook className="size-4 text-neutral-400" />
          </div>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <Webhook className="size-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No webhook endpoints yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {endpoints.map((ep) => (
                <div key={ep.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-neutral-700 truncate flex-1">
                      {ep.url}
                    </code>
                    <div className="flex items-center gap-1 ml-3">
                      <Form
                        route={'webhooks.test' as any}
                        routeParams={{ id: ep.id }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          type="submit"
                          className="h-7 w-7"
                          title="Send test"
                        >
                          <Send className="size-3.5" />
                        </Button>
                      </Form>
                      <Form
                        route={'webhooks.destroy' as any}
                        routeParams={{ id: ep.id }}
                      >
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
                  </div>
                  <SecretReveal secret={ep.secret} />
                  <div className="flex gap-1.5 flex-wrap">
                    {ep.events.map((ev) => (
                      <Badge key={ev} variant="outline" className="text-xs font-mono">
                        {ev}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery log */}
      {deliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent deliveries</CardTitle>
            <CardDescription className="mt-1">Last 50 webhook delivery attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {deliveries.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {d.event}
                  </Badge>
                  <span className="flex-1 text-neutral-500 truncate">
                    Endpoint #{d.endpointId}
                  </span>
                  {d.lastResponseCode && (
                    <span className="text-xs text-neutral-400">HTTP {d.lastResponseCode}</span>
                  )}
                  <span className="text-xs text-neutral-400">
                    {d.attempts} attempt{d.attempts !== 1 ? 's' : ''}
                  </span>
                  <DeliveryStatusBadge status={d.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Webhooks
