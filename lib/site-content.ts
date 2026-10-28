export type GuideContent = {
  heroTitleLead: string
  heroTitleHighlight: string
  heroDescription: string
  heroButton: string
  expertName: string
  expertCaption: string
  sectionTitle: string
  points: string[]
  footerName: string
  privacyLabel: string
  consentLabel: string
}

export type WorkshopContent = {
  heroTitleLead: string
  heroTitleHighlight: string
  tagline: string
  intro: string
  button: string
  meta: { label: string; value: string }[]
  audienceTitle: string
  audienceIntro: string
  audiences: { title: string; description: string }[]
  casesTitle: string
  casesIntro: string
  caseLabel: string
  taskLabel: string
  workLabel: string
  resultLabel: string
  casesDisclaimer: string
  cases: { title: string; summary: string; task: string; work: string; result: string }[]
  programTitle: string
  program: string[]
  expertName: string
  expertHeadline: string
  expertBio: string[]
  facts: { title: string; note: string }[]
  priceTitle: string
  formatLabel: string
  dateLabel: string
  date: string
  durationLabel: string
  duration: string
  priceLabel: string
  price: string
  formatNote: string
  paymentNote: string
  faqTitle: string
  faq: { q: string; a: string }[]
  contactTitle: string
  contactName: string
  taxId: string
  privacyLabel: string
  consentLabel: string
  offerLabel: string
}

export type SiteContent = {
  guide: GuideContent
  workshop: WorkshopContent
}

export type AnalyticsSettings = {
  yandex: { enabled: boolean; id: string }
  vk: { enabled: boolean; id: string }
}

export const defaultGuideContent: GuideContent = {
  heroTitleLead: 'Бесплатный гайд по переговорам:',
  heroTitleHighlight: '«Пол имеет значение»',
  heroDescription: 'Короткая шпаргалка перед важным разговором: как учитывать гендерную динамику и вести переговоры на своих условиях.',
  heroButton: 'Забрать гайд',
  expertName: 'Игорь Беляев',
  expertCaption: 'Эксперт по переговорам',
  sectionTitle: 'В гайде я рассказал',
  points: [
    'как гендер влияет на жёсткость, риск и реакцию собеседника;',
    'почему одинаковое поведение мужчины и женщины может восприниматься по-разному;',
    'как стереотипы и стресс меняют ход переговоров;',
    'как удерживать позицию, границы и возвращать разговор к фактам.',
  ],
  footerName: 'Игорь Беляев',
  privacyLabel: 'Политика обработки персональных данных',
  consentLabel: 'Согласие на обработку персональных данных',
}

