"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { mentoringQuestions } from "@/lib/mentoring"
import { currentUtm, rememberUtm } from "@/lib/utm"

// Classes in the palette of the /mentoring page (the lesson deck's navy and gold).
const t = {
  input:
    "rounded-md border-[#2A3350] bg-[#0B1020] text-[#E9EAEE] placeholder:text-[#596075] focus:border-[#C9A066] focus:ring-[#C9A066]",
  label: "font-normal tracking-[0.14em] text-[#A3A9B6]",
  card: "rounded-lg border border-[#2A3350] bg-[#070B19]",
  icon: "rounded-full border border-[#C9A066] text-[#C9A066]",
  heading: "font-normal tracking-[0.01em] text-[#E9EAEE]",
  text: "text-[#A3A9B6]",
  eyebrow: "font-normal tracking-[0.24em] text-[#C9A066]",
  legend: "font-normal text-[#E9EAEE]",
  faint: "text-[#6E7589]",
  hint: "text-[#8A90A0]",
  option:
    "rounded-md border-[#2A3350] bg-[#0B1020] text-[#C9CDD6] hover:border-[#4A5470] has-[:checked]:border-[#C9A066] has-[:checked]:text-[#E9EAEE]",
  accent: "accent-[#C9A066]",
  link: "text-[#E9EAEE] hover:text-[#C9A066]",
  button: "rounded-md bg-[#C9A066] font-normal tracking-[0.12em] text-[#070B19] hover:bg-[#D6B27D]",
}

const contacts = [
  { id: "name", label: "Имя", placeholder: "Иван Иванов", type: "text", autoComplete: "name", required: true, maxLength: 120 },
  { id: "phone", label: "Телефон", placeholder: "+7 999 000-00-00", type: "tel", autoComplete: "tel", required: true, maxLength: 32 },
  { id: "telegram", label: "Ник в Telegram", placeholder: "@username", type: "text", autoComplete: "off", required: false, maxLength: 64 },
] as const

export function MentoringForm() {
  const inputClass = `w-full border px-4 outline-none transition-colors focus:ring-1 ${t.input}`
  const labelClass = `mb-1.5 block text-[11px] uppercase ${t.label}`
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rememberUtm()
  }, [])

  // The form is long; once it collapses into the confirmation, bring that into view.
  useEffect(() => {
    if (submitted) statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [submitted])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const data = new FormData(event.currentTarget)
    const answers = Object.fromEntries(mentoringQuestions.map((question) => [question.id, String(data.get(question.id) ?? "")]))
    const payload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      telegram: String(data.get("telegram") ?? ""),
      consent: data.get("consent") === "on",
      source: "mentoring",
      answers,
      utm: currentUtm(),
    }

    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? "Не удалось отправить заявку. Попробуйте ещё раз.")
      setSubmitted(true)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось отправить заявку. Попробуйте ещё раз.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div ref={statusRef} className={`flex flex-col items-start justify-center p-8 md:p-10 ${t.card}`} role="status" aria-live="polite">
        <span className={`flex size-12 items-center justify-center ${t.icon}`} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className={`mt-6 font-sans text-3xl uppercase leading-none md:text-4xl ${t.heading}`}>Заявка принята</h2>
        <p className={`mt-3 max-w-[52ch] text-pretty leading-relaxed ${t.text}`}>
          Игорь лично прочитает ваши ответы. Затем с вами свяжутся, чтобы договориться о созвоне на 20–30 минут: на нём проверим, подойдёт ли вам группа.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-6 p-6 md:p-8 ${t.card}`}>
      <div>
        <p className={`text-[11px] uppercase ${t.eyebrow}`}>Пять вопросов · около пяти минут</p>
        <h2 className={`mt-3 font-sans text-3xl uppercase leading-none md:text-4xl ${t.heading}`}>Заявка в группу</h2>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={`mb-3 text-sm ${t.legend}`}>Как с вами связаться</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          {contacts.map((field) => (
            <div key={field.id}>
              <label htmlFor={`mentoring-${field.id}`} className={labelClass}>
                {field.label}
                {!field.required && <span className={`normal-case tracking-normal ${t.faint}`}> (необязательно)</span>}
              </label>
              <input
                id={`mentoring-${field.id}`}
                name={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                required={field.required}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                className={`h-12 ${inputClass}`}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className={`mb-3 text-sm ${t.legend}`}>О вас и ваших переговорах</legend>
        {mentoringQuestions.map((question, index) => (
          <div key={question.id}>
            {question.kind === "choice" ? (
              <fieldset>
                <legend className={labelClass}>
                  {index + 1}. {question.label}
                </legend>
                <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors ${t.option}`}
                    >
                      <input type="radio" name={question.id} value={option} required className={`size-4 shrink-0 ${t.accent}`} />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <>
                <label htmlFor={`mentoring-${question.id}`} className={labelClass}>
                  {index + 1}. {question.label}
                </label>
                {question.hint && <p className={`-mt-0.5 mb-2 text-xs ${t.hint}`}>{question.hint}</p>}
                {question.kind === "textarea" ? (
                  <textarea
                    id={`mentoring-${question.id}`}
                    name={question.id}
                    required
                    rows={3}
                    maxLength={question.maxLength}
                    placeholder={question.placeholder}
                    className={`min-h-24 resize-y py-3 leading-relaxed ${inputClass}`}
                  />
                ) : (
                  <input
                    id={`mentoring-${question.id}`}
                    name={question.id}
                    type="text"
                    required
                    maxLength={question.maxLength}
                    placeholder={question.placeholder}
                    className={`h-12 ${inputClass}`}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </fieldset>

      <div className={`flex items-start gap-3 text-xs ${t.text}`}>
        <input
          type="checkbox"
          id="mentoring-consent"
          name="consent"
          required
          className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded ${t.accent}`}
        />
        <label htmlFor="mentoring-consent" className="cursor-pointer select-none leading-snug">
          Я даю{" "}
          <a
            href="https://drive.google.com/file/d/1jVXxlq3I9YIp5UgCUHGxiylBgfazeBrm/view"
            target="_blank"
            rel="noopener noreferrer"
            className={`underline transition-colors ${t.link}`}
          >
            согласие на обработку персональных данных
          </a>{" "}
          в соответствии с{" "}
          <a
            href="https://drive.google.com/file/d/1LOpqvvGNEhEtwlEIWB1EnyHHMAuv3x9U/view"
            target="_blank"
            rel="noopener noreferrer"
            className={`underline transition-colors ${t.link}`}
          >
            политикой обработки персональных данных
          </a>
          .
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className={`h-14 w-full font-sans text-base uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${t.button}`}
      >
        {submitting ? "Отправка..." : "Отправить заявку"}
      </button>
      <p className={`-mt-3 text-center text-xs ${t.hint}`}>Заявка ни к чему не обязывает. Оплата только после созвона, если группа вам подходит.</p>
    </form>
  )
}
