import type { Metadata } from "next"
import type { ReactNode } from "react"
import { JsonLd } from "@/components/json-ld"
import { MentoringForm } from "@/components/mentoring-form"
import { mentoringProgram as program } from "@/lib/mentoring"
import { PERSON_ID, absoluteUrl, authorBio, breadcrumbSchema, credentials, graph, personSchema } from "@/lib/seo"

// Mentoring landing in the style of the lesson deck (navy and gold). The participation price is
// deliberately not shown: it is discussed on the call after the application.

const title = "Наставничество «Три шкалы влияния» — Игорь Беляев"
const description =
  "Наставничество Игоря Беляева по переговорам и продажам в мини-группе до 30 человек: разбор ваших реальных сделок, ролевые игры, личные сессии и подготовка к важным встречам."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mentoring" },
  openGraph: { type: "website", url: "/mentoring", title, description, images: ["/mentoring/igor-hero.jpg"] },
}

// Static page; daily revalidation keeps the footer year current.
export const revalidate = 86400

// Palette of the deck "Три шкалы влияния": #070B19 deep, #111A2F navy, #C9A066 gold, #987C53 numbers,
// #E9EAEE text, #A3A9B6 muted, #2A3350 lines. Headings are Arial caps, body text is Verdana, as on the slides.
const tones = {
  deep: "bg-[#070B19] text-[#E9EAEE]",
  navy: "bg-[#111A2F] text-[#E9EAEE]",
  gold: "bg-[#C9A066] text-[#070B19]",
} as const

type Tone = keyof typeof tones

const h2 =
  "font-sans text-balance text-[1.55rem] font-normal uppercase leading-[1.04] tracking-[0.01em] min-[360px]:text-[1.75rem] min-[400px]:text-[clamp(2rem,4.4vw,3.25rem)]"
const lead = "text-[15px] leading-relaxed text-[#A3A9B6] md:text-base"
const goldButton =
  "inline-flex h-12 items-center justify-center rounded-md bg-[#C9A066] px-8 font-sans text-sm uppercase tracking-[0.16em] text-[#070B19] transition-colors hover:bg-[#D6B27D]"

const scales = [
  {
    n: "01",
    name: "Интерес",
    lead: "Человек захотел то, что вы предлагаете: продукт, услугу, идею, условия.",
    learn: [
      "работать с сопротивлением, а не с возражениями",
      "вести встречу вопросами, а не презентацией",
      "понимать, что стоит за «нам надо подумать»",
    ],
  },
  {
    n: "02",
    name: "Доверие",
    lead: "Аттракция: людям хочется иметь дело именно с вами. Тогда прощают и цену выше рынка.",
    learn: [
      "просьба вместо услужливости, честно названный минус, гипотеза вместо предубеждения",
      "не отдавать лишнего в светской беседе",
      "замечать манипулятора и не заключать сделки с плохими людьми",
    ],
  },
  {
    n: "03",
    name: "Давление",
    lead: "Интересы расходятся: делим деньги, уступки, сроки, ответственность.",
    learn: [
      "пауза, обмен «если…, то…», свой контекст вместо роли виноватого",
      "три цифры до встречи и шесть вопросов подготовки",
      "ваш стиль под давлением: пять стилей Томаса–Килманна и три стиля со знаком минус",
    ],
  },
]

const comparison = [
  { format: "Книга", deals: "наполовину", feedback: "нет", regular: "нет" },
  { format: "Тренинг", deals: "да", feedback: "да", regular: "один день" },
  { format: "Наставничество", deals: "да", feedback: "да", regular: "да" },
]

const comparisonColumns = [
  { key: "deals", label: "Свои сделки", short: "Свои сделки" },
  { key: "feedback", label: "Обратная связь", short: "Обратная связь" },
  { key: "regular", label: "Регулярность", short: "Регулярно" },
] as const

const discount = [
  { label: "Было", value: "100 ₽", note: "цена, из них 25 ₽ ваша маржа" },
  { label: "После скидки", value: "90 ₽", note: "затраты те же 75 ₽, маржа 15 ₽" },
  { label: "Итог", value: "−40%", note: "прибыли с одной скидки в 10%" },
]