export const defaultWorkshopContent: WorkshopContent = {
  heroTitleLead: 'Уступить нельзя',
  heroTitleHighlight: 'договориться',
  tagline: 'Куда вы поставите запятую?',
  intro: 'Как сохранять сильную позицию в переговорах, обсуждать деньги и условия, выдерживать давление и приходить к конкретным договорённостям.',
  button: 'Оплатить',
  meta: [
    { label: 'Дата и время', value: '9 ноября, 19:30' },
    { label: 'Формат', value: 'Онлайн мастер-класс в Zoom' },
    { label: 'Длительность', value: '2 часа' },
    { label: 'Стоимость участия', value: '9 990 ₽' },
  ],
  audienceTitle: 'Для кого подходит',
  audienceIntro: 'Для тех, кому важно обсуждать сложные условия, сохранять свою позицию и приходить к договорённостям — в работе и личных вопросах.',
  audiences: [
    { title: 'Руководителям и собственникам', description: 'Чтобы договариваться с партнёрами и командой, отстаивать решения и сохранять рабочие отношения.' },
    { title: 'Предпринимателям', description: 'Для переговоров о сделках, долях, условиях сотрудничества и распределении ответственности.' },
    { title: 'Экспертам и специалистам', description: 'Чтобы обсуждать стоимость, условия работы и границы ответственности.' },
    { title: 'Тем, кому предстоят личные переговоры', description: 'Чтобы защищать свои интересы и искать взаимоприемлемые решения в непростых разговорах.' },
  ],
  casesTitle: 'Примеры из практики',
  casesIntro: 'Обезличенные ситуации, в которых подготовка и выстроенная стратегия помогли защитить интересы и договориться об условиях.',
  caseLabel: 'Кейс',
  taskLabel: 'Задача.',
  workLabel: 'Что было сделано.',
  resultLabel: 'Результат.',
  casesDisclaimer: 'Все кейсы обезличены и конфиденциальны.',
  cases: [
    {
      title: 'Коммерческие переговоры: результат выше ожидаемого',
      summary: 'Доля в сделке выросла на 60% вместо запланированных 20%.',
      task: 'Клиент хотел увеличить свою долю в сделке на 20%. Требовалось подготовиться к переговорам и выстроить конкретный сценарий действий на встрече.',
      work: 'Провели полную подготовку: собрали и проанализировали информацию о контрагенте, подготовили материалы и документы, оценили интересы сторон и участников сделки. Построили переговорную карту, разобрали дальнейшие шаги, конкретные формулировки и действия на встрече.',
      result: 'Вместо запланированного увеличения доли на 20% клиент получил увеличение на 60% — на 40% выше ожидаемого результата.',
    },
    {
      title: 'Персональное наставничество для собственников и топ-менеджеров',
      summary: 'Уверенная позиция в сложных переговорах и взаимодействии с жёсткими оппонентами.',
      task: 'Клиент хотел увереннее управлять людьми, вступать в сложные и конфликтные переговоры и добиваться своих целей при взаимодействии с более жёсткими участниками. Из-за чрезмерно мягкого стиля общения его позицию могли использовать в чужих интересах.',
      work: 'В рамках наставничества развивали навыки влияния и управления людьми, ведения сложных переговоров, защиты своей позиции и противодействия манипуляциям. Разбирали конкретные рабочие ситуации и закрепляли новые модели поведения.',
      result: 'Клиент стал увереннее входить в сложные переговоры и конфликтные ситуации, управлять взаимодействием с жёсткими оппонентами и добиваться более выгодных условий.',
    },
    {
      title: 'Бракоразводные переговоры с разделом компаний',
      summary: 'Клиентка сохранила долю в бизнесе и получила денежную компенсацию.',
      task: 'Во время бракоразводного процесса нужно было защитить интересы клиентки при разделе совместно нажитых активов. За годы брака супруги создали несколько компаний, брачного договора не было. Цель — сохранить долю клиентки в бизнесе и получить денежную компенсацию.',
      work: 'Представлял интересы клиентки как одной стороны процесса, не выступая посредником между супругами. Сопровождал переговорную часть раздела совместно нажитых активов, помогал выстраивать позицию по компаниям и другим активам, определять условия раздела и добиваться решения в интересах клиентки.',
      result: 'Клиентке удалось сохранить долю в компании и получить денежную компенсацию по итогам раздела совместно нажитых активов.',
    },
  ],
  programTitle: 'На мастер-классе мы разберём',
  program: [
    'Как обсуждать деньги, условия и возможные уступки, сохраняя собственные интересы.',
    'Как заранее определить свою сильную или слабую переговорную позицию и понять, что можно изменить ещё до начала разговора.',
    'Как действовать, если собеседник давит, занимает жёсткую позицию или пытается навязать свои правила.',
    'Как говорить «нет» и отстаивать свою позицию без лишней конфронтации.',
  ],
  expertName: 'Игорь Беляев',
  expertHeadline: 'Ведущий эксперт по сложным управленческим переговорам',
  expertBio: [
    'Более 20 лет работает с первыми лицами, топ-командами и управленческими структурами крупных корпораций, финансовых институтов и государственных организаций.',
    'Специализируется на сложных переговорах, переговорах под давлением, управленческом влиянии и работе с конфликтами интересов.',
    'Проводил стратегические сессии и программы для команд ВТБ, Яндекса, Билайна, Северстали, Правительства Москвы и других организаций.',
  ],
  facts: [
    { title: 'Harvard Business School — Negotiation Mastery Certificate', note: '2024' },
    { title: 'Harvard Law School — Harvard Contract Law Certification', note: '2017' },
    { title: 'MIT School of Engineering — Entrepreneurial Negotiations Certification', note: '2018' },
    { title: 'Michigan State University — Successful Negotiation Certification', note: '2019' },
    { title: 'Northwestern University — High Performance Collaboration Certification', note: '2018' },
    { title: 'The University of Chicago Booth School of Business — Sales Strategies Certification', note: '2017' },
    { title: 'МГТУ им. Н. Э. Баумана — специалист-инженер приборов навигации и стабилизации', note: '2003–2010' },
  ],
  priceTitle: 'Стоимость и формат',
  formatLabel: 'Формат',
  dateLabel: 'Дата и время',
  date: '9 ноября, 19:30',
  durationLabel: 'Длительность',
  duration: '2 часа',
  priceLabel: 'Стоимость участия',
  price: '9 990 рублей',
  formatNote: 'Мастер-класс проходит в формате бизнес-игры с отдельными комнатами для участников: каждый сможет включиться в практику и получить личное взаимодействие.',
  paymentNote: 'После заполнения формы вы перейдёте на защищённую страницу ЮKassa. Участие подтвердится после успешной оплаты.',
  faqTitle: 'Вопросы',
  faq: [
    { q: 'На какой площадке пройдёт мастер-класс?', a: 'Мастер-класс пройдёт онлайн в Zoom.' },
    { q: 'Будет ли доступна запись?', a: 'Да, запись мастер-класса мы вышлем всем участникам после его проведения.' },
    { q: 'Можно ли будет задавать вопросы Игорю?', a: 'Да. В конце мастер-класса будет отдельный блок ответов на вопросы участников продолжительностью до 30 минут.' },
  ],
  contactTitle: 'Контактное лицо',
  contactName: 'Чалунин Максим Александрович',
  taxId: 'ИНН 668601656614',
  privacyLabel: 'Политика обработки персональных данных',
  consentLabel: 'Согласие на обработку персональных данных',
  offerLabel: 'Публичная оферта',
}

