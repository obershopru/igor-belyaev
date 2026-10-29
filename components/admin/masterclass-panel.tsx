"use client"

import type React from "react"
import { useEffect, useState } from "react"

type Settings = { date: string; duration: string; price: number }

const inputClass = "h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-white outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
const labelClass = "mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-400"

export function MasterclassPanel() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saved, setSaved] = useState<Settings | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/masterclass")
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (!response.ok) throw new Error(result?.error ?? "Не удалось загрузить настройки.")
        setSettings(result.settings)
        setSaved(result.settings)
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Не удалось загрузить настройки."))
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!settings || saving) return
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/masterclass", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? "Не удалось сохранить настройки.")
      setSettings(result.settings)
      setSaved(result.settings)
      setMessage({ type: "ok", text: "Сохранено. Страница мастер-класса обновлена." })
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось сохранить настройки." })
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <p role="alert" className="rounded-2xl bg-zinc-950 p-6 text-red-400">{loadError}</p>
  if (!settings) return <p className="rounded-2xl bg-zinc-950 p-6 text-zinc-400">Загрузка...</p>

  const priceChanged = saved !== null && saved.price !== settings.price
  const formattedPrice = Number.isFinite(settings.price) ? settings.price.toLocaleString("ru-RU") : "—"

  return (
    <form onSubmit={handleSubmit} className="grid max-w-3xl gap-6 rounded-2xl bg-zinc-950 p-6 md:grid-cols-2 md:p-8">
      <div className="md:col-span-2">
        <h2 className="text-xl font-black uppercase tracking-tight">Параметры мастер-класса</h2>
        <p className="mt-2 text-sm text-zinc-400">Изменения сразу появятся на странице /master и на кнопке оплаты.</p>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="mc-date" className={labelClass}>Дата и время</label>
        <input
          id="mc-date"
          value={settings.date}
          onChange={(event) => setSettings({ ...settings, date: event.target.value })}
          placeholder="9 ноября, 19:30"
          maxLength={80}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="mc-duration" className={labelClass}>Длительность</label>
        <input
          id="mc-duration"
          value={settings.duration}
          onChange={(event) => setSettings({ ...settings, duration: event.target.value })}
          placeholder="2 часа"
          maxLength={40}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="mc-price" className={labelClass}>Стоимость, ₽</label>
        <input
          id="mc-price"
          type="number"
          inputMode="numeric"
          min={1}
          max={1000000}
          step={1}
          value={Number.isFinite(settings.price) ? settings.price : ""}
          onChange={(event) => setSettings({ ...settings, price: event.target.valueAsNumber })}
          required
          className={inputClass}
        />
      </div>

      {priceChanged && (
        <p className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm leading-relaxed text-yellow-100 md:col-span-2">
          Новая цена применится к новым заявкам. Те, кто уже начал оплату, заплатят прежнюю сумму — их оплата подтвердится как обычно.
        </p>
      )}

      <div className="rounded-xl bg-black p-4 text-sm text-zinc-400 md:col-span-2">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Как будет на сайте</p>
        <p><span className="text-zinc-500">Дата и время:</span> <span className="text-white">{settings.date || "—"}</span></p>
        <p><span className="text-zinc-500">Длительность:</span> <span className="text-white">{settings.duration || "—"}</span></p>
        <p><span className="text-zinc-500">Кнопка:</span> <span className="text-white">Оплатить через СБП — {formattedPrice} рублей</span></p>
      </div>

      {message && (
        <p role={message.type === "error" ? "alert" : "status"} className={`text-sm md:col-span-2 ${message.type === "error" ? "text-red-400" : "text-green-400"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="h-12 rounded-xl bg-yellow-400 px-8 text-base font-black uppercase tracking-wide text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 md:justify-self-start"
      >
        {saving ? "Сохранение..." : "Сохранить"}
      </button>
    </form>
  )
}
