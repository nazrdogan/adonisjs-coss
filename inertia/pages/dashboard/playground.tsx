import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from '~/components/ui/select'
import { Tabs, TabsList, TabsTab, TabsPanel } from '~/components/ui/tabs'
import { Separator } from '~/components/ui/separator'
import {
  Play,
  Loader2,
  Copy,
  CheckCircle,
  Clock,
  Terminal,
  Code2,
  Braces,
  Sparkles,
  ChevronRight,
  Trash2,
  RotateCcw,
  ArrowRight,
  Globe,
  KeyRound,
  FileJson,
  AlignLeft,
  History,
  Zap,
} from 'lucide-react'

const REQUEST_TYPES = [
  {
    value: 'product',
    label: 'Product',
    description: 'Get detailed product information',
    requiredParams: ['asin'] as string[],
    example: { asin: 'B08J65DST5' },
  },
  {
    value: 'search',
    label: 'Search',
    description: 'Search for products',
    requiredParams: ['search_term'] as string[],
    example: { search_term: 'wireless headphones' },
  },
  {
    value: 'reviews',
    label: 'Reviews',
    description: 'Get product reviews',
    requiredParams: ['asin'] as string[],
    example: { asin: 'B08J65DST5' },
  },
  {
    value: 'offers',
    label: 'Offers',
    description: 'Get product offers & pricing',
    requiredParams: ['asin'] as string[],
    example: { asin: 'B08J65DST5' },
  },
  {
    value: 'category',
    label: 'Category',
    description: 'Browse a category node',
    requiredParams: ['browse_node_id'] as string[],
    example: { browse_node_id: '172282' },
  },
  {
    value: 'bestsellers',
    label: 'Bestsellers',
    description: 'Get bestselling products',
    requiredParams: [] as string[],
    example: { category: 'electronics' },
  },
  {
    value: 'deals',
    label: 'Deals',
    description: 'Get current deals',
    requiredParams: [] as string[],
    example: {},
  },
  {
    value: 'questions',
    label: 'Questions',
    description: 'Get product Q&A',
    requiredParams: ['asin'] as string[],
    example: { asin: 'B08J65DST5' },
  },
  {
    value: 'seller',
    label: 'Seller',
    description: 'Get seller information',
    requiredParams: ['seller_id'] as string[],
    example: { seller_id: 'A2R2RITDJNW1Q6' },
  },
]

const DOMAINS = [
  { value: 'amazon.com', flag: 'US' },
  { value: 'amazon.co.uk', flag: 'GB' },
  { value: 'amazon.de', flag: 'DE' },
  { value: 'amazon.fr', flag: 'FR' },
  { value: 'amazon.it', flag: 'IT' },
  { value: 'amazon.es', flag: 'ES' },
  { value: 'amazon.ca', flag: 'CA' },
  { value: 'amazon.com.au', flag: 'AU' },
  { value: 'amazon.co.jp', flag: 'JP' },
  { value: 'amazon.in', flag: 'IN' },
  { value: 'amazon.com.br', flag: 'BR' },
]

interface ApiKey {
  id: number
  name: string
  key: string
  maskedKey: string
}

interface HistoryEntry {
  id: number
  type: string
  domain: string
  params: Record<string, string>
  status: number | null
  timeTaken: number
  timestamp: number
  result: object | null
  error: string | null
}

interface Props {
  apiKeys: ApiKey[]
}