const parts = [
  {
    title: "Групповые встречи",
    text: "Короткая теория по одной из шкал, ролевые игры в тройках и разбор реальных сделок участников.",
    extra: program.schedule,
  },
  { title: "Личные сессии с Игорем", text: "На ваши самые важные переговоры.", extra: program.personalSessions },
  {
    title: "Подготовка к бою",
    text: "Перед ключевой встречей присылаете ситуацию и получаете разбор: гипотезы, цифры, обмены, ответы на давление.",
    extra: program.prepTurnaround,
  },
  { title: "Чат группы", text: "Вопросы и обратная связь между встречами.", extra: null },
  { title: "Тест стиля", text: "В начале и в конце программы: видно, что изменилось в том, как вы реагируете на давление.", extra: null },
  { title: "Бизнес-игра в финале", text: "И записи всех групповых встреч.", extra: null },
]

const fits = [
  "Собственникам и руководителям, у которых переговоры о деньгах и условиях идут каждую неделю",
  "Коммерческим директорам, руководителям продаж и сильным продавцам со сделками в сотни тысяч и миллионы",
  "Тем, кто готов приносить свои реальные переговоры и пробовать новое",
]

const notFits = [
  "Если ищете «запрещённые техники манипуляций»",
  "Если переговоров почти нет: не на чем практиковаться",
  "Если хочется только смотреть записи. Для этого есть варианты дешевле",
]

const steps = [
  { title: "Заявка", text: "Пять вопросов, около пяти минут. Игорь лично читает каждую." },
  {
    title: "Созвон",
    text: "20–30 минут с Игорем или менеджером. Проверяем, подходит ли вам группа. Если практиковаться будет не на чем, честно скажем.",
  },
  { title: "Условия", text: program.payment ?? "Если группа вам подходит, на созвоне обсуждаем условия участия и дату старта." },
]

const faq = [
  {
    q: "У меня нет времени",
    a: `${program.schedule ? `Групповая встреча ${program.schedule}.` : "Групповые встречи идут по расписанию, его сообщим на созвоне."} Всё остальное это ваши обычные переговоры, которые у вас и так есть. Просто теперь вы будете к ним готовиться и разбирать их.`,
  },
  {
    q: "Я уже читал Криса Восса и Кеннеди",
    a: "Это хорошие книги. В группе вы будете делать то, о чём читали, на своих сделках. Разница между «читал» и «умею» ровно в том, что задание попросить скидку выполняют около 10% участников тренингов.",
  },
  {
    q: "У меня очень специфичная отрасль",
    a: "Переговоры о деньгах, давлении и уступках устроены одинаково, будь то стройка, IT или медицина. А разные отрасли в группе как раз помогают: со стороны лучше видно.",
  },
  {
    q: "Будут ли техники манипуляций?",
    a: "Нет. В группе учимся договариваться так, чтобы с вами хотели работать снова. Манипуляции работают один раз и стоят репутации.",
  },
  {
    q: "Сколько стоит участие?",
    a: "Стоимость и условия участия называем на созвоне, когда уже понятно, подходит ли вам группа.",
  },
  {
    q: "Что будет на созвоне?",
    a: "Вы расскажете о своих переговорах и зададите вопросы о программе, мы проверим, подходит ли вам группа. Созвон ни к чему не обязывает.",
  },
]

const nav = [
  { href: "#model", label: "Модель" },
  { href: "#format", label: "Формат" },
  { href: "#author", label: "Об авторе" },
  { href: "#faq", label: "Вопросы" },
]

function Section({ tone, id, children }: { tone: Tone; id?: string; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-14 px-5 py-16 md:px-10 md:py-24 ${tones[tone]}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  )
}

// Eyebrow, slide-style number and heading, as at the top of every slide in the deck.
function SectionHead({ index, eyebrow, onGold = false, children }: { index: string; eyebrow: string; onGold?: boolean; children: ReactNode }) {
  return (
    <header>
      <div className="flex items-start justify-between gap-6">
        <p className={`min-w-0 text-[11px] uppercase tracking-[0.24em] ${onGold ? "text-[#070B19]/70" : "text-[#C9A066]"}`}>{eyebrow}</p>
        <span className={`font-sans text-xs tabular-nums ${onGold ? "text-[#070B19]/45" : "text-[#4A5470]"}`} aria-hidden="true">
          {index}
        </span>
      </div>
      <h2 className={`mt-4 ${h2}`}>{children}</h2>
    </header>
  )
}

function Dash({ className = "bg-[#C9A066]" }: { className?: string }) {
  return <span className={`mt-[0.7em] h-px w-3 shrink-0 ${className}`} aria-hidden="true" />
}

