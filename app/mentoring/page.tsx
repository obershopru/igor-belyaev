import type { Metadata } from "next"
import { CalendarCheck, Check, ClipboardCheck, FileText, MessageCircle, Phone, Target, Trophy, Users, Wallet, X } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { MentoringForm } from "@/components/mentoring-form"
import { mentoringProgram as program } from "@/lib/mentoring"
import { PERSON_ID, absoluteUrl, authorBio, breadcrumbSchema, credentials, graph, personSchema } from "@/lib/seo"

const title = "Наставничество «Три шкалы влияния» — Игорь Беляев"
const description =
  "Наставничество Игоря Беляева по переговорам и продажам в мини-группе до 30 человек: разбор ваших реальных сделок, ролевые игры, личные сессии и подготовка к важным встречам."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mentoring" },
  openGraph: { type: "website", url: "/mentoring", title, description, images: ["/expert-mk-hero.jpg"] },
}

// Static page; daily revalidation keeps the footer year current.
export const revalidate = 86400

const price = `${program.price.toLocaleString("ru-RU").replace(/\s/g, " ")} ₽`

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

const parts = [
  {
    icon: Users,
    title: "Групповые встречи",
    text: "Короткая теория по одной из шкал, ролевые игры в тройках и разбор реальных сделок участников.",
    extra: program.schedule,
  },
  {
    icon: Phone,
    title: "Личные сессии с Игорем",
    text: "На ваши самые важные переговоры.",
    extra: program.personalSessions,
  },
  {
    icon: Target,
    title: "Подготовка к бою",
    text: "Перед ключевой встречей присылаете ситуацию и получаете разбор: гипотезы, цифры, обмены, ответы на давление.",
    extra: program.prepTurnaround,
  },
  { icon: MessageCircle, title: "Чат группы", text: "Вопросы и обратная связь между встречами.", extra: null },
  {
    icon: ClipboardCheck,
    title: "Тест стиля",
    text: "В начале и в конце программы: видно, что изменилось в том, как вы реагируете на давление.",
    extra: null,
  },
  { icon: Trophy, title: "Бизнес-игра в финале", text: "И записи всех групповых встреч.", extra: null },
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
  { icon: FileText, title: "Заявка", text: "Пять вопросов, около пяти минут. Игорь лично читает каждую." },
  {
    icon: CalendarCheck,
    title: "Созвон",
    text: "20–30 минут с Игорем или менеджером. Проверяем, подходит ли вам группа. Если практиковаться будет не на чем, честно скажем.",
  },
  { icon: Wallet, title: "Оплата", text: program.payment ?? "Если группа подходит, вы получаете ссылку на оплату. Условия обсуждаем на созвоне." },
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
    q: "Что будет на созвоне?",
    a: "Вы расскажете о своих переговорах и зададите вопросы о программе, мы проверим, подходит ли вам группа. Созвон ни к чему не обязывает.",
  },
]

// Below 360px the long Russian words in headings ("становится", "стоимость") need a smaller size to fit.
const sectionTitle =
  "text-balance text-[1.9rem] min-[360px]:text-[clamp(2.25rem,5vw,4.25rem)] font-black uppercase leading-[0.98] tracking-[-0.03em]"
const eyebrow = "text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400"