// Simple JSON syntax colorizer
function JsonHighlight({ data }: { data: string }) {
  const colorize = (json: string) => {
    return json.replace(
      /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-300' // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-blue-300' // key
            match = match.slice(0, -1) + ':'
          } else {
            cls = 'text-emerald-300' // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-violet-300' // boolean
        } else if (/null/.test(match)) {
          cls = 'text-neutral-500' // null
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
  }

  return (
    <pre
      className="text-xs leading-relaxed"
      dangerouslySetInnerHTML={{ __html: colorize(data) }}
    />
  )
}

function CopyButton({ text, size = 'default' }: { text: string; size?: 'default' | 'sm' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (size === 'sm') {
    return (
      <button
        onClick={copy}
        className="text-neutral-500 hover:text-neutral-300 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <CheckCircle className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
      </button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-7 w-7 shrink-0">
      {copied ? <CheckCircle className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </Button>
  )
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} size="sm" />
      </div>
      <pre className="bg-neutral-950 text-neutral-100 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">
        <code data-language={language}>{code}</code>
      </pre>
    </div>
  )
}

function StatusCodeBadge({ status }: { status: number | null }) {
  if (!status) return null
  const isOk = status >= 200 && status < 300
  const isClientErr = status >= 400 && status < 500
  const isServerErr = status >= 500

  let classes = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (isClientErr) classes = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  if (isServerErr) classes = 'bg-red-500/10 text-red-400 border-red-500/20'

  return (
    <Badge variant="outline" className={`font-mono text-xs ${classes}`}>
      {status} {isOk ? 'OK' : isClientErr ? 'Client Error' : isServerErr ? 'Server Error' : ''}
    </Badge>
  )
}

const Playground: React.FC<Props> = ({ apiKeys }) => {
  const [type, setType] = useState('product')
  const [domain, setDomain] = useState('amazon.com')
  const [asin, setAsin] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [browseNodeId, setBrowseNodeId] = useState('')
  const [category, setCategory] = useState('')
  const [sellerId, setSellerId] = useState('')
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<object | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [timeTaken, setTimeTaken] = useState<number | null>(null)
  const [responseSize, setResponseSize] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [responseView, setResponseView] = useState<string | number>('pretty')
  const historyIdRef = useRef(0)

  const selectedType = REQUEST_TYPES.find((t) => t.value === type)!
  const selectedKey = apiKeys[selectedKeyIndex]

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {}
    params.type = type
    params.amazon_domain = domain
    if (selectedType.requiredParams.includes('asin') && asin) params.asin = asin
    if (selectedType.requiredParams.includes('search_term') && searchTerm)
      params.search_term = searchTerm
    if (selectedType.requiredParams.includes('browse_node_id') && browseNodeId)
      params.browse_node_id = browseNodeId
    if (type === 'bestsellers' && category) params.category = category
    if (selectedType.requiredParams.includes('seller_id') && sellerId)
      params.seller_id = sellerId
    return params
  }, [type, domain, asin, searchTerm, browseNodeId, category, sellerId, selectedType])

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams(buildParams())
    return `/api/v1/request?${params.toString()}`
  }, [buildParams])

  const fillExample = () => {
    const ex = selectedType.example
    if ('asin' in ex) setAsin(ex.asin as string)
    if ('search_term' in ex) setSearchTerm(ex.search_term as string)
    if ('browse_node_id' in ex) setBrowseNodeId(ex.browse_node_id as string)
    if ('category' in ex) setCategory(ex.category as string)
    if ('seller_id' in ex) setSellerId(ex.seller_id as string)
  }

  const handleSend = async () => {
    if (!selectedKey) return
    setLoading(true)
    setResult(null)
    setError(null)
    setStatusCode(null)
    setTimeTaken(null)
    setResponseSize(null)

    const start = Date.now()
    try {
      const url = buildUrl()
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${selectedKey.key}` },
      })
      const data = await res.json()
      const elapsed = Date.now() - start
      const size = new Blob([JSON.stringify(data)]).size

      setTimeTaken(elapsed)
      setStatusCode(res.status)
      setResponseSize(size)

      if (!res.ok) {
        setError(`HTTP ${res.status}`)
      }
      setResult(data)

      // Add to history
      const entry: HistoryEntry = {
        id: ++historyIdRef.current,
        type,
        domain,
        params: buildParams(),
        status: res.status,
        timeTaken: elapsed,
        timestamp: Date.now(),
        result: data,
        error: !res.ok ? `HTTP ${res.status}` : null,
      }
      setHistory((prev) => [entry, ...prev].slice(0, 10))
    } catch (err) {
      const elapsed = Date.now() - start
      setTimeTaken(elapsed)
      const errMsg = err instanceof Error ? err.message : 'Request failed'
      setError(errMsg)

      const entry: HistoryEntry = {
        id: ++historyIdRef.current,
        type,
        domain,
        params: buildParams(),
        status: null,
        timeTaken: elapsed,
        timestamp: Date.now(),
        result: null,
        error: errMsg,
      }
      setHistory((prev) => [entry, ...prev].slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  const restoreHistoryEntry = (entry: HistoryEntry) => {
    setType(entry.type)
    setDomain(entry.domain)
    if (entry.params.asin) setAsin(entry.params.asin)
    if (entry.params.search_term) setSearchTerm(entry.params.search_term)
    if (entry.params.browse_node_id) setBrowseNodeId(entry.params.browse_node_id)
    if (entry.params.category) setCategory(entry.params.category)
    if (entry.params.seller_id) setSellerId(entry.params.seller_id)
    if (entry.result) {
      setResult(entry.result)
      setStatusCode(entry.status)
      setTimeTaken(entry.timeTaken)
      setError(entry.error)
      setResponseSize(new Blob([JSON.stringify(entry.result)]).size)
    }
  }

  // Keyboard shortcut: Cmd/Ctrl+Enter to send
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!loading && selectedKey) handleSend()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [loading, selectedKey, handleSend])

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'
  const fullUrl = `${origin}${buildUrl()}`
  const apiKeyStr = selectedKey?.key ?? '<your-api-key>'

  const curlCommand = `curl "${fullUrl}" \\
  -H "Authorization: Bearer ${apiKeyStr}"`

  const nodeCommand = `const response = await fetch(
  "${fullUrl}",
  {
    headers: {
      "Authorization": "Bearer ${apiKeyStr}"
    }
  }
);

const data = await response.json();
console.log(data);`

  const pythonCommand = `import requests

response = requests.get(
    "${fullUrl}",
    headers={
        "Authorization": "Bearer ${apiKeyStr}"
    }
)

data = response.json()
print(data)`

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const jsonString = result ? JSON.stringify(result, null, 2) : ''
  const lineCount = jsonString ? jsonString.split('\n').length : 0

  return (
    <div className="container mx-auto px-5 py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">API Playground</h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          Build, test, and debug API requests interactively
        </p>
      </div>

      {/* URL Bar */}
      <div className="mb-6 flex items-center gap-2 bg-neutral-50 border rounded-xl px-4 py-2.5">
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-xs shrink-0">
          GET
        </Badge>
        <code className="text-sm text-neutral-600 font-mono truncate flex-1">
          {buildUrl()}
        </code>
        <Button
          onClick={handleSend}
          disabled={loading || !selectedKey}
          size="sm"
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="size-3.5 mr-1.5 animate-spin" />
          ) : (
            <Play className="size-3.5 mr-1.5" />
          )}
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Left: Request builder */}
        <div className="space-y-4">
          {/* API Key */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              {apiKeys.length > 0 ? (
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="size-3" />
                    API Key
                  </label>
                  <Select
                    value={selectedKeyIndex}
                    onValueChange={(v) => setSelectedKeyIndex(v as number)}
                  >
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {apiKeys.map((k, i) => (
                        <SelectItem key={k.id} value={i}>
                          {k.maskedKey}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </div>
              ) : (
                <div className="text-sm text-neutral-500 bg-neutral-50 border border-dashed rounded-lg p-4 text-center">
                  <KeyRound className="size-5 mx-auto mb-2 text-neutral-400" />
                  No API keys found. Create one from the Dashboard first.
                </div>
              )}

              <Separator />

              {/* Type selector */}
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Braces className="size-3" />
                  Request Type
                </label>
                <Select value={type} onValueChange={(v) => setType(v as string)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {REQUEST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
                <p className="text-xs text-neutral-400 mt-1">{selectedType.description}</p>
              </div>

              {/* Domain */}
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Globe className="size-3" />
                  Domain
                </label>
                <Select value={domain} onValueChange={(v) => setDomain(v as string)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.value}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>

              <Separator />

              {/* Dynamic params */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Parameters
                  </span>
                  {Object.keys(selectedType.example).length > 0 && (
                    <button
                      onClick={fillExample}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="size-3" />
                      Fill example
                    </button>
                  )}
                </div>

                {selectedType.requiredParams.includes('asin') && (
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">
                      ASIN <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={asin}
                      onChange={(e) => setAsin((e.target as HTMLInputElement).value)}
                      placeholder="e.g. B08J65DST5"
                      className="font-mono"
                    />
                  </div>
                )}

                {selectedType.requiredParams.includes('search_term') && (
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">
                      Search term <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                      placeholder="e.g. wireless headphones"
                    />
                  </div>
                )}

                {selectedType.requiredParams.includes('browse_node_id') && (
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">
                      Browse Node ID <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={browseNodeId}
                      onChange={(e) => setBrowseNodeId((e.target as HTMLInputElement).value)}
                      placeholder="e.g. 172282"
                      className="font-mono"
                    />
                  </div>
                )}

                {type === 'bestsellers' && (
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">
                      Category <span className="text-neutral-300">(optional)</span>
                    </label>
                    <Input
                      value={category}
                      onChange={(e) => setCategory((e.target as HTMLInputElement).value)}
                      placeholder="e.g. electronics"
                    />
                  </div>
                )}

                {selectedType.requiredParams.includes('seller_id') && (
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">
                      Seller ID <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={sellerId}
                      onChange={(e) => setSellerId((e.target as HTMLInputElement).value)}
                      placeholder="e.g. A2R2RITDJNW1Q6"
                      className="font-mono"
                    />
                  </div>
                )}

                {selectedType.requiredParams.length === 0 && type !== 'bestsellers' && (
                  <p className="text-xs text-neutral-400 py-2">
                    No required parameters for this request type.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Code Snippets */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <Tabs defaultValue="curl">
                <TabsList variant="underline" className="mb-3">
                  <TabsTab value="curl">
                    <Terminal className="size-3.5" />
                    cURL
                  </TabsTab>
                  <TabsTab value="node">
                    <Code2 className="size-3.5" />
                    Node.js
                  </TabsTab>
                  <TabsTab value="python">
                    <Code2 className="size-3.5" />
                    Python
                  </TabsTab>
                </TabsList>
                <TabsPanel value="curl">
                  <CodeBlock code={curlCommand} language="bash" />
                </TabsPanel>
                <TabsPanel value="node">
                  <CodeBlock code={nodeCommand} language="javascript" />
                </TabsPanel>
                <TabsPanel value="python">
                  <CodeBlock code={pythonCommand} language="python" />
                </TabsPanel>
              </Tabs>
            </CardContent>
          </Card>

          {/* Request History */}
          {history.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-1.5">
                    <History className="size-3" />
                    Recent requests
                  </CardDescription>
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => restoreHistoryEntry(entry)}
                      className="w-full text-left flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-neutral-50 transition-colors group"
                    >
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] shrink-0"
                      >
                        {entry.type}
                      </Badge>
                      <span className="text-xs text-neutral-500 truncate flex-1">
                        {entry.domain}
                      </span>
                      {entry.status && (
                        <span
                          className={`text-[10px] font-mono ${
                            entry.status < 300
                              ? 'text-emerald-500'
                              : entry.status < 500
                                ? 'text-amber-500'
                                : 'text-red-500'
                          }`}
                        >
                          {entry.status}
                        </span>
                      )}
                      {!entry.status && entry.error && (
                        <span className="text-[10px] text-red-400">ERR</span>
                      )}
                      <span className="text-[10px] text-neutral-300">
                        {(entry.timeTaken / 1000).toFixed(1)}s
                      </span>
                      <RotateCcw className="size-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Send shortcut hint */}
          <p className="text-xs text-neutral-400 text-center">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-neutral-100 border rounded text-[10px] font-mono">
              {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-neutral-100 border rounded text-[10px] font-mono">
              Enter
            </kbd>
            {' '}to send
          </p>
        </div>

        {/* Right: Response viewer */}
        <div className="min-w-0">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">Response</CardTitle>
                  {statusCode && <StatusCodeBadge status={statusCode} />}
                </div>
                {result && <CopyButton text={jsonString} />}
              </div>
              {timeTaken !== null && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock className="size-3" />
                    {(timeTaken / 1000).toFixed(2)}s
                  </span>
                  {responseSize !== null && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <FileJson className="size-3" />
                      {formatBytes(responseSize)}
                    </span>
                  )}
                  {lineCount > 0 && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <AlignLeft className="size-3" />
                      {lineCount} lines
                    </span>
                  )}
                </div>
              )}
            </CardHeader>

            {result && (
              <div className="px-6 pb-2">
                <Tabs
                  value={responseView}
                  onValueChange={(v) => setResponseView(v)}
                >
                  <TabsList variant="underline">
                    <TabsTab value="pretty">
                      <Braces className="size-3.5" />
                      Pretty
                    </TabsTab>
                    <TabsTab value="raw">
                      <AlignLeft className="size-3.5" />
                      Raw
                    </TabsTab>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <CardContent>
              {!result && !loading && (
                <div className="text-center py-20 text-neutral-400">
                  <div className="size-12 mx-auto mb-4 rounded-xl bg-neutral-50 flex items-center justify-center">
                    <Zap className="size-5 text-neutral-300" />
                  </div>
                  <p className="text-sm font-medium text-neutral-500">No response yet</p>
                  <p className="text-xs mt-1">Configure your request and hit Send</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-20 text-neutral-400">
                  <Loader2 className="size-8 mx-auto mb-4 animate-spin text-emerald-500" />
                  <p className="text-sm font-medium text-neutral-500">Fetching data...</p>
                  <p className="text-xs mt-1">Scraping from {domain}</p>
                </div>
              )}

              {result && (
                <div className="bg-neutral-950 rounded-lg p-4 overflow-auto max-h-[calc(100vh-320px)]">
                  {responseView === 'pretty' ? (
                    <JsonHighlight data={jsonString} />
                  ) : (
                    <pre className="text-xs text-neutral-100 leading-relaxed whitespace-pre-wrap">
                      {jsonString}
                    </pre>
                  )}
                </div>
              )}

              {error && !result && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-700">Request failed</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Playground