export default function MentoringPage() {
  const meta = [
    { label: "Группа", value: `до ${program.groupSize}`, note: "человек" },
    { label: "Программа", value: "3 шкалы", note: "на ваших реальных сделках" },
    program.duration
      ? { label: "Срок", value: program.duration, note: "регулярной работы" }
      : { label: "Отбор", value: "Заявка", note: "и созвон 20–30 минут" },
  ]

  const structuredData = graph(
    {
      "@type": "Course",
      name: "Три шкалы влияния",
      description,
      inLanguage: "ru-RU",
      url: absoluteUrl("/mentoring"),
      provider: { "@id": PERSON_ID },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
    breadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Наставничество", path: "/mentoring" },
    ]),
    personSchema(),
  )

  return (
    <main id="top" className="min-h-dvh bg-[#070B19] text-[#E9EAEE]" style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
      <JsonLd data={structuredData} />

      <header className="sticky top-0 z-40 border-b border-[#2A3350]/70 bg-[#070B19]/85 px-5 backdrop-blur-md md:px-10">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4">
          <a href="#top" aria-label="Игорь Беляев, в начало страницы" className="shrink-0">
            <img src="/mentoring/signature.png" alt="Игорь Беляев" width={438} height={100} className="h-6 w-auto opacity-90 min-[400px]:h-7" />
          </a>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Разделы">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="text-[11px] uppercase tracking-[0.18em] text-[#A3A9B6] transition-colors hover:text-[#C9A066]">
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#apply"
            className="inline-flex h-9 shrink-0 items-center rounded-md border border-[#C9A066] px-3 font-sans text-[11px] uppercase tracking-[0.1em] text-[#C9A066] min-[400px]:px-4 min-[400px]:tracking-[0.18em] transition-colors hover:bg-[#C9A066] hover:text-[#070B19]"
          >
            Подать заявку
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#070B19]">
        <div className="grid lg:min-h-[calc(100svh_-_3.5rem)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative h-[440px] sm:h-[540px] lg:order-2 lg:h-auto">
            <img
              src="/mentoring/igor-hero.jpg"
              alt="Игорь Беляев, эксперт по переговорам"
              width={1400}
              height={2022}
              className="absolute inset-0 h-full w-full object-cover object-[60%_4%] lg:object-[60%_18%]"
              fetchPriority="high"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-[#070B19] via-[#070B19]/70 to-transparent lg:inset-y-0 lg:right-auto lg:h-full lg:w-2/3 lg:bg-linear-to-r lg:via-[#070B19]/40"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 -mt-36 flex flex-col justify-center px-5 pb-16 sm:-mt-48 md:px-10 lg:order-1 lg:mt-0 lg:py-20 lg:pl-[max(2.5rem,calc((100vw_-_72rem)/2))]">
            <span className="h-px w-12 bg-[#C9A066]" aria-hidden="true" />
            <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-[#C9A066]">Наставничество Игоря Беляева · мини-группа</p>
            <h1 className="mt-5 font-sans text-[clamp(2.75rem,8.5vw,6.25rem)] font-normal uppercase leading-[0.95] tracking-[0.005em]">
              Три шкалы <span className="block text-[#C9A066]">влияния</span>
            </h1>
            <p className={`mt-7 max-w-[46ch] ${lead}`}>
              Переговоры и продажи на ваших реальных сделках: с обратной связью со стороны и регулярной практикой, а не один день тренинга.
            </p>
            <p className="mt-5 font-sans text-lg uppercase leading-snug tracking-[0.02em] md:text-xl">
              Уступить нельзя договориться.
              <span className="block text-[#C9A066]">Где запятая, решаете вы.</span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#apply" className={goldButton}>
                Подать заявку
              </a>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#8A90A0]">
                Отбор по заявке{program.start ? ` · старт ${program.start}` : ""}
              </span>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              {meta.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 rounded-md border border-[#2A3350] bg-[#0E1527]/80 px-4 py-3 sm:flex-col sm:justify-start sm:gap-8 sm:p-4"
                >
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-[#8A90A0]">{item.label}</dt>
                  <dd className="text-right sm:text-left">
                    <span className="block font-sans text-2xl leading-none text-[#C9A066] md:text-3xl">{item.value}</span>
                    <span className="mt-1.5 block text-xs leading-snug text-[#A3A9B6]">{item.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Section tone="navy">
        <SectionHead index="01" eyebrow="Знать и уметь">
          Почему знание не становится навыком
        </SectionHead>
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="flex flex-col gap-5">
              <strong className="font-sans text-[clamp(5rem,13vw,8.5rem)] font-normal leading-[0.85] text-[#C9A066]">10%</strong>
              <span className="max-w-[34ch] text-base leading-snug md:text-xl">
                участников тренинга выполняют простое задание: попросить скидку там, где обычно не просят
              </span>
            </p>
            <p className={`mt-8 max-w-[56ch] ${lead}`}>
              Остальные знают как и понимают зачем. И не делают. Переговоры это навык, как вождение: он появляется, когда вы тренируетесь на своих ситуациях, кто-то со стороны даёт обратную связь, и это происходит регулярно.
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-8">
            <table className="hidden w-full border-collapse text-left text-sm md:table">
              <thead>
                <tr className="border-b border-[#2A3350]">
                  <th className="py-3 pr-4" />
                  {comparisonColumns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-sans text-[11px] font-normal uppercase tracking-[0.14em] text-[#8A90A0]">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => {
                  const highlight = row.format === "Наставничество"
                  return (
                    <tr key={row.format} className={`border-b ${highlight ? "border-[#C9A066] bg-[#C9A066]/[0.07] text-[#C9A066]" : "border-[#2A3350] text-[#A3A9B6]"}`}>
                      <th scope="row" className={`py-4 pl-3 pr-4 font-sans text-sm font-normal uppercase tracking-[0.04em] ${highlight ? "" : "text-[#E9EAEE]"}`}>
                        {row.format}
                      </th>
                      {comparisonColumns.map((column) => (
                        <td key={column.key} className="px-4 py-4">
                          {row[column.key]}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="flex flex-col gap-2 md:hidden">
              {comparison.map((row) => {
                const highlight = row.format === "Наставничество"
                return (
                  <div key={row.format} className={`rounded-md border p-4 ${highlight ? "border-[#C9A066] bg-[#C9A066]/[0.07]" : "border-[#2A3350]"}`}>
                    <p className={`font-sans text-sm uppercase tracking-[0.04em] ${highlight ? "text-[#C9A066]" : ""}`}>{row.format}</p>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px] min-[360px]:text-xs">
                      {comparisonColumns.map((column) => (
                        <div key={column.key} className="flex min-w-0 flex-col justify-between">
                          <dt className="text-[10px] uppercase tracking-[0.04em] text-[#8A90A0]">{column.short}</dt>
                          <dd className={`mt-1 ${highlight ? "text-[#C9A066]" : "text-[#A3A9B6]"}`}>{row[column.key]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )
              })}
            </div>

            <div className="border-l border-[#C9A066] pl-5">
              <p className="text-base leading-relaxed md:text-lg">
                <strong className="font-sans text-3xl font-normal text-[#C9A066] md:text-4xl">+15%</strong>{" "}
                выигранных сделок там, где с продавцами регулярно разбирают реальные разговоры.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#8A90A0]">
                Korn Ferry, Sales Maturity Survey, 2024. У любого серьёзного спортсмена есть тренер. У переговорщиков обычно нет.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="deep" id="model">
        <SectionHead index="02" eyebrow="Авторская модель Игоря Беляева">
          Что такое <span className="text-[#C9A066]">три шкалы</span>
        </SectionHead>
        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-0">
          {scales.map((scale) => (
            <article
              key={scale.n}
              className="flex flex-col rounded-lg border border-[#2A3350] bg-[#0E1527] p-6 transition-colors hover:border-[#C9A066]/70 md:p-8 lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-y-0"
            >
              <span className="font-sans text-sm text-[#987C53]">{scale.n}</span>
              <h3 className="mt-10 font-sans text-3xl uppercase leading-none tracking-[0.01em] text-[#C9A066]">{scale.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#C9CDD6]">{scale.lead}</p>
              <div className="pt-8">
                <p className="border-t border-[#2A3350] pt-5 text-[10px] uppercase tracking-[0.2em] text-[#8A90A0]">Чему учимся</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {scale.learn.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#A3A9B6]">
                      <Dash />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="gold">
        <SectionHead index="03" eyebrow="Главное о модели" onGold>
          Шкалы работают одновременно
        </SectionHead>
        <p className="mt-8 max-w-[34ch] font-sans text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.2]">
          Слабость на одной обычно пытаются закрыть другой: не доверяют, и продавец даёт скидку.
        </p>
        <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-[#070B19]/75 md:text-base">
          В группе вы увидите, на какой шкале проседаете именно вы, и будете тренировать её на своих сделках.
        </p>
      </Section>

      <Section tone="navy">
        <SectionHead index="04" eyebrow="Арифметика одной уступки">
          Во что обходится скидка 10%
        </SectionHead>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
          {discount.map((item, index) => {
            const last = index === discount.length - 1
            return (
              <div
                key={item.label}
                className={`flex items-start justify-between gap-4 rounded-lg border p-5 sm:min-h-[15rem] sm:flex-col md:p-7 ${last ? "border-[#C9A066] bg-[#C9A066]/[0.06]" : "border-[#2A3350] bg-[#0B1020]"}`}
              >
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#8A90A0]">{item.label}</span>
                <div className="text-right sm:text-left">
                  <strong className="block font-sans text-4xl font-normal leading-none text-[#C9A066] md:text-6xl">{item.value}</strong>
                  <span className="mt-3 block max-w-[24ch] text-xs leading-snug text-[#A3A9B6]">{item.note}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12">
          <p className="text-base leading-relaxed md:text-lg">
            Чтобы вернуть прежнюю прибыль, нужно продать на <span className="text-[#C9A066]">67% больше</span>.
          </p>
          <p className={lead}>
            Поэтому в группе много времени уходит на давление: как удержать цену, взять паузу и обменять уступку на что-то ценное, а не отдать её просто так.
          </p>
        </div>
      </Section>

      <Section tone="deep" id="format">
        <SectionHead index="05" eyebrow="Формат">
          Как устроено <span className="text-[#C9A066]">наставничество</span>
        </SectionHead>
        <ol className="mt-10 border-b border-[#2A3350]">
          {parts.map((part, index) => (
            <li
              key={part.title}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-[#2A3350] py-5 md:grid-cols-[3.5rem_minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-baseline md:py-6"
            >
              <span className="font-sans text-lg text-[#987C53]">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-sans text-lg uppercase leading-snug tracking-[0.01em] md:text-xl">{part.title}</h3>
              <div className="col-start-2 md:col-start-3">
                <p className="text-sm leading-relaxed text-[#A3A9B6] md:text-[15px]">{part.text}</p>
                {part.extra && <p className="mt-1.5 text-sm text-[#C9A066]">{part.extra}</p>}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 grid grid-cols-1 items-center gap-6 rounded-lg border border-[#2A3350] bg-[#0E1527] p-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10 md:p-10">
          <p className="font-sans text-[clamp(4.5rem,10vw,7rem)] leading-none text-[#C9A066]">{program.groupSize}</p>
          <div>
            <h3 className="font-sans text-xl uppercase tracking-[0.01em]">Почему не больше {program.groupSize} человек</h3>
            <p className={`mt-3 max-w-[72ch] ${lead}`}>
              Достаточно, чтобы у каждого были партнёры для ролевых игр, разные отрасли и разные типы переговоров: разбор сделки из другой отрасли часто помогает увидеть свою по-новому. И достаточно мало, чтобы за время программы разобрали реальные сделки каждого, а не только послушали чужие.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="navy">
        <SectionHead index="06" eyebrow="Наставничество">
          Для кого
        </SectionHead>
        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
          <div className="rounded-lg border border-[#C9A066] bg-[#0B1020] p-6 md:p-8">
            <h3 className="font-sans text-xl uppercase tracking-[0.04em] text-[#C9A066]">Подойдёт</h3>
            <ul className="mt-6 flex flex-col gap-5">
              {fits.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
                  <Dash />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[#2A3350] p-6 md:p-8">
            <h3 className="font-sans text-xl uppercase tracking-[0.04em] text-[#8A90A0]">Не подойдёт</h3>
            <ul className="mt-6 flex flex-col gap-5">
              {notFits.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-[#A3A9B6]">
                  <Dash className="bg-[#4A5470]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="deep" id="author">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-lg lg:sticky lg:top-20 lg:self-start">
            <img
              src="/mentoring/igor-portrait.jpg"
              alt="Портрет Игоря Беляева"
              width={920}
              height={1080}
              className="aspect-[920/1080] w-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#070B19] to-transparent" aria-hidden="true" />
            <img src="/mentoring/signature.png" alt="" width={438} height={100} className="absolute bottom-5 left-5 h-10 w-auto opacity-90 md:h-12" />
          </div>
          <div>
            <SectionHead index="07" eyebrow="Автор модели «Три шкалы влияния»">
              Игорь Беляев
            </SectionHead>
            <p className={`mt-6 max-w-[60ch] ${lead}`}>{authorBio}</p>
            <div className="mt-8 flex flex-col gap-5">
              <blockquote className="border-l border-[#C9A066] pl-5">
                <p className="text-base leading-relaxed md:text-lg">
                  «Я против манипуляций. В группе мы учимся договариваться так, чтобы с вами хотели работать снова».
                </p>
              </blockquote>
              <blockquote className="border-l border-[#C9A066] pl-5">
                <p className="text-base leading-relaxed md:text-lg">
                  «Не обещаю рост выручки: так обещать нельзя. Обещаю разбор ваших реальных кейсов в камерной обстановке, с обратной связью».
                </p>
              </blockquote>
            </div>
            <p className="mt-10 text-[10px] uppercase tracking-[0.2em] text-[#8A90A0]">Обучение и сертификаты</p>
            <ul className="mt-3 border-b border-[#2A3350]">
              {credentials.map((item) => (
                <li key={item.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-t border-[#2A3350] py-3.5">
                  <span>
                    <span className="block font-sans text-sm uppercase tracking-[0.04em]">{item.issuer}</span>
                    <span className="mt-1 block text-xs text-[#A3A9B6]">{item.name}</span>
                  </span>
                  <span className="font-sans text-sm text-[#987C53]">{item.year}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="gold">
        <SectionHead index="08" eyebrow="Отбор в группу" onGold>
          Как попасть в группу
        </SectionHead>
        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-[#070B19]/25 pt-5">
              <span className="font-sans text-5xl leading-none text-[#070B19]/35">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-sans text-2xl uppercase leading-none tracking-[0.01em]">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#070B19]/80">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[60ch] text-[15px] leading-relaxed text-[#070B19]/80">
            Мест {program.groupSize}, считаем честно: никаких «осталось два места».{program.start ? ` Старт группы ${program.start}.` : ""} Набор закрывается, когда места заняты.
          </p>
          <a
            href="#apply"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-[#070B19] px-8 font-sans text-sm uppercase tracking-[0.16em] text-[#C9A066] transition-colors hover:bg-[#111A2F]"
          >
            Подать заявку
          </a>
        </div>
      </Section>

      <Section tone="navy" id="apply">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
          <div className="lg:sticky lg:top-20">
            <SectionHead index="09" eyebrow="Набор в мини-группу">
              Подать заявку
            </SectionHead>
            <p className="mt-6 max-w-[44ch] text-base leading-relaxed md:text-lg">
              Ответьте на пять вопросов о себе и своих переговорах. Игорь лично читает каждую заявку.
            </p>
            <p className={`mt-4 max-w-[48ch] ${lead}`}>
              После заявки с вами свяжутся и договорятся о созвоне на 20–30 минут. Оплата только после созвона и только если группа вам подходит.
            </p>
          </div>
          <MentoringForm />
        </div>
      </Section>

      <Section tone="deep" id="faq">
        <SectionHead index="10" eyebrow="Частые вопросы">
          Вопросы
        </SectionHead>
        <div className="mt-8 border-b border-[#2A3350]">
          {faq.map((item) => (
            <details key={item.q} className="group border-t border-[#2A3350] py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-base uppercase tracking-[0.02em] md:text-lg [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="text-2xl leading-none text-[#C9A066] transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className={`mt-3 max-w-[80ch] ${lead}`}>{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <footer className="border-t border-[#2A3350] bg-[#070B19] px-5 py-10 text-xs text-[#8A90A0] md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <img src="/mentoring/signature.png" alt="Игорь Беляев" width={438} height={100} className="mb-4 h-8 w-auto self-start opacity-80" />
            <span className="uppercase tracking-[0.2em] text-[#C9CDD6]">Продавец</span>
            <span>ИП Чалунин Максим Александрович</span>
            <span>ОГРНИП 326965800233302</span>
            <span>ИНН 668601656614</span>
          </div>
          <nav className="flex flex-col gap-2 md:items-end" aria-label="Ссылки">
            <a href="/blog" className="transition-colors hover:text-[#C9A066]">Блог</a>
            <a href="https://drive.google.com/file/d/1LOpqvvGNEhEtwlEIWB1EnyHHMAuv3x9U/view" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#C9A066]">
              Политика обработки персональных данных
            </a>
            <a href="https://drive.google.com/file/d/1jVXxlq3I9YIp5UgCUHGxiylBgfazeBrm/view" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#C9A066]">
              Согласие на обработку персональных данных
            </a>
          </nav>
        </div>
        <div className="mx-auto mt-8 w-full max-w-6xl text-[#596075]">© {new Date().getFullYear()} Все права защищены</div>
      </footer>
    </main>
  )
}
