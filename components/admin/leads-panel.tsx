"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  type AdminLead,
  type LeadFilters,
  type SourceFilter,
  type StatusFilter,
  NO_UTM,
  botClickLabel,
  dayKey,
  daysAgoKey,
  filterLeads,
  formatDateTime,
  formatMoney,
  groupByUtm,
  hasUtm,
  inPeriod,
  leadAmount,
  leadsToCsv,
  paymentLabels,
  percent,
  personKey,
  salebotLabels,
  sourceLabels,
  summarize,
  utmSources,
  utmValue,
} from "@/lib/admin-leads"
import { type UtmKey, UTM_KEYS, utmColumnByKey, utmLabels } from "@/lib/utm"

const periods = [
  { id: "today", label: "Сегодня", days: 0 },
  { id: "7", label: "7 дней", days: 6 },
  { id: "30", label: "30 дней", days: 29 },
  { id: "all", label: "Всё время", days: null },
] as const

const statusOptions: Record<SourceFilter, { value: StatusFilter; label: string }[]> = {
  all: [{ value: "all", label: "Любой статус" }],
  guide: [
    { value: "all", label: "Любой статус" },
    { value: "clicked", label: "Перешли в бота" },
    { value: "not_clicked", label: "Не перешли в бота" },
  ],
  masterclass: [
    { value: "all", label: "Любой статус" },
    { value: "succeeded", label: "Оплачено" },
    { value: "pending", label: "Ожидает оплаты" },
    { value: "canceled", label: "Отменено" },
  ],
}

const controlClass = "h-10 rounded-xl border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-yellow-400"

function paymentBadge(lead: AdminLead) {
  if (lead.source !== "masterclass") return <span className="text-zinc-600">—</span>
  const status = lead.paymentStatus ?? ""
  const color = status === "succeeded" ? "bg-green-500/15 text-green-400" : status === "pending" ? "bg-yellow-400/15 text-yellow-300" : "bg-zinc-800 text-zinc-400"
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{paymentLabels[status] ?? "—"}</span>
}

function botBadge(lead: AdminLead) {
  if (lead.source !== "guide") return <span className="text-zinc-600">—</span>
  const label = botClickLabel(lead)
  const color = lead.botClickedAt ? "bg-green-500/15 text-green-400" : "bg-zinc-800 text-zinc-400"
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{label}</span>
}

function utmSummary(lead: AdminLead) {
  if (!hasUtm(lead)) return <span className="text-zinc-600">—</span>
  return (
    <div className="max-w-56">
      <p className="truncate" title={lead.utmSource ?? undefined}>{[lead.utmSource, lead.utmMedium].filter(Boolean).join(" / ") || "—"}</p>
      {lead.utmCampaign && <p className="truncate text-xs text-zinc-500">{lead.utmCampaign}</p>}
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-zinc-950 p-4 md:p-5">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">{label}</span>
      <strong className="text-2xl font-black tabular-nums md:text-3xl">{value}</strong>
      {note && <span className="text-xs text-zinc-500">{note}</span>}
    </div>
  )
}

