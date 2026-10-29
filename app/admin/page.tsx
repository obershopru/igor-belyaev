import type { Metadata } from "next"
import { cookies } from "next/headers"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminLogin } from "@/components/admin/admin-login"
import { COOKIE_NAME, isAdminConfigured, isAdminToken } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Админ-панель — Игорь Беляев",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  const authorized = isAdminToken(token)

  return (
    <main className="min-h-dvh bg-black font-sans text-white [color-scheme:dark]">
      {authorized ? <AdminDashboard /> : <AdminLogin configured={isAdminConfigured()} />}
    </main>
  )
}
