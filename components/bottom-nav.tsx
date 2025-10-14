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
    emoji: "📊",
    icon: LayoutDashboard,
  },
  {
    href: "/reader",
    label: "Reader",
    emoji: "📖",
    icon: BookOpen,
  },
  {
    href: "/memorization",
    label: "Memorization",
    emoji: "🧠",
    icon: Brain,
  },
  {
    href: "/qaidah",
    label: "Qa'idah",
    emoji: "📚",
    icon: ScrollText,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    emoji: "🏆",
    icon: Trophy,
  },
  {
    href: "/profile",
    label: "Profile",
    emoji: "👤",
    icon: UserRound,
  },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3 overflow-x-auto px-4 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} className="group outline-none">
                <span
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    "shadow-sm ring-offset-background",
                    isActive
                      ? "bg-primary text-primary-foreground shadow focus-visible:ring-2 focus-visible:ring-primary/60"
                      : "bg-muted/80 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/60",
                  ].join(" ")}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  <span className="whitespace-nowrap">
                    <span aria-hidden className="mr-1">{item.emoji}</span>
                    {item.label}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