export function LeadsPanel() {
  const router = useRouter()
  const [leads, setLeads] = useState<AdminLead[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>("30")
  const [filters, setFilters] = useState<LeadFilters>({ from: daysAgoKey(29), to: "", source: "all", status: "all", utmSource: "", query: "" })
  const [selected, setSelected] = useState<AdminLead | null>(null)
  const [groupBy, setGroupBy] = useState<UtmKey>("utm_source")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/leads", { cache: "no-store" })
      if (response.status === 401) {
        router.refresh()
        return
      }
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? "Не удалось загрузить заявки.")
      setLeads(result.leads)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить заявки.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!selected) return
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null) }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [selected])

  function choosePeriod(id: string) {
    const option = periods.find((item) => item.id === id)
    setPeriod(id)
    if (!option) return
    setFilters((current) => ({ ...current, from: option.days === null ? "" : daysAgoKey(option.days), to: "" }))
  }

  function updateFilters(patch: Partial<LeadFilters>) {
    setFilters((current) => ({ ...current, ...patch }))
  }

  const periodLeads = useMemo(() => (leads ?? []).filter((lead) => inPeriod(lead, filters.from, filters.to)), [leads, filters.from, filters.to])
  const stats = useMemo(() => summarize(periodLeads), [periodLeads])
  const utmGroups = useMemo(() => groupByUtm(periodLeads, groupBy), [periodLeads, groupBy])
  const sourceOptions = useMemo(() => utmSources(leads ?? []), [leads])
  const visible = useMemo(() => filterLeads(leads ?? [], filters), [leads, filters])
  const history = useMemo(() => {
    if (!selected || !leads) return []
    const key = personKey(selected)
    return leads.filter((lead) => personKey(lead) === key)
  }, [selected, leads])

  function exportCsv() {
    const blob = new Blob([leadsToCsv(visible)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `zayavki-${dayKey(new Date())}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (error && !leads) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-zinc-950 p-6">
        <p role="alert" className="text-red-400">{error}</p>
        <button type="button" onClick={load} className="h-10 rounded-xl bg-yellow-400 px-5 text-sm font-black text-black">Повторить</button>
      </div>
    )
  }

  if (!leads) return <p className="rounded-2xl bg-zinc-950 p-6 text-zinc-400">Загрузка...</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {periods.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => choosePeriod(item.id)}
            className={`h-9 rounded-full px-4 text-sm font-bold transition-colors ${period === item.id ? "bg-white text-black" : "bg-zinc-950 text-zinc-400 hover:text-white"}`}
          >
            {item.label}
          </button>
        ))}
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <input
            type="date"
            aria-label="С даты"
            value={filters.from}
            onChange={(event) => { setPeriod("custom"); updateFilters({ from: event.target.value }) }}
            className={controlClass}
          />
          <span>—</span>
          <input
            type="date"
            aria-label="По дату"
            value={filters.to}
            onChange={(event) => { setPeriod("custom"); updateFilters({ to: event.target.value }) }}
            className={controlClass}
          />
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-6" aria-label="Сводка за период">
        <StatCard label="Людей" value={String(stats.people)} note="уникальных по телефону" />
        <StatCard label="Заявки на гайд" value={String(stats.guide)} />
        <StatCard
          label="Перешли в бота"
          value={String(stats.clicked)}
          note={stats.tracked > 0 ? `${percent(stats.clicked, stats.tracked)} от отслеживаемых` : "нет данных"}
        />
        <StatCard label="Регистрации на МК" value={String(stats.masterclass)} />
        <StatCard label="Оплатили" value={String(stats.paid)} note={`${percent(stats.paid, stats.masterclass)} от регистраций`} />
        <StatCard label="Выручка" value={formatMoney(stats.revenue)} />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-zinc-950 p-4 md:p-6" aria-label="Источники трафика">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Источники трафика (UTM) за период</h2>
          <select aria-label="Группировать по метке" value={groupBy} onChange={(event) => setGroupBy(event.target.value as UtmKey)} className={controlClass}>
            {UTM_KEYS.map((key) => (
              <option key={key} value={key}>{utmLabels[key]} — {key}</option>
            ))}
          </select>
        </div>
        <div className="-mx-4 overflow-x-auto md:mx-0">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                <th className="px-4 py-3 font-extrabold">{groupBy}</th>
                <th className="px-4 py-3 text-right font-extrabold">Заявок</th>
                <th className="px-4 py-3 text-right font-extrabold">Гайд</th>
                <th className="px-4 py-3 text-right font-extrabold">В бота</th>
                <th className="px-4 py-3 text-right font-extrabold">МК</th>
                <th className="px-4 py-3 text-right font-extrabold">Оплатили</th>
                <th className="px-4 py-3 text-right font-extrabold">Выручка</th>
              </tr>
            </thead>
            <tbody>
              {utmGroups.map((group) => (
                <tr key={group.value} className="border-b border-zinc-900">
                  <td className={`max-w-72 truncate px-4 py-3 ${group.value === NO_UTM ? "text-zinc-500" : "font-bold"}`} title={group.value}>
                    {groupBy === "utm_source" ? (
                      <button type="button" className="max-w-full truncate text-left hover:text-yellow-400" title="Показать заявки из этого источника" onClick={() => updateFilters({ utmSource: group.value })}>
                        {group.value}
                      </button>
                    ) : group.value}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{group.leads}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{group.guide}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{group.clicked}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{group.masterclass}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{group.paid} <span className="text-zinc-500">({percent(group.paid, group.masterclass)})</span></td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMoney(group.revenue)}</td>
                </tr>
              ))}
              {utmGroups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">Нет заявок за период.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-zinc-950 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Имя, телефон, Telegram или UTM"
            aria-label="Поиск"
            value={filters.query}
            onChange={(event) => updateFilters({ query: event.target.value })}
            className={`${controlClass} min-w-0 flex-1 basis-56`}
          />
          <select
            aria-label="Тип заявки"
            value={filters.source}
            onChange={(event) => updateFilters({ source: event.target.value as SourceFilter, status: "all" })}
            className={controlClass}
          >
            <option value="all">Все заявки</option>
            <option value="guide">Гайд</option>
            <option value="masterclass">Мастер-класс</option>
          </select>
          <select
            aria-label="Статус"
            value={filters.status}
            onChange={(event) => updateFilters({ status: event.target.value as StatusFilter })}
            disabled={filters.source === "all"}
            className={`${controlClass} disabled:opacity-50`}
          >
            {statusOptions[filters.source].map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            aria-label="Источник (utm_source)"
            value={filters.utmSource}
            onChange={(event) => updateFilters({ utmSource: event.target.value })}
            className={`${controlClass} max-w-56`}
          >
            <option value="">Все источники</option>
            {sourceOptions.map((value) => (
              <option key={value} value={value}>{value.length > 40 ? `${value.slice(0, 40)}…` : value}</option>
            ))}
          </select>
          <button type="button" onClick={load} disabled={loading} className="h-10 rounded-xl border border-zinc-800 px-4 text-sm font-bold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-50">
            {loading ? "Обновление..." : "Обновить"}
          </button>
          <button type="button" onClick={exportCsv} disabled={visible.length === 0} className="h-10 rounded-xl bg-yellow-400 px-4 text-sm font-black text-black transition-colors hover:bg-yellow-300 disabled:opacity-50">
            Скачать CSV
          </button>
        </div>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <p className="text-sm text-zinc-500">Показано заявок: {visible.length}</p>

        <div className="-mx-4 overflow-x-auto md:mx-0">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                <th className="px-4 py-3 font-extrabold">Дата</th>
                <th className="px-4 py-3 font-extrabold">Тип</th>
                <th className="px-4 py-3 font-extrabold">Имя</th>
                <th className="px-4 py-3 font-extrabold">Телефон</th>
                <th className="px-4 py-3 font-extrabold">Telegram</th>
                <th className="px-4 py-3 font-extrabold">Бот</th>
                <th className="px-4 py-3 font-extrabold">Оплата</th>
                <th className="px-4 py-3 font-extrabold">Salebot</th>
                <th className="px-4 py-3 font-extrabold">UTM</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="cursor-pointer border-b border-zinc-900 transition-colors hover:bg-zinc-900"
                >
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-400">{formatDateTime(lead.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{sourceLabels[lead.source] ?? lead.source}</td>
                  <td className="px-4 py-3 font-bold">
                    <button type="button" className="text-left hover:text-yellow-400" onClick={(event) => { event.stopPropagation(); setSelected(lead) }}>
                      {lead.name}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">{lead.phone}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-300">{lead.telegram || "—"}</td>
                  <td className="px-4 py-3">{botBadge(lead)}</td>
                  <td className="px-4 py-3">{paymentBadge(lead)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                    {lead.source === "masterclass" ? salebotLabels[lead.salebotNotificationStatus ?? ""] ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{utmSummary(lead)}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">Заявок не найдено. Измените период или фильтры.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={() => setSelected(null)} role="presentation">
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Карточка: ${selected.name}`}
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto bg-zinc-950 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black leading-tight">{selected.name}</h2>
                <p className="mt-2 text-sm tabular-nums text-zinc-400">{selected.phone}</p>
                {selected.telegram && (
                  <a
                    href={`https://t.me/${selected.telegram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-yellow-400 hover:underline"
                  >
                    {selected.telegram.startsWith("@") ? selected.telegram : `@${selected.telegram}`}
                  </a>
                )}
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Закрыть" className="text-3xl leading-none text-zinc-500 hover:text-white">×</button>
            </div>

            <div>
              <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Все действия ({history.length})</h3>
              <ol className="flex flex-col gap-3">
                {history.map((lead) => (
                  <li key={lead.id} className="rounded-xl bg-black p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{lead.source === "guide" ? "Заявка на гайд" : "Регистрация на мастер-класс"}</strong>
                      <span className="tabular-nums text-xs text-zinc-500">{formatDateTime(lead.createdAt)}</span>
                    </div>
                    {lead.source === "guide" ? (
                      <p className="mt-2 text-zinc-400">
                        Бот: {botClickLabel(lead)}
                        {lead.botClickedAt && <span className="text-zinc-500"> · {formatDateTime(lead.botClickedAt)}</span>}
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-col gap-1 text-zinc-400">
                        <p>Оплата: {paymentLabels[lead.paymentStatus ?? ""] ?? "—"} · {formatMoney(leadAmount(lead))}</p>
                        <p>Salebot: {salebotLabels[lead.salebotNotificationStatus ?? ""] ?? "—"}</p>
                      </div>
                    )}
                    {hasUtm(lead) ? (
                      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-zinc-900 pt-3 text-xs">
                        {UTM_KEYS.filter((key) => lead[utmColumnByKey[key]]).map((key) => (
                          <div key={key} className="contents">
                            <dt className="text-zinc-500">{key}</dt>
                            <dd className="break-all text-zinc-300">{utmValue(lead, key)}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="mt-3 border-t border-zinc-900 pt-3 text-xs text-zinc-600">Без UTM-меток</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
