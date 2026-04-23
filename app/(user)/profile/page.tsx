import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { LogoutButton } from "@/components/common/logout-button"

export default async function ProfilePage() {
	const session = await getCurrentSession()

	if (!session) {
		redirect("/login")
	}

	if (session.role === "admin") {
		redirect("/admin/dashboard")
	}

	return (
		<main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
			<div className="container mx-auto max-w-3xl px-5 md:px-8">
				<div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
					<p className="text-xs font-bold uppercase tracking-widest text-amber-600">My Account</p>
					<h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">Welcome, {session.name}</h1>
					<p className="mt-2 text-slate-500">Signed in as {session.email}</p>

					<div className="mt-6 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2">
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Role</p>
							<p className="mt-1 text-sm font-bold text-[#1c1917]">{session.role}</p>
						</div>
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Email</p>
							<p className="mt-1 text-sm font-bold text-[#1c1917] break-all">{session.email}</p>
						</div>
					</div>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Link
							href="/my-orders"
							className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#1c1917] text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]"
						>
							View My Orders
						</Link>
						<LogoutButton className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]" />
					</div>
				</div>
			</div>
		</main>
	)
}
