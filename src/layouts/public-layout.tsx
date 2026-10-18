import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { ArrowRight, Menu } from 'lucide-react'

import { IslandMark } from '@/components/shared/island-mark'
import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { kontak } from '@/data/pengenalan'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/pengenalan', label: 'Pengenalan', end: false },
]

const footerNav = [
  { to: '/', label: 'Beranda' },
  { to: '/pengenalan', label: 'Pengenalan' },
  { to: '/register', label: 'Daftar' },
  { to: '/login', label: 'Masuk' },
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

const currentYear = new Date().getFullYear()

export function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div aria-hidden="true" className="flex h-1.5">
          <span className="flex-1 bg-main" />
          <span className="flex-1 bg-accent-teal" />
          <span className="flex-1 bg-accent-orange" />
        </div>

        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            to="/"
            className={cn(
              'group flex items-center gap-2 rounded-base font-heading text-lg',
              focusRing,
            )}
          >
            <IslandMark
              className="size-9 transition-transform group-hover:-rotate-6"
              decorative
            />
            Asrama Kepri
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-1 rounded-base border-2 border-border p-1 md:flex"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-base border-2 px-3 py-1.5 font-heading text-sm',
                    focusRing,
                    isActive
                      ? 'border-border bg-main text-main-foreground'
                      : 'border-transparent hover:border-border hover:bg-accent-teal/40',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className={cn(
                'rounded-base border-2 border-transparent px-3 py-1.5 font-heading text-sm hover:border-border hover:bg-accent-teal',
                focusRing,
              )}
            >
              Masuk
            </Link>
            <Link to="/register" className={cn(buttonVariants({ size: 'sm' }))}>
              Daftar
              <ArrowRight />
            </Link>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Buka menu navigasi"
              className={cn(buttonVariants({ variant: 'neutral', size: 'icon' }), 'md:hidden')}
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <IslandMark className="size-7" decorative />
                  Asrama Kepri
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Navigasi seluler" className="flex flex-col gap-1 px-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-base border-2 px-3 py-2 font-heading text-sm',
                        focusRing,
                        isActive
                          ? 'border-border bg-main text-main-foreground'
                          : 'border-transparent hover:border-border hover:bg-accent-teal/40',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 p-4">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ variant: 'neutral' }))}
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants())}
                >
                  Daftar
                  <ArrowRight />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="relative overflow-hidden border-t-2 border-border bg-background text-foreground">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="pattern-grid absolute inset-0" />
          <IslandMark
            className="absolute -bottom-10 -right-6 size-40 opacity-[0.06] sm:size-56"
            decorative
          />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-2 rounded-base font-heading text-lg',
                  focusRing,
                )}
              >
                <IslandMark className="size-9" decorative />
                Asrama Kepri
              </Link>
              <p className="mt-4 max-w-xs text-sm">
                Wadah tinggal dan berorganisasi bagi mahasiswa asal Kepulauan
                Riau yang menempuh pendidikan di Yogyakarta.
              </p>
              <Link
                to="/register"
                className={cn(buttonVariants({ size: 'sm' }), 'mt-5')}
              >
                Daftar menjadi penghuni
                <ArrowRight />
              </Link>
            </div>

            <nav aria-label="Tautan footer">
              <h2 className="label">Navigasi</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {footerNav.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        'rounded-base underline-offset-4 hover:underline',
                        focusRing,
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="label">Kontak</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {kontak.map((item) => (
                  <li key={item.label} className="flex flex-col gap-0.5">
                    <span className="label text-foreground/60">
                      {item.label}
                    </span>
                    <span>{item.nilai}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t-2 border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              © {currentYear} Asrama Mahasiswa Kepulauan Riau · Yogyakarta
            </p>
            <p className="label text-foreground/70">Dikelola oleh pengurus asrama</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
