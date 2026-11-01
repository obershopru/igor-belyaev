// Structured data for search engines and AI answer engines (Google, Яндекс, ChatGPT, Perplexity).
// Facts here must match what the site itself says about Igor — engines cross-check them.

export const SITE_URL = (process.env.SITE_URL || 'https://belyaevigor.ru').replace(/\/+$/, '')
export const SITE_NAME = 'Игорь Беляев — переговоры и продажи'

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const PERSON_ID = `${SITE_URL}/#igor-belyaev`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const credentials = [
  { name: 'Negotiation Mastery Certificate', issuer: 'Harvard Business School', year: '2024' },
  { name: 'Harvard Contract Law Certification', issuer: 'Harvard Law School', year: '2017' },
  { name: 'Entrepreneurial Negotiations Certification', issuer: 'MIT School of Engineering', year: '2018' },
  { name: 'Successful Negotiation Certification', issuer: 'Michigan State University', year: '2019' },
  { name: 'High Performance Collaboration Certification', issuer: 'Northwestern University', year: '2018' },
  { name: 'Sales Strategies Certification', issuer: 'The University of Chicago Booth School of Business', year: '2017' },
]

export const authorBio =
  'Эксперт по переговорам и продажам. Проводит корпоративные тренинги для B2B-команд: как обсуждать цену и условия, выдерживать давление и договариваться без лишних уступок.'

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Игорь Беляев',
    jobTitle: 'Эксперт по переговорам',
    description: authorBio,
    url: SITE_URL,
    image: absoluteUrl('/expert.jpg'),
    sameAs: ['https://www.instagram.com/peregovorigor/'],
    knowsAbout: ['Переговоры', 'B2B-продажи', 'Работа с возражениями', 'Обсуждение цены и скидок', 'Коммерческое предложение'],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'МГТУ им. Н. Э. Баумана' },
    hasCredential: credentials.map((item) => ({
      '@type': 'EducationalOccupationalCredential',
      name: item.name,
      credentialCategory: 'certificate',
      dateCreated: item.year,
      recognizedBy: { '@type': 'CollegeOrUniversity', name: item.issuer },
    })),
  }
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'ru-RU',
    publisher: { '@id': PERSON_ID },
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

// Reads dates typed in the admin panel like "9 ноября, 19:30" as Moscow time. Returns null when the text
// does not follow that pattern, so a free-form date never turns into a wrong date in structured data.
export function parseRussianEventDate(text: string, now = new Date()) {
  const match = text.toLowerCase().match(/(\d{1,2})\s+([а-яё]+)[,\s]+(?:в\s+)?(\d{1,2})[:.](\d{2})/)
  if (!match) return null
  const month = MONTHS.indexOf(match[2])
  const [day, hour, minute] = [Number(match[1]), Number(match[3]), Number(match[4])]
  if (month < 0 || day < 1 || day > 31 || hour > 23 || minute > 59) return null

  const build = (year: number) => new Date(Date.UTC(year, month, day, hour - 3, minute))
  let date = build(now.getUTCFullYear())
  // A date more than two months in the past most likely means next year.
  if (now.getTime() - date.getTime() > 60 * 24 * 60 * 60 * 1000) date = build(now.getUTCFullYear() + 1)
  // Rejects impossible days such as 31 февраля, which Date would silently roll over.
  if (new Date(date.getTime() + 3 * 60 * 60 * 1000).getUTCDate() !== day) return null
  return date
}

export function moscowIso(date: Date) {
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000)
  return `${shifted.toISOString().slice(0, 19)}+03:00`
}