export const defaultSiteContent: SiteContent = {
  guide: defaultGuideContent,
  workshop: defaultWorkshopContent,
}

export const defaultAnalyticsSettings: AnalyticsSettings = {
  yandex: { enabled: false, id: '' },
  vk: { enabled: false, id: '' },
}

export const contentLabels: Record<string, string> = {
  heroTitleLead: 'Заголовок', heroTitleHighlight: 'Выделенная часть заголовка', heroDescription: 'Описание',
  heroButton: 'Текст кнопки', expertName: 'Имя эксперта', expertCaption: 'Подпись эксперта', sectionTitle: 'Заголовок раздела',
  points: 'Пункты', footerName: 'Имя в подвале', privacyLabel: 'Подпись ссылки на политику', consentLabel: 'Подпись ссылки на согласие',
  tagline: 'Подзаголовок', intro: 'Вступительный текст', button: 'Текст кнопки', meta: 'Краткая информация', label: 'Подпись', value: 'Значение',
  audienceTitle: 'Заголовок блока «Для кого»', audienceIntro: 'Описание аудитории', audiences: 'Категории аудитории', title: 'Заголовок', description: 'Описание',
  casesTitle: 'Заголовок кейсов', casesIntro: 'Описание кейсов', caseLabel: 'Метка кейса', taskLabel: 'Подпись задачи', workLabel: 'Подпись выполненной работы',
  resultLabel: 'Подпись результата', casesDisclaimer: 'Примечание под кейсами', cases: 'Кейсы', summary: 'Краткий результат', task: 'Задача клиента', work: 'Что было сделано', result: 'Результат',
  programTitle: 'Заголовок программы', program: 'Темы мастер-класса', expertHeadline: 'Должность эксперта', expertBio: 'Описание эксперта', facts: 'Образование и сертификаты', note: 'Год или период',
  priceTitle: 'Заголовок стоимости', formatLabel: 'Подпись формата', format: 'Формат', dateLabel: 'Подпись даты', date: 'Дата и время', durationLabel: 'Подпись длительности', duration: 'Длительность',
  priceLabel: 'Подпись стоимости', price: 'Стоимость', formatNote: 'Описание формата', paymentNote: 'Текст об оплате', faqTitle: 'Заголовок вопросов', faq: 'Вопросы и ответы', q: 'Вопрос', a: 'Ответ',
  contactTitle: 'Подпись контактного лица', contactName: 'Контактное лицо', taxId: 'ИНН', offerLabel: 'Подпись ссылки на оферту',
}

