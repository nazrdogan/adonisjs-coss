export class CsvService {
  flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {}

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (value === null || value === undefined) {
        result[fullKey] = ''
      } else if (Array.isArray(value)) {
        result[fullKey] = value.map((v) =>
          typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)
        ).join('|')
      } else if (typeof value === 'object') {
        const nested = this.flattenObject(value as Record<string, unknown>, fullKey)
        Object.assign(result, nested)
      } else {
        result[fullKey] = String(value)
      }
    }

    return result
  }

  jsonToCsv(data: unknown, columns?: string[]): string {
    // Normalize to array
    const rows = Array.isArray(data) ? data : [data]
    if (rows.length === 0) return ''

    // Flatten each row
    const flatRows = rows.map((row) =>
      typeof row === 'object' && row !== null
        ? this.flattenObject(row as Record<string, unknown>)
        : { value: String(row) }
    )

    // Determine columns
    const allColumns = columns ?? this.collectColumns(flatRows)

    // Build CSV
    const lines: string[] = []

    // Header
    lines.push(allColumns.map((col) => this.escapeField(col)).join(','))

    // Data rows
    for (const row of flatRows) {
      const line = allColumns.map((col) => this.escapeField(row[col] ?? '')).join(',')
      lines.push(line)
    }

    return lines.join('\n')
  }

  private collectColumns(rows: Record<string, string>[]): string[] {
    const seen = new Set<string>()
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        seen.add(key)
      }
    }
    return Array.from(seen)
  }

  private escapeField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
}
