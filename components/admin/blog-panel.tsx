"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { StaffRole } from "@/lib/admin-auth"
import {
  type BlogAction,
  type BlogStatus,
  availableActions,
  blogActionLabels,
  blogStatusLabels,
  canDelete,
  canEdit,
  slugify,
} from "@/lib/blog-workflow"
import { renderMarkdown } from "@/lib/markdown"

type PostSummary = {
  id: number
  slug: string
  title: string
  status: BlogStatus
  reviewComment: string | null
  createdBy: StaffRole
  updatedBy: StaffRole
  updatedAt: string
  submittedAt: string | null
  publishedAt: string | null
}

type Post = PostSummary & { excerpt: string; coverUrl: string | null; body: string }
type Form = { title: string; slug: string; excerpt: string; coverUrl: string; body: string }
type Message = { type: "ok" | "error"; text: string }

const emptyForm: Form = { title: "", slug: "", excerpt: "", coverUrl: "", body: "" }

const inputClass = "h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-white outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60"
const labelClass = "mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-400"
const secondaryButton = "h-10 rounded-xl border border-zinc-800 px-4 text-sm font-bold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
const primaryButton = "h-10 rounded-xl bg-yellow-400 px-5 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"

const roleLabels: Record<StaffRole, string> = { admin: "администратор", editor: "редактор" }

const statusFilters = [
  { id: "all", label: "Все" },
  { id: "draft", label: blogStatusLabels.draft },
  { id: "review", label: blogStatusLabels.review },
  { id: "published", label: blogStatusLabels.published },
] as const

type StatusFilter = (typeof statusFilters)[number]["id"]

function statusBadge(status: BlogStatus) {
  const color = status === "published" ? "bg-green-500/15 text-green-400" : status === "review" ? "bg-yellow-400/15 text-yellow-300" : "bg-zinc-800 text-zinc-400"
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{blogStatusLabels[status]}</span>
}

function formatDateTime(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" })
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const result = await response.json().catch(() => null)
  if (!response.ok) throw new Error(result?.error ?? "Что-то пошло не так. Попробуйте ещё раз.")
  return result as T
}

function toForm(post: Post): Form {
  return { title: post.title, slug: post.slug, excerpt: post.excerpt, coverUrl: post.coverUrl ?? "", body: post.body }
}

