"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const data = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? "Не удалось войти. Попробуйте ещё раз.")
      router.refresh()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти. Попробуйте ещё раз.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-zinc-950 p-6 md:p-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Игорь Беляев</p>
          <h1 className="mt-3 text-3xl font-black uppercase leading-none tracking-tight">Админ-панель</h1>
        </div>

        {!configured && (
          <p role="alert" className="text-sm text-red-400">
            Пароль администратора не задан. Добавьте переменную LEADS_EXPORT_PASSWORD в настройках хостинга.
          </p>
        )}

        <div>
          <label htmlFor="admin-username" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-400">
            Логин
          </label>
          <input
            id="admin-username"
            name="username"
            autoComplete="username"
            defaultValue="admin"
            required
            className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-white outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-400">
            Пароль
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-white outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !configured}
          className="mt-1 h-12 w-full rounded-xl bg-yellow-400 text-base font-black uppercase tracking-wide text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  )
}
