import * as cheerio from 'cheerio'

export interface Question {
  question: string
  votes: number
  answers_count: number
  top_answer: string | null
}

export interface QuestionsPageResult {
  asin: string
  current_page: number
  questions: Question[]
}

export function parseQuestionsPage(
  html: string,
  asin: string,
  _domain: string,
  page: number
): QuestionsPageResult {
  const $ = cheerio.load(html)
  const questions: Question[] = []

  $('.askTeaserQuestions > div, [id^="question-"]').each((_, el) => {
    const question =
      $(el).find('.a-declarative a[href*="question"] span, .askInlineWidget .a-link-normal').text().trim()

    const votesText = $(el).find('.vote .count').text().trim()
    const votesMatch = votesText.match(/\d+/)
    const votes = votesMatch ? parseInt(votesMatch[0]) : 0

    const answersText = $(el).find('.a-color-tertiary').text().trim()
    const answersMatch = answersText.match(/(\d+)\s*answer/i)
    const answers_count = answersMatch ? parseInt(answersMatch[1]) : 0

    const top_answer = $(el).find('.askLongText, .a-expander-content span').text().trim() || null

    if (question) {
      questions.push({ question, votes, answers_count, top_answer })
    }
  })

  return { asin, current_page: page, questions }
}
