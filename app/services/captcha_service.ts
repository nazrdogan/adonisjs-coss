import axios from 'axios'

interface CaptchaInfo {
  detected: boolean
  imageUrl?: string
  formAction?: string
  amzn?: string
  amznR?: string
}

const CAPTCHA_PATTERNS = [
  '/errors/validateCaptcha',
  'Robot Check',
  'Type the characters you see in this image',
  'captcha',
]

export class CaptchaService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.CAPTCHA_2CAPTCHA_API_KEY
  }

  get isConfigured(): boolean {
    return !!this.apiKey
  }

  detectCaptcha(html: string): CaptchaInfo {
    const lowerHtml = html.toLowerCase()

    const hasCaptchaIndicator = CAPTCHA_PATTERNS.some((pattern) =>
      lowerHtml.includes(pattern.toLowerCase())
    )

    if (!hasCaptchaIndicator) {
      return { detected: false }
    }

    // Extract captcha image URL
    const imgMatch = html.match(/src="(https:\/\/images-na\.ssl-images-amazon\.com\/captcha\/[^"]+)"/)
      ?? html.match(/src="(\/captcha\/[^"]+)"/)
    const imageUrl = imgMatch?.[1]

    // Extract form action
    const formMatch = html.match(/action="([^"]*validateCaptcha[^"]*)"/)
    const formAction = formMatch?.[1]

    // Extract hidden fields
    const amznMatch = html.match(/name="amzn"\s+value="([^"]*)"/)
    const amznRMatch = html.match(/name="amzn-r"\s+value="([^"]*)"/)

    return {
      detected: true,
      imageUrl,
      formAction,
      amzn: amznMatch?.[1],
      amznR: amznRMatch?.[1],
    }
  }

  async solveCaptcha(info: CaptchaInfo, baseUrl: string): Promise<string | null> {
    if (!this.apiKey || !info.imageUrl) return null

    const fullImageUrl = info.imageUrl.startsWith('http')
      ? info.imageUrl
      : `${baseUrl}${info.imageUrl}`

    // Download the captcha image
    const imageResponse = await axios.get(fullImageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    })
    const base64Image = Buffer.from(imageResponse.data).toString('base64')

    // Submit to 2Captcha
    const submitResponse = await axios.post('https://2captcha.com/in.php', null, {
      params: {
        key: this.apiKey,
        method: 'base64',
        body: base64Image,
        json: 1,
      },
      timeout: 15000,
    })

    if (submitResponse.data.status !== 1) {
      return null
    }

    const taskId = submitResponse.data.request

    // Poll for solution (5s intervals, 60s max)
    const maxAttempts = 12
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const resultResponse = await axios.get('https://2captcha.com/res.php', {
        params: {
          key: this.apiKey,
          action: 'get',
          id: taskId,
          json: 1,
        },
        timeout: 10000,
      })

      if (resultResponse.data.status === 1) {
        return resultResponse.data.request as string
      }

      if (resultResponse.data.request !== 'CAPCHA_NOT_READY') {
        return null
      }
    }

    return null
  }

  async submitSolution(
    solution: string,
    info: CaptchaInfo,
    baseUrl: string,
    headers: Record<string, string>
  ): Promise<string | null> {
    if (!info.formAction) return null

    const formUrl = info.formAction.startsWith('http')
      ? info.formAction
      : `${baseUrl}${info.formAction}`

    const params = new URLSearchParams()
    params.append('field-keywords', solution)
    if (info.amzn) params.append('amzn', info.amzn)
    if (info.amznR) params.append('amzn-r', info.amznR)

    const response = await axios.get(formUrl, {
      params: Object.fromEntries(params),
      headers,
      maxRedirects: 5,
      timeout: 15000,
    })

    const html = response.data as string

    // Check if we got real content (not another CAPTCHA)
    const recheckCaptcha = this.detectCaptcha(html)
    if (recheckCaptcha.detected) {
      return null
    }

    return html
  }
}
