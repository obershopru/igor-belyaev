// Mentoring programme "Три шкалы влияния": facts for the /mentoring landing and the application form.
// Shared by the page, the client form and the API, so keep it free of server-only imports.

// The price is not published on the site: it is named on the call after the application.
export const mentoringProgram = {
  groupSize: 30,
  // Not approved with Igor yet. Each value is shown on the page only once it is filled in,
  // e.g. duration: '1 месяц', schedule: 'каждую неделю по 2 часа', start: '15 января'.
  duration: null as string | null,
  schedule: null as string | null,
  personalSessions: null as string | null,
  prepTurnaround: null as string | null,
  start: null as string | null,
  payment: null as string | null,
}

type TextQuestion = { id: string; label: string; hint?: string; kind: 'text' | 'textarea'; placeholder: string; maxLength: number }
type ChoiceQuestion = { id: string; label: string; hint?: string; kind: 'choice'; options: readonly string[] }
export type MentoringQuestion = TextQuestion | ChoiceQuestion

// The five questions Igor names in lesson 3: who you are, deal size, main task, negotiations per week, why now.
export const mentoringQuestions: readonly MentoringQuestion[] = [
  {
    id: 'role',
    label: 'Кто вы',
    hint: 'Должность и чем занимается компания',
    kind: 'text',
    placeholder: 'Например: коммерческий директор, поставки оборудования',
    maxLength: 200,
  },
  {
    id: 'dealSize',
    label: 'Какого размера обычно ваши сделки',
    kind: 'choice',
    options: ['До 500 тыс. ₽', '500 тыс. – 3 млн ₽', '3–10 млн ₽', 'Больше 10 млн ₽'],
  },
  {
    id: 'task',
    label: 'Главная переговорная задача на ближайшие месяцы',
    hint: 'Без названий компаний',
    kind: 'textarea',
    placeholder: 'Например: продлить договор с крупным клиентом, который требует скидку 15%',
    maxLength: 1500,
  },
  {
    id: 'frequency',
    label: 'Сколько переговоров о деньгах и условиях у вас в неделю',
    kind: 'choice',
    options: ['Меньше одного', '1–3', '4–10', 'Больше 10'],
  },
  {
    id: 'whyNow',
    label: 'Почему сейчас',
    kind: 'textarea',
    placeholder: 'Что происходит, из-за чего вы решили заняться переговорами',
    maxLength: 1500,
  },
]

export type MentoringAnswers = Record<string, string>

// Request bodies are untrusted: every question must be answered, free text is trimmed and capped,
// choices must be one of the listed options. Returns null when something is missing.
export function parseMentoringAnswers(value: unknown): MentoringAnswers | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const answers: MentoringAnswers = {}
  for (const question of mentoringQuestions) {
    const raw = input[question.id]
    const text = typeof raw === 'string' ? raw.trim() : ''
    if (!text) return null
    if (question.kind === 'choice') {
      if (!question.options.includes(text)) return null
      answers[question.id] = text
    } else {
      if (text.length > question.maxLength) return null
      answers[question.id] = text
    }
  }
  return answers
}

export function mentoringQuestionLabel(id: string) {
  return mentoringQuestions.find((question) => question.id === id)?.label ?? id
}
