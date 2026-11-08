"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { BlogPanel } from "@/components/admin/blog-panel"
import { LeadsPanel } from "@/components/admin/leads-panel"
import { MasterclassPanel } from "@/components/admin/masterclass-panel"
import type { StaffRole } from "@/lib/admin-auth"

const allTabs = [
  { id: "leads", label: "Заявки", roles: ["admin"] },
  { id: "masterclass", label: "Мастер-класс", roles: ["admin"] },
  { id: "masterclass1", label: "Мастер-класс 1", roles: ["admin"] },
  { id: "blog", label: "Блог", roles: ["admin", "editor"] },
] as const

type TabId = (typeof allTabs)[number]["id"]

export function AdminDashboard({ role }: { role: StaffRole }) {
  const router = useRouter()
  const tabs = allTabs.filter((item) => (item.roles as readonly StaffRole[]).includes(role))
  const [tab, setTab] = useState<TabId>(tabs[0].id)

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {})
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Игорь Беляев</p>
          <h1 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight md:text-3xl">
            {role === "editor" ? "Редакция блога" : "Админ-панель"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <a href={role === "editor" ? "/blog" : "/master"} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 transition-colors hover:text-yellow-400">
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

      {tabs.length > 1 && (
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
      )}

      {tab === "leads" && <LeadsPanel />}
      {tab === "masterclass" && <MasterclassPanel key="master" />}
      {tab === "masterclass1" && <MasterclassPanel key="master1" page="master1" />}
      {tab === "blog" && <BlogPanel role={role} />}
    </div>
  )
}
