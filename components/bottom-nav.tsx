"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Brain,
  LayoutDashboard,
  ScrollText,
  Trophy,
  UserRound,
} from "lucide-react"

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/reader",
      label: "Reader",
      icon: BookOpen,
    },
    {
      href: "/memorization",
      label: "Memorization",
      icon: Brain,
    },
    {
      href: "/qaidah",
      label: "Qa'idah",
      icon: ScrollText,
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: UserRound,
    },
  ] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 shadow-[0_-12px_40px_-18px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <div className="mx-auto max-w-5xl">
        <div className="hide-scrollbar flex items-stretch gap-2 overflow-x-auto px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 snap-x snap-mandatory">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="group relative flex min-w-[4.5rem] snap-center shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-center text-xs font-medium tracking-tight text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span
                  className={[
                    "flex h-12 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-transparent bg-transparent transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/40 text-muted-foreground group-hover:bg-muted/70",
                  ].join(" ")}
                >
                  <Icon aria-hidden className="h-5 w-5" />
                  <span className="text-[0.7rem] uppercase tracking-wide">{item.label}</span>
                </span>
                <span
                  aria-hidden
                  className={[
                    "absolute inset-x-6 -top-1 h-1 rounded-full bg-primary/80 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
