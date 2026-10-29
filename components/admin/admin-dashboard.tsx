"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { LeadsPanel } from "@/components/admin/leads-panel"
import { MasterclassPanel } from "@/components/admin/masterclass-panel"

const tabs = [
  { id: "leads", label: "Заявки" },
  { id: "masterclass", label: "Мастер-класс" },
] as const

type TabId = (typeof tabs)[number]["id"]

export function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>("leads")

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {})
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Игорь Беляев</p>
          <h1 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight md:text-3xl">Админ-панель</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/master" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 transition-colors hover:text-yellow-400">
            Открыть сайт
          </a>
          <button
            type="button"
            onClick={logout}
            className="h-10 rounded-xl border border-zinc-800 px-4 text-sm font-bold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            Выйти
          </button>
        </div>
      </header>

      <nav className="flex gap-2" role="tablist" aria-label="Разделы">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`h-10 rounded-full px-5 text-sm font-bold transition-colors ${
              tab === item.id ? "bg-yellow-400 text-black" : "bg-zinc-950 text-zinc-400 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "leads" ? <LeadsPanel /> : <MasterclassPanel />}
    </div>
  )
}