export default function MentoringPage() {
  const meta = [
    { label: "Группа", value: `до ${program.groupSize} человек` },
    { label: "Практика", value: "на ваших реальных сделках" },
    program.duration ? { label: "Срок", value: program.duration } : { label: "Отбор", value: "по заявке и созвону" },
  ]

  const structuredData = graph(
    {
      "@type": "Course",
      name: "Три шкалы влияния",
      description,
      inLanguage: "ru-RU",
      url: absoluteUrl("/mentoring"),
      provider: { "@id": PERSON_ID },
      offers: {
        "@type": "Offer",
        price: program.price,
        priceCurrency: "RUB",
        category: "Paid",
        url: absoluteUrl("/mentoring"),
      },
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
    <main className="min-h-dvh bg-black font-sans text-white">
      <JsonLd data={structuredData} />

      <section className="grid grid-cols-1 items-stretch lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between gap-10 px-5 py-10 md:px-10 md:py-14">
          <div>
            <p className={eyebrow}>Наставничество Игоря Беляева · мини-группа</p>
            <h1 className="mt-5 text-balance text-[clamp(2.5rem,7vw,5.25rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]">
              Три шкалы <span className="text-yellow-400">влияния</span>
            </h1>
            <p className="mt-6 max-w-[48ch] text-pretty text-lg leading-relaxed text-zinc-300">
              Переговоры и продажи на ваших реальных сделках: с обратной связью со стороны и регулярной практикой, а не один день тренинга.
            </p>
            <p className="mt-4 text-xl font-bold text-zinc-400">Уступить нельзя договориться. Где запятая, решаете вы.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#apply" className="inline-flex h-12 items-center justify-center rounded-full bg-yellow-400 px-7 font-bold text-black transition-opacity hover:opacity-90">
                Подать заявку
              </a>
              <span className="text-sm text-zinc-500">Отбор по заявке{program.start ? ` · старт ${program.start}` : ""}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {meta.map((item) => (
              <div key={item.label} className="flex flex-col items-center justify-start rounded-2xl bg-zinc-950 p-4 text-center md:p-6">
                <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">{item.label}</span>
                <strong className="mt-2 block text-balance text-lg font-black leading-tight">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center px-5 pb-10 md:px-10 md:py-14 lg:p-0">
          <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-2xl bg-white sm:min-h-[420px] lg:rounded-none">
            <img
              src="/expert-mk-hero.jpg"
              alt="Игорь Беляев — эксперт по переговорам"
              className="absolute inset-0 h-full w-full object-cover object-top"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <h2 className={sectionTitle}>Почему знание не становится навыком</h2>
            <p className="mt-6 flex items-baseline gap-4">
              <strong className="text-[clamp(4rem,10vw,7rem)] font-black leading-none text-yellow-400">10%</strong>
              <span className="max-w-[26ch] text-lg leading-snug text-zinc-300">
                участников тренинга выполняют простое задание: попросить скидку там, где обычно не просят
              </span>
            </p>
            <p className="mt-6 max-w-[56ch] leading-relaxed text-zinc-400">
              Остальные знают как и понимают зачем. И не делают. Переговоры это навык, как вождение: он появляется, когда вы тренируетесь на своих ситуациях, кто-то со стороны даёт обратную связь, и это происходит регулярно.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <table className="hidden w-full border-collapse text-left md:table">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                  <th className="py-3 pr-4 font-extrabold" />
                  {comparisonColumns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-extrabold">{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => {
                  const highlight = row.format === "Наставничество"
                  return (
                    <tr key={row.format} className={highlight ? "bg-yellow-400 text-black" : "border-b border-zinc-900"}>
                      <th scope="row" className={`py-4 pl-4 pr-4 font-black ${highlight ? "rounded-l-xl" : ""}`}>{row.format}</th>
                      {comparisonColumns.map((column, index) => (
                        <td key={column.key} className={`px-4 py-4 ${highlight && index === comparisonColumns.length - 1 ? "rounded-r-xl" : ""}`}>{row[column.key]}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="flex flex-col gap-3 md:hidden">
              {comparison.map((row) => {
                const highlight = row.format === "Наставничество"
                return (
                  <div key={row.format} className={`rounded-xl p-4 ${highlight ? "bg-yellow-400 text-black" : "bg-zinc-950"}`}>
                    <p className="font-black">{row.format}</p>
                    <dl className="mt-2 grid grid-cols-3 gap-2 text-xs min-[360px]:text-sm">
                      {comparisonColumns.map((column) => (
                        <div key={column.key}>
                          <dt className={`text-[10px] uppercase tracking-[0.04em] ${highlight ? "text-black/60" : "text-zinc-500"}`}>{column.short}</dt>
                          <dd className="mt-0.5">{row[column.key]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )
              })}
            </div>
            <div className="rounded-2xl bg-zinc-950 p-6">
              <p className="text-lg leading-relaxed text-zinc-200">
                <strong className="text-yellow-400">+15%</strong> выигранных сделок там, где с продавцами регулярно разбирают реальные разговоры.
              </p>
              <p className="mt-2 text-xs text-zinc-500">Korn Ferry, Sales Maturity Survey, 2024. У любого серьёзного спортсмена есть тренер. У переговорщиков обычно нет.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <p className={eyebrow}>Авторская модель Игоря Беляева</p>
        <h2 className={`mt-4 ${sectionTitle}`}>Что такое три шкалы</h2>
        <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-zinc-400">
          Шкалы работают одновременно. Слабость на одной обычно пытаются закрыть другой: не доверяют, и продавец даёт скидку. В группе вы увидите, на какой шкале проседаете именно вы.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {scales.map((scale) => (
            <article key={scale.n} className="flex flex-col gap-4 rounded-2xl bg-zinc-950 p-6 md:p-8">
              <span className="text-sm font-black text-yellow-400">{scale.n}</span>
              <h3 className="text-3xl font-black uppercase leading-none tracking-tight">{scale.name}</h3>
              <p className="leading-relaxed text-zinc-300">{scale.lead}</p>
              <div className="mt-auto border-t border-zinc-800 pt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Чему учимся</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {scale.learn.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" strokeWidth={3} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <h2 className={sectionTitle}>Как устроено</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <div key={part.title} className="flex items-start gap-4 rounded-2xl bg-zinc-950 p-6">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black">
                <part.icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-black leading-snug">{part.title}</h3>
                <p className="mt-1 leading-relaxed text-zinc-400">{part.text}</p>
                {part.extra && <p className="mt-2 text-sm font-bold text-yellow-400">{part.extra}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-zinc-800 p-6 md:p-8">
          <h3 className="text-lg font-black uppercase tracking-tight">Почему до {program.groupSize} человек</h3>
          <p className="mt-3 max-w-[80ch] leading-relaxed text-zinc-400">
            Достаточно, чтобы у каждого были партнёры для ролевых игр, разные отрасли и разные типы переговоров: разбор сделки из другой отрасли часто помогает увидеть свою по-новому. И достаточно мало, чтобы за время программы разобрали реальные сделки каждого, а не только послушали чужие.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <h2 className={sectionTitle}>Для кого</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-zinc-950 p-6 md:p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-yellow-400">Подойдёт</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {fits.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-zinc-200">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-yellow-400" strokeWidth={3} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-800 p-6 md:p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-zinc-400">Не подойдёт</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {notFits.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-zinc-400">
                  <X className="mt-1 h-5 w-5 shrink-0 text-zinc-500" strokeWidth={3} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 rounded-3xl bg-zinc-950 p-6 md:p-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <div>
            <h2 className={sectionTitle}>Стоимость участия</h2>
            <p className="mt-6 text-[clamp(3rem,8vw,5.5rem)] font-black leading-none tracking-[-0.03em] text-yellow-400">{price}</p>
            <p className="mt-4 text-xl font-bold leading-snug">Это одна скидка 10% на сделке в 3,4 млн ₽.</p>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-zinc-400">
              Если за время программы вы хотя бы раз не отдадите такую скидку, а удержите цену или обменяете уступку на что-то ценное, участие окупится. Если сделок такого масштаба нет и переговоры о деньгах не ваша регулярная работа, скорее всего, рано. Это нормально.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-8">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Во что обходится скидка 10% при марже 25%</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center md:gap-3">
                <div className="rounded-xl bg-black px-2 py-4 md:p-4">
                  <span className="text-xs text-zinc-500">Было</span>
                  <strong className="mt-1 block text-base font-black min-[360px]:text-lg md:text-2xl">100 ₽</strong>
                  <span className="text-xs text-zinc-500">маржа 25 ₽</span>
                </div>
                <div className="rounded-xl bg-black px-2 py-4 md:p-4">
                  <span className="text-xs text-zinc-500">После скидки</span>
                  <strong className="mt-1 block text-base font-black min-[360px]:text-lg md:text-2xl">90 ₽</strong>
                  <span className="text-xs text-zinc-500">маржа 15 ₽</span>
                </div>
                <div className="rounded-xl bg-yellow-400 px-2 py-4 text-black md:p-4">
                  <span className="text-xs">Итог</span>
                  <strong className="mt-1 block text-base font-black min-[360px]:text-lg md:text-2xl">−40%</strong>
                  <span className="text-xs">прибыли</span>
                </div>
              </div>
            </div>
            <blockquote className="border-l-2 border-yellow-400 pl-4 text-zinc-300">
              <p className="leading-relaxed">«Не обещаю рост выручки: так обещать нельзя. Обещаю разбор ваших реальных кейсов в камерной обстановке, с обратной связью».</p>
              <footer className="mt-2 text-sm text-zinc-500">Игорь Беляев</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <h2 className={sectionTitle}>Как попасть в группу</h2>
        <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-4 rounded-2xl bg-zinc-950 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-black">
                  <step.icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="text-sm font-black text-zinc-500">0{index + 1}</span>
              </div>
              <h3 className="text-2xl font-black uppercase leading-none tracking-tight">{step.title}</h3>
              <p className="leading-relaxed text-zinc-400">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-[70ch] text-pretty leading-relaxed text-zinc-400">
          Мест {program.groupSize}, считаем честно: никаких «осталось два места».{program.start ? ` Старт группы ${program.start}.` : ""} Набор закрывается, когда места заняты.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[0.62fr_1.38fr]">
        <div className="relative min-h-[320px] overflow-hidden bg-zinc-950 lg:min-h-full">
          <img src="/expert-profile.jpg" alt="Портрет Игоря Беляева" className="absolute inset-0 h-full w-full object-cover object-top grayscale" loading="lazy" />
        </div>
        <div className="flex flex-col gap-8 px-5 py-10 md:px-10 md:py-12">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black uppercase leading-[0.98] tracking-[-0.03em]">Игорь Беляев</h2>
            <p className="mt-3 text-lg font-bold leading-snug">Автор модели «Три шкалы влияния»</p>
            <p className="mt-4 max-w-[70ch] leading-relaxed text-zinc-400">{authorBio}</p>
            <p className="mt-4 max-w-[70ch] leading-relaxed text-zinc-400">
              «Я против манипуляций. В группе мы учимся договариваться так, чтобы с вами хотели работать снова».
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {credentials.map((item) => (
              <div key={item.name} className="flex flex-col gap-1 rounded-xl bg-zinc-950 p-4">
                <strong className="text-pretty text-sm font-bold leading-snug">{item.issuer} — {item.name}</strong>
                <span className="text-xs text-zinc-500">{item.year}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="scroll-mt-6 px-5 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div className="lg:sticky lg:top-8">
            <h2 className={sectionTitle}>Подать заявку</h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-zinc-300">
              Ответьте на пять вопросов о себе и своих переговорах. Игорь лично читает каждую заявку.
            </p>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-zinc-500">
              После заявки с вами свяжутся и договорятся о созвоне на 20–30 минут. Оплата только после созвона и только если группа вам подходит.
            </p>
          </div>
          <MentoringForm />
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <h2 className={`mb-6 ${sectionTitle}`}>Вопросы</h2>
        <div>
          {faq.map((item) => (
            <details key={item.q} className="group border-b border-zinc-900 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="text-2xl leading-none text-yellow-400 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-[80ch] leading-relaxed text-zinc-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="px-5 py-8 text-xs text-zinc-500 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-black uppercase tracking-[0.2em] text-zinc-300">Продавец</span>
            <span>ИП Чалунин Максим Александрович</span>
            <span>ОГРНИП 326965800233302</span>
            <span>ИНН 668601656614</span>
          </div>
          <nav className="flex flex-col gap-2 md:items-end" aria-label="Ссылки">
            <a href="/master" className="transition-colors hover:text-yellow-400">Мастер-класс</a>
            <a href="/blog" className="transition-colors hover:text-yellow-400">Блог</a>
            <a href="https://drive.google.com/file/d/1LOpqvvGNEhEtwlEIWB1EnyHHMAuv3x9U/view" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-yellow-400">Политика обработки персональных данных</a>
            <a href="https://drive.google.com/file/d/1jVXxlq3I9YIp5UgCUHGxiylBgfazeBrm/view" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-yellow-400">Согласие на обработку персональных данных</a>
          </nav>
        </div>
        <div className="mt-6 text-zinc-600">© {new Date().getFullYear()} Все права защищены</div>
      </footer>
    </main>
  )
}