export function validateShape<T>(value: unknown, template: T): value is T {
  if (typeof template === 'string') return typeof value === 'string' && value.length <= 5000
  if (Array.isArray(template)) {
    return Array.isArray(value) && value.length === template.length && template.every((item, index) => validateShape(value[index], item))
  }
  if (template && typeof template === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const expected = Object.keys(template as object)
    const actual = Object.keys(value as object)
    return expected.length === actual.length && expected.every((key) => validateShape((value as Record<string, unknown>)[key], (template as Record<string, unknown>)[key]))
  }
  return typeof value === typeof template
}

export function mergeContent<T>(saved: unknown, fallback: T): T {
  return validateShape(saved, fallback) ? saved : fallback
}

export function setNestedValue<T>(source: T, path: (string | number)[], value: string): T {
  if (path.length === 0) return source
  const [head, ...tail] = path
  if (Array.isArray(source)) {
    const next = [...source]
    next[head as number] = setNestedValue(next[head as number], tail, value)
    return next as T
  }
  if (source && typeof source === 'object') {
    const record = source as Record<string, unknown>
    return { ...record, [head]: setNestedValue(record[head], tail, value) } as T
  }
  return value as T
}

export function toLines(value: string) {
  return value.split('\n')
}

export function updateTextAtPath<T>(source: T, path: (string | number)[], value: string): T {
  if (path.length === 0) return value as T
  const [head, ...tail] = path
  if (Array.isArray(source)) {
    const next = [...source]
    next[head as number] = updateTextAtPath(next[head as number], tail, value)
    return next as T
  }
  if (source && typeof source === 'object') {
    const record = source as Record<string, unknown>
    return { ...record, [head]: updateTextAtPath(record[head], tail, value) } as T
  }
  return source
}

export function updateLinesAtPath<T>(source: T, path: (string | number)[], value: string): T {
  const lines = value.split('\n').map((line) => line.trim()).filter(Boolean)
  if (path.length === 0) return lines as T
  const [head, ...tail] = path
  if (Array.isArray(source)) {
    const next = [...source]
    next[head as number] = updateLinesAtPath(next[head as number], tail, value)
    return next as T
  }
  if (source && typeof source === 'object') {
    const record = source as Record<string, unknown>
    return { ...record, [head]: updateLinesAtPath(record[head], tail, value) } as T
  }
  return source
}

export function isStringArrayPath(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function setContentValue<T>(source: T, path: (string | number)[], value: string | string[]): T {
  if (path.length === 0) return value as T
  const [head, ...tail] = path
  if (Array.isArray(source)) {
    const next = [...source]
    next[head as number] = setContentValue(next[head as number], tail, value)
    return next as T
  }
  if (source && typeof source === 'object') {
    const record = source as Record<string, unknown>
    return { ...record, [head]: setContentValue(record[head], tail, value) } as T
  }
  return source
}

export function shapeTemplate() {
  return defaultSiteContent
}
