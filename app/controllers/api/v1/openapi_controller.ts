import type { HttpContext } from '@adonisjs/core/http'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

export default class OpenApiController {
  async spec({ response }: HttpContext) {
    const specPath = join(app.makePath('resources'), 'openapi.json')
    const content = await readFile(specPath, 'utf-8')
    return response.header('Content-Type', 'application/json').send(content)
  }

  async docs({ response }: HttpContext) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emerald API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { display: none !important; }
    .swagger-ui .info .title { font-size: 1.5rem; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/v1/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
    });
  </script>
</body>
</html>`

    return response.header('Content-Type', 'text/html').send(html)
  }
}