export function BlogPanel({ role }: { role: StaffRole }) {
  const [posts, setPosts] = useState<PostSummary[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>(role === "admin" ? "review" : "all")
  const [editing, setEditing] = useState<number | "new" | null>(null)

  const load = useCallback(() => {
    request<{ posts: PostSummary[] }>("/api/admin/blog")
      .then((result) => {
        setPosts(result.posts)
        setLoadError(null)
      })
      .catch((error) => setLoadError(error.message))
  }, [])

  useEffect(load, [load])

  if (editing !== null) {
    return (
      <PostEditor
        key={editing}
        id={editing === "new" ? null : editing}
        role={role}
        onClose={() => {
          setEditing(null)
          load()
        }}
        onCreated={(id) => setEditing(id)}
      />
    )
  }

  if (loadError) return <p role="alert" className="rounded-2xl bg-zinc-950 p-6 text-red-400">{loadError}</p>
  if (!posts) return <p className="rounded-2xl bg-zinc-950 p-6 text-zinc-400">Загрузка...</p>

  const counts = { all: posts.length, draft: 0, review: 0, published: 0 }
  for (const post of posts) counts[post.status] += 1
  const visible = filter === "all" ? posts : posts.filter((post) => post.status === filter)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`h-9 rounded-full px-4 text-sm font-bold transition-colors ${
                filter === item.id ? "bg-white text-black" : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              {item.label} <span className="opacity-60">{counts[item.id]}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setEditing("new")} className={primaryButton}>
          Новая статья
        </button>
      </div>

      {role === "admin" && counts.review > 0 && filter !== "review" && (
        <button
          type="button"
          onClick={() => setFilter("review")}
          className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-left text-sm text-yellow-100"
        >
          Ждут согласования: {counts.review}. Показать →
        </button>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-zinc-950 p-6 text-zinc-400">
          {posts.length === 0 ? "Статей пока нет. Нажмите «Новая статья», чтобы начать." : "В этом разделе статей нет."}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-900 overflow-hidden rounded-2xl bg-zinc-950">
          {visible.map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => setEditing(post.id)}
                className="flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors hover:bg-zinc-900 md:flex-row md:items-center md:justify-between md:gap-6"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{post.title}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">/blog/{post.slug}</p>
                  {post.status === "draft" && post.reviewComment && (
                    <p className="mt-1 truncate text-xs text-yellow-300">Возвращена на доработку: {post.reviewComment}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs text-zinc-500">
                  <span>
                    {formatDateTime(post.updatedAt)} · {roleLabels[post.updatedBy] ?? post.updatedBy}
                  </span>
                  {statusBadge(post.status)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PostEditor({
  id,
  role,
  onClose,
  onCreated,
}: {
  id: number | null
  role: StaffRole
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const [post, setPost] = useState<Post | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [saved, setSaved] = useState<Form>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState<"cover" | "body" | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [view, setView] = useState<"edit" | "preview">("edit")
  const [comment, setComment] = useState("")
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const bodyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id === null) return
    request<{ post: Post }>(`/api/admin/blog/${id}`)
      .then((result) => {
        setPost(result.post)
        setForm(toForm(result.post))
        setSaved(toForm(result.post))
        setSlugTouched(true)
      })
      .catch((error) => setLoadError(error.message))
  }, [id])

  const status: BlogStatus = post?.status ?? "draft"
  const editable = canEdit(status, role)
  const dirty = JSON.stringify(form) !== JSON.stringify(saved)
  const actions = post ? availableActions(status, role) : []

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function update(field: keyof Form, value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      // The address follows the title until someone edits it by hand; a published URL is never changed implicitly.
      if (field === "title" && !slugTouched) next.slug = slugify(value)
      return next
    })
  }

  async function save(): Promise<Post | null> {
    setBusy(true)
    setMessage(null)
    try {
      const result = post
        ? await request<{ post: Post }>(`/api/admin/blog/${post.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await request<{ post: Post }>("/api/admin/blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
      if (!post) {
        onCreated(result.post.id)
        return result.post
      }
      setPost(result.post)
      setForm(toForm(result.post))
      setSaved(toForm(result.post))
      setMessage({ type: "ok", text: status === "published" ? "Сохранено. Изменения уже на сайте." : "Сохранено." })
      return result.post
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось сохранить." })
      return null
    } finally {
      setBusy(false)
    }
  }

  async function runAction(action: BlogAction) {
    if (!post) return
    if (action === "return" && !comment.trim()) {
      setMessage({ type: "error", text: "Напишите в комментарии, что нужно доработать." })
      return
    }
    if (action === "unpublish" && !window.confirm("Снять статью с сайта? Она вернётся в черновики.")) return
    // Unsaved edits go out together with the status change, so nothing is lost or approved unseen.
    if (dirty && editable && !(await save())) return

    setBusy(true)
    setMessage(null)
    try {
      const result = await request<{ post: Post }>(`/api/admin/blog/${post.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
      })
      setPost(result.post)
      setForm(toForm(result.post))
      setSaved(toForm(result.post))
      setComment("")
      const texts: Record<BlogAction, string> = {
        submit: "Отправлено на согласование.",
        withdraw: "Статья снова в черновиках.",
        return: "Статья возвращена редактору на доработку.",
        publish: "Опубликовано на сайте.",
        unpublish: "Статья снята с публикации.",
      }
      setMessage({ type: "ok", text: texts[action] })
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось изменить статус." })
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!post || !window.confirm(`Удалить статью «${post.title}»? Это действие нельзя отменить.`)) return
    setBusy(true)
    try {
      await request(`/api/admin/blog/${post.id}`, { method: "DELETE" })
      onClose()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось удалить." })
      setBusy(false)
    }
  }

  async function upload(file: File, target: "cover" | "body") {
    setUploading(target)
    setMessage(null)
    try {
      const data = new FormData()
      data.append("file", file)
      const { url } = await request<{ url: string }>("/api/admin/blog/upload", { method: "POST", body: data })
      if (target === "cover") {
        update("coverUrl", url)
      } else {
        const textarea = bodyRef.current
        const position = textarea?.selectionStart ?? form.body.length
        const snippet = `\n\n![](${url})\n\n`
        update("body", form.body.slice(0, position) + snippet + form.body.slice(position))
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось загрузить картинку." })
    } finally {
      setUploading(null)
    }
  }

  function onFileChange(target: "cover" | "body") {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ""
      if (file) upload(file, target)
    }
  }

  function close() {
    if (dirty && !window.confirm("Есть несохранённые изменения. Закрыть без сохранения?")) return
    onClose()
  }

  if (loadError) return <p role="alert" className="rounded-2xl bg-zinc-950 p-6 text-red-400">{loadError}</p>
  if (id !== null && !post) return <p className="rounded-2xl bg-zinc-950 p-6 text-zinc-400">Загрузка...</p>

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={close} className="text-sm text-zinc-400 transition-colors hover:text-yellow-400">
          ← Все статьи
        </button>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {post && <span>Изменено {formatDateTime(post.updatedAt)} · {roleLabels[post.updatedBy] ?? post.updatedBy}</span>}
          {statusBadge(status)}
        </div>
      </div>

      {post?.status === "draft" && post.reviewComment && (
        <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm leading-relaxed text-yellow-100">
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-yellow-300">Комментарий администратора</p>
          <p className="whitespace-pre-line">{post.reviewComment}</p>
        </div>
      )}

      {!editable && (
        <p className="rounded-xl bg-zinc-950 p-4 text-sm text-zinc-400">
          {status === "review"
            ? "Статья на согласовании у администратора. Чтобы внести правки, верните её в черновики."
            : "Статья опубликована. Править опубликованные статьи может только администратор."}
        </p>
      )}

      <div className="grid gap-6 rounded-2xl bg-zinc-950 p-5 md:p-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <label htmlFor="post-title" className={labelClass}>Заголовок</label>
            <input
              id="post-title"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              maxLength={200}
              disabled={!editable}
              className={`${inputClass} text-lg font-bold`}
            />
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1" role="tablist" aria-label="Режим">
                {(["edit", "preview"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={view === mode}
                    onClick={() => setView(mode)}
                    className={`h-8 rounded-full px-3 text-xs font-bold transition-colors ${
                      view === mode ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {mode === "edit" ? "Текст" : "Предпросмотр"}
                  </button>
                ))}
              </div>
              {editable && view === "edit" && (
                <button type="button" onClick={() => bodyInputRef.current?.click()} disabled={uploading !== null} className="text-xs font-bold text-zinc-400 transition-colors hover:text-yellow-400 disabled:opacity-50">
                  {uploading === "body" ? "Загрузка..." : "+ Вставить картинку"}
                </button>
              )}
            </div>
            {view === "edit" ? (
              <>
                <textarea
                  ref={bodyRef}
                  value={form.body}
                  onChange={(event) => update("body", event.target.value)}
                  disabled={!editable}
                  rows={24}
                  aria-label="Текст статьи"
                  className="min-h-[420px] w-full rounded-xl border border-zinc-800 bg-black p-4 font-mono text-sm leading-relaxed text-white outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60"
                />
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Разметка: <code>## Подзаголовок</code>, <code>**жирный**</code>, <code>*курсив*</code>, <code>[текст](https://ссылка)</code>,{" "}
                  <code>- пункт списка</code>, <code>&gt; цитата</code>, <code>![подпись](адрес картинки)</code>. Пустая строка — новый абзац.
                </p>
              </>
            ) : (
              <div className="min-h-[420px] rounded-xl border border-zinc-800 bg-black p-5 md:p-8">
                <h1 className="mb-6 text-balance text-3xl font-black uppercase leading-[0.98] tracking-[-0.02em]">{form.title || "Без заголовка"}</h1>
                {form.coverUrl && <img src={form.coverUrl} alt="" className="mb-8 w-full rounded-2xl" />}
                <div className="blog-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.body) }} />
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <div>
            <label htmlFor="post-slug" className={labelClass}>Адрес на сайте</label>
            <div className="flex items-center gap-1 text-sm text-zinc-500">
              <span>/blog/</span>
              <input
                id="post-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  update("slug", event.target.value.toLowerCase())
                }}
                maxLength={80}
                disabled={!editable}
                className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-black px-3 text-white outline-none focus:border-yellow-400 disabled:opacity-60"
              />
            </div>
            {status === "published" && saved.slug !== form.slug && (
              <p className="mt-1.5 text-xs text-yellow-300">Старая ссылка перестанет открываться.</p>
            )}
          </div>

          <div>
            <label htmlFor="post-excerpt" className={labelClass}>Анонс</label>
            <textarea
              id="post-excerpt"
              value={form.excerpt}
              onChange={(event) => update("excerpt", event.target.value)}
              maxLength={500}
              rows={4}
              disabled={!editable}
              className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm leading-relaxed text-white outline-none focus:border-yellow-400 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-zinc-500">Показывается в списке статей и в поисковиках. {form.excerpt.length}/500</p>
          </div>

          <div>
            <span className={labelClass}>Обложка</span>
            {form.coverUrl ? (
              <img src={form.coverUrl} alt="" className="mb-2 aspect-video w-full rounded-xl object-cover" />
            ) : (
              <div className="mb-2 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-600">
                Нет обложки
              </div>
            )}
            {editable && (
              <div className="flex gap-2">
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploading !== null} className={`${secondaryButton} flex-1`}>
                  {uploading === "cover" ? "Загрузка..." : form.coverUrl ? "Заменить" : "Загрузить"}
                </button>
                {form.coverUrl && (
                  <button type="button" onClick={() => update("coverUrl", "")} className={secondaryButton}>
                    Убрать
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-900 pt-5">
            {editable && (
              <button type="button" onClick={save} disabled={busy || (!dirty && post !== null)} className={primaryButton}>
                {busy ? "Сохранение..." : post ? "Сохранить" : "Создать черновик"}
              </button>
            )}

            {actions.includes("return") && (
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Комментарий редактору: что доработать"
                aria-label="Комментарий редактору"
                className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none focus:border-yellow-400"
              />
            )}

            {actions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => runAction(action)}
                disabled={busy}
                className={
                  action === "publish"
                    ? "h-10 rounded-xl bg-green-500 px-5 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-green-400 disabled:opacity-60"
                    : action === "submit"
                      ? "h-10 rounded-xl border border-yellow-400 px-5 text-sm font-bold text-yellow-400 transition-colors hover:bg-yellow-400/10 disabled:opacity-60"
                      : secondaryButton
                }
              >
                {dirty && editable && (action === "submit" || action === "publish") ? `Сохранить и ${blogActionLabels[action].toLowerCase()}` : blogActionLabels[action]}
              </button>
            ))}

            {status === "published" && post && (
              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} flex items-center justify-center`}>
                Открыть на сайте
              </a>
            )}

            {post && canDelete(status, role) && (
              <button type="button" onClick={remove} disabled={busy} className="mt-2 text-xs text-zinc-500 transition-colors hover:text-red-400">
                Удалить статью
              </button>
            )}
          </div>

          {message && (
            <p role={message.type === "error" ? "alert" : "status"} className={`text-sm ${message.type === "error" ? "text-red-400" : "text-green-400"}`}>
              {message.text}
            </p>
          )}
        </aside>
      </div>

      <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFileChange("cover")} />
      <input ref={bodyInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFileChange("body")} />
    </section>
  )
}
