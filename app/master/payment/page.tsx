import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_key?: string; page?: string }>
}) {
  const { checkout_key: checkoutKey, page } = await searchParams
  const backPath = page === 'master1' ? '/master1' : '/master'
  const validKey = checkoutKey && /^[0-9a-f-]{36}$/i.test(checkoutKey)
  const [lead] = validKey && process.env.DATABASE_URL
    ? await getDb().select({ paymentStatus: workshopLeads.paymentStatus })
        .from(workshopLeads)
        .where(eq(workshopLeads.checkoutKey, checkoutKey))
        .limit(1)
    : []

  const paid = lead?.paymentStatus === 'succeeded'
  const canceled = lead?.paymentStatus === 'canceled'

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-16 text-white">
      <section className="w-full max-w-xl rounded-2xl bg-zinc-950 p-8 md:p-12" aria-live="polite">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">Мастер-класс по переговорам</p>
        <h1 className="mt-5 text-balance text-3xl font-black uppercase leading-tight md:text-4xl">
          {paid ? 'Оплата прошла' : canceled ? 'Платёж отменён' : lead ? 'Проверяем оплату' : 'Заявка не найдена'}
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          {paid
            ? 'Спасибо! Ваше место на мастер-классе оплачено. Сохраните подтверждение платежа от ЮKassa.'
            : canceled
              ? 'Платёж не завершён. Заявка сохранена; вернитесь к форме, чтобы попробовать снова.'
              : lead
                ? 'Платёж создан. Если вы уже завершили оплату, подождите немного и обновите эту страницу.'
                : 'Не удалось найти заявку по этой ссылке. Проверьте статус платежа в личном кабинете ЮKassa.'}
        </p>
        {!paid && (
          <a href={`${backPath}?retry=${randomUUID()}#participation`} className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-yellow-400 px-6 font-bold text-black transition-colors hover:bg-yellow-300">
            {canceled ? 'Заполнить заявку заново' : 'Вернуться к мастер-классу'}
          </a>
        )}
      </section>
    </main>
  )
}
