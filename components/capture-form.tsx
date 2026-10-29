"use client"

import type React from "react"
import { useRef, useState } from "react"

type CaptureFormProps = {
  mode?: "guide" | "masterclass"
  price?: string
}

const fields = [
  { id: "name", label: "Имя", placeholder: "Иван Иванов", type: "text", autoComplete: "name", required: true },
  { id: "phone", label: "Телефон", placeholder: "+7 999 000-00-00", type: "tel", autoComplete: "tel", required: true },
  { id: "telegram", label: "Ник в Telegram", placeholder: "@username", type: "text", autoComplete: "off", required: false },
] as const

export function CaptureForm({ mode = "guide", price = "9 990" }: CaptureFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const checkoutKey = useRef<string | null>(null)
  const botClickKey = useRef<string | null>(null)
  const isMasterclass = mode === "masterclass"

  function trackBotClick() {
    if (!botClickKey.current) return
    const body = JSON.stringify({ key: botClickKey.current })
    // sendBeacon survives the tab switch to Telegram; fetch with keepalive is the fallback.
    if (!navigator.sendBeacon?.("/api/leads/bot-click", new Blob([body], { type: "application/json" }))) {
      fetch("/api/leads/bot-click", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {})
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      telegram: String(data.get("telegram") ?? ""),
      consent: data.get("consent") === "on",
      source: mode,
      ...(isMasterclass
        ? { salebotClientId: new URLSearchParams(window.location.search).get("salebot_client_id") ?? "" }
        : {}),
    }

    setSubmitting(true)
    setError(null)

    try {
      const endpoint = isMasterclass ? "/api/payments/create" : "/api/leads"
      if (isMasterclass) {
        checkoutKey.current ??= window.crypto.randomUUID()
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...(isMasterclass ? { checkoutKey: checkoutKey.current } : {}) }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? "Не удалось отправить заявку. Попробуйте ещё раз.")
      if (isMasterclass) {
        if (typeof result?.redirectUrl !== "string") throw new Error("Не удалось получить ссылку на оплату. Попробуйте ещё раз.")
        window.location.assign(result.redirectUrl)
        return
      }
      botClickKey.current = typeof result?.botClickKey === "string" ? result.botClickKey : null
      setSubmitted(true)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось отправить заявку. Попробуйте ещё раз.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-start justify-center rounded-2xl bg-zinc-950 p-8 md:p-10" role="status" aria-live="polite">
        <span className="flex size-12 items-center justify-center rounded-full bg-yellow-400 text-black" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="mt-6 font-sans text-3xl font-black uppercase leading-none tracking-tight text-white md:text-4xl">
          Спасибо!
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-zinc-400">
          Данные сохранены. Перейдите в Telegram-бота, чтобы забрать гайд.
        </p>
        {!isMasterclass && (
          <a
            href="https://t.me/belyaev_negotiyations_bot"
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackBotClick}
            className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-xl bg-yellow-400 text-base font-black uppercase tracking-wide text-black transition-colors hover:bg-yellow-300"
          >
            Перейти в Telegram-бота
          </a>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-zinc-950 p-6 md:p-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">
          {isMasterclass ? "Участие в мастер-классе" : "Остался один шаг"}
        </p>
        <h2 className="mt-3 font-sans text-3xl font-black uppercase leading-none tracking-tight text-white md:text-4xl">
          {isMasterclass ? "Оставить заявку" : "Заберите гайд"}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={`${mode}-${field.id}`} className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-400">
              {field.label}
            </label>
            <input
              id={`${mode}-${field.id}`}
              name={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              required={field.required || (isMasterclass && field.id === "telegram")}
              placeholder={field.placeholder}
              maxLength={field.id === "name" ? 120 : field.id === "phone" ? 32 : 64}
              className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-start gap-3 text-xs text-zinc-400">
        <input
          type="checkbox"
          id={`${mode}-consent`}
          name="consent"
          required
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-700 bg-zinc-900 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-zinc-900"
        />
        <label htmlFor={`${mode}-consent`} className="cursor-pointer select-none leading-snug">
          Я даю{" "}
          <a
            href={isMasterclass
              ? "https://drive.google.com/file/d/1jVXxlq3I9YIp5UgCUHGxiylBgfazeBrm/view"
              : "https://drive.google.com/file/d/1Az6vBCjpC2lnrKxvCkRIk8vtGkqKZv9C/view"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 underline transition-colors hover:text-yellow-400"
          >
            согласие на обработку персональных данных
          </a>{" "}
          в соответствии с{" "}
          <a
            href={isMasterclass
              ? "https://drive.google.com/file/d/1LOpqvvGNEhEtwlEIWB1EnyHHMAuv3x9U/view"
              : "https://drive.google.com/file/d/18mjLhJ1Pk6L_Lg8o-heN4RLQOUA5L9-c/view"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 underline transition-colors hover:text-yellow-400"
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
        className="mt-1 h-14 w-full rounded-xl bg-yellow-400 text-base font-black uppercase tracking-wide text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (isMasterclass ? "Переход к оплате..." : "Отправка...") : isMasterclass ? `Оплатить через СБП — ${price} рублей` : "Забрать гайд в Telegram"}
      </button>
    </form>
  )
}
