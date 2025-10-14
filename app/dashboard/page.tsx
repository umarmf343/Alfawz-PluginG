"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Activity,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Heart,
  LayoutDashboard,
  Moon,
  Play,
  Sparkles,
  Sun,
  Target,
} from "lucide-react"

type Suggestion = {
  context: string
  surahs: string[]
  trigger: string
  bonus: string
  key: string
  isActive: boolean
}

type Notification = {
  key: string
  message: string
  icon: ReactNode
  shouldShow: boolean
  metadata?: string
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [ramadanPreview, setRamadanPreview] = useState(false)
  const [completedSurahs, setCompletedSurahs] = useState<Record<string, boolean>>({})
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentDate(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const hours = currentDate.getHours()
  const day = currentDate.getDay()

  const isFriday = day === 5
  const isMorning = hours >= 5 && hours < 12
  const isNight = hours >= 20 || hours < 5

  const isWithinRamadan = useMemo(() => {
    // Lightweight approximation: assume Ramadan falls between March and April for the current Gregorian year.
    const month = currentDate.getMonth() // 0 indexed
    return month === 2 || month === 3
  }, [currentDate])

  const isRamadanSeason = ramadanPreview || isWithinRamadan

  const approximatePrayerWindows = useMemo(
    () => [
      { name: "Fajr", start: 5, end: 6 },
      { name: "Dhuhr", start: 12, end: 13 },
      { name: "Asr", start: 15, end: 16 },
      { name: "Maghrib", start: 18, end: 18 },
      { name: "Isha", start: 20, end: 21 },
    ],
    [],
  )

  const isAfterSalah = approximatePrayerWindows.some((window) => hours >= window.start && hours <= window.end + 1)

  const suggestions: Suggestion[] = [
    {
      context: "Friday (Jumu’ah)",
      surahs: ["Surah Al-Kahf"],
      trigger: "Every Friday (Maghrib to Maghrib)",
      bonus: "Whoever recites Surah Al-Kahf on Friday will have a light between this Friday and the next.",
      key: "surah-al-kahf",
      isActive: isFriday,
    },
    {
      context: "Before Sleep",
      surahs: ["Surah Al-Mulk", "Surah Al-Ikhlas", "Surah Al-Falaq", "Surah An-Nas"],
      trigger: "After Isha / Night Mode",
      bonus: "Tap to Play All keeps the nightly protection routine flowing without interruptions.",
      key: "night-protection",
      isActive: isNight,
    },
    {
      context: "Morning",
      surahs: ["Ayat Al-Kursi", "Last 2 verses of Surah Al-Baqarah"],
      trigger: "After Fajr",
      bonus: "Displays the Fajr dua alongside a hasanat counter to motivate consistency.",
      key: "morning-light",
      isActive: isMorning,
    },
    {
      context: "After Salah",
      surahs: ["Surah Al-Ikhlas", "Surah Al-Falaq", "Surah An-Nas"],
      trigger: "Post-prayer prompt",
      bonus: "Mark surahs as read after salah to unlock encouraging streak badges.",
      key: "post-salah",
      isActive: isAfterSalah,
    },
    {
      context: "Ramadan",
      surahs: ["Surah Al-Baqarah", "Surah Ar-Rahman", "Surah Al-Qadr"],
      trigger: "Every day in Ramadan",
      bonus: "Special lantern theme animates the UI, reminding students of the month’s mercy.",
      key: "ramadan-focus",
      isActive: isRamadanSeason,
    },
  ]

  const todaysSpecial = useMemo(() => {
    if (isFriday) {
      return {
        key: "surah-al-kahf",
        title: "Today’s Jumu’ah Focus",
        subtitle: "Friday Radiance",
        surah: "Surah Al-Kahf",
        description: "Recite Surah Al-Kahf for light between this Jumu’ah and the next.",
        icon: <Sparkles className="h-5 w-5" aria-hidden />,
      }
    }

    if (isNight) {
      return {
        key: "night-protection",
        title: "Nightly Protection",
        subtitle: "Before Sleep",
        surah: "Surah Al-Mulk + 3 Quls",
        description: "Wind down with Surah Al-Mulk and the three Quls for nightly protection.",
        icon: <Moon className="h-5 w-5" aria-hidden />,
      }
    }

    if (isMorning) {
      return {
        key: "morning-light",
        title: "Morning Light",
        subtitle: "After Fajr",
        surah: "Ayat Al-Kursi",
        description: "Start your morning with Ayat Al-Kursi to envelope the day in protection.",
        icon: <Sun className="h-5 w-5" aria-hidden />,
      }
    }

    return {
      key: "steady-progression",
      title: "Steady Progression",
      subtitle: "Stay Consistent",
      surah: "Review yesterday’s memorisation",
      description: "Keep momentum with a gentle review session before new memorisation.",
      icon: <BookOpen className="h-5 w-5" aria-hidden />,
    }
  }, [isFriday, isMorning, isNight])

  const notifications: Notification[] = [
    {
      key: "friday-reminder",
      message: "Jumu’ah Mubarak! Don’t forget to recite Surah Al-Kahf today for protection and light until next Friday.",
      icon: <Sparkles className="h-4 w-4 text-[#f7d8a6]" aria-hidden />,
      shouldShow: isFriday && !completedSurahs["Surah Al-Kahf"],
      metadata: "Friday Morning",
    },
    {
      key: "night-reminder",
      message: "Time to wind down. Tap here to recite Surah Al-Mulk and the 3 Quls for protection before sleep.",
      icon: <Moon className="h-4 w-4 text-[#d7c2ff]" aria-hidden />,
      shouldShow:
        isNight &&
        ![
          "Surah Al-Mulk",
          "Surah Al-Ikhlas",
          "Surah Al-Falaq",
          "Surah An-Nas",
        ].every((surah) => completedSurahs[surah]),
      metadata: "After Isha",
    },
    {
      key: "morning-reminder",
      message: "Start your day with light: Ayat al-Kursi and the last verses of Surah Al-Baqarah.",
      icon: <Sun className="h-4 w-4 text-[#ffe07d]" aria-hidden />,
      shouldShow:
        isMorning &&
        ![
          "Ayat Al-Kursi",
          "Last 2 verses of Surah Al-Baqarah",
        ].every((surah) => completedSurahs[surah]),
      metadata: "After Fajr",
    },
  ]

  const toggleCompletion = (surah: string) => {
    setCompletedSurahs((prev) => ({ ...prev, [surah]: !prev[surah] }))
  }

  const toggleBookmark = (surah: string) => {
    setBookmarks((prev) => ({ ...prev, [surah]: !prev[surah] }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2a0b11] via-[#5c1520] to-[#f8f1e6] pb-32 text-[#f8f1e6]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,241,230,0.32),_transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(111,29,27,0.55),_transparent_75%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 py-20 lg:px-12">
          <header className="space-y-4">
            <Badge className="w-fit bg-[#f8f1e6]/80 text-[#6f1d1b] shadow">AlFawz Quran</Badge>
            <h1 className="text-4xl font-semibold text-[#fdfaf5]">Community Dashboard</h1>
            <p className="text-lg text-[#f1dfd5]">
              Monitor how every reciter, memorizer, and guardian is progressing at a glance. The dashboard synthesises live
              metrics, schedules, and priority actions into one calm control centre.
            </p>
          </header>
          <section className="grid gap-6 md:grid-cols-2">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <LayoutDashboard className="h-5 w-5" aria-hidden />
                  Activity Overview
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Live summaries of verses read, memorisation streaks, and reminders that need approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#fceee0]">
                    <Activity className="h-4 w-4" aria-hidden /> Daily recitations
                  </span>
                  <span className="text-[#f8f1e6]">3,284 verses</span>
                </div>
                <Separator className="bg-[#f8f1e6]/20" />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#fceee0]">
                    <CalendarCheck className="h-4 w-4" aria-hidden /> Pending check-ins
                  </span>
                  <span className="text-[#f8f1e6]">12 awaiting review</span>
                </div>
                <Separator className="bg-[#f8f1e6]/20" />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#fceee0]">
                    <Target className="h-4 w-4" aria-hidden /> Weekly milestone
                  </span>
                  <span className="text-[#f8f1e6]">82% achieved</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#fceee0]">Focus for today</CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Suggested coaching moves automatically surface for admins, teachers, and guardians.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                  <p className="font-medium text-[#fdfaf5]">Review Surah Al-Baqarah Group</p>
                  <p className="mt-1 text-[#f1dfd5]">Five learners submitted audio check-ins overnight.</p>
                </div>
                <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                  <p className="font-medium text-[#fdfaf5]">Send encouragement</p>
                  <p className="mt-1 text-[#f1dfd5]">Amina just hit a 30 day memorisation streak—celebrate it with the community.</p>
                </div>
                <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                  <p className="font-medium text-[#fdfaf5]">Upcoming halaqah</p>
                  <p className="mt-1 text-[#f1dfd5]">Tomorrow at 6pm—confirm attendance and prep the reader playlist.</p>
                </div>
              </CardContent>
            </Card>
          </section>
          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/80 text-[#fceee0] backdrop-blur">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[#fdfaf5]">
                    <Sparkles className="h-5 w-5" aria-hidden /> Smart Daily Surah Recommendations
                  </CardTitle>
                  <CardDescription className="text-[#f1dfd5]">
                    Timely prompts adapt to Islamic days, prayer rhythms, and Ramadan ambience so students stay anchored.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#f8f1e6]/20 bg-[#2d0d11]/70 px-4 py-2 text-sm text-[#f1dfd5]">
                  <span>Preview Ramadan theme</span>
                  <Switch
                    checked={ramadanPreview}
                    onCheckedChange={setRamadanPreview}
                    aria-label="Toggle Ramadan theme preview"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.key}
                      className={`rounded-xl border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-5 transition-all ${
                        suggestion.isActive ? "shadow-[0_0_25px_rgba(248,241,230,0.12)]" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm uppercase tracking-wide text-[#f1dfd5]/80">{suggestion.context}</p>
                          <p className="text-lg font-semibold text-[#fdfaf5]">
                            {suggestion.surahs.join(", ")}
                          </p>
                          <p className="text-sm text-[#f1dfd5]">{suggestion.trigger}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          {suggestion.isActive ? (
                            <Badge className="bg-[#f8f1e6] text-[#2a0b11]">Active now</Badge>
                          ) : (
                            <Badge className="bg-transparent text-[#f1dfd5] ring-1 ring-inset ring-[#f8f1e6]/20">
                              Upcoming
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#fceee0] hover:bg-[#401016]"
                            onClick={() =>
                              suggestion.surahs.forEach((surah) => {
                                toggleCompletion(surah)
                              })
                            }
                          >
                            <CheckCircle className="h-4 w-4" aria-hidden /> Mark routine complete
                          </Button>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-[#f1dfd5]">{suggestion.bonus}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#f1dfd5]/80">
                  Smart scheduling respects existing completions. Once a surah set is marked complete, reminders quietly pause
                  for the day.
                </p>
              </CardContent>
            </Card>
            <Card
              className={`border-[#f8f1e6]/40 text-[#fceee0] backdrop-blur ${
                todaysSpecial.key === "surah-al-kahf"
                  ? "bg-gradient-to-br from-[#3d0b12]/90 via-[#401016]/80 to-[#a23c36]/70"
                  : todaysSpecial.key === "night-protection"
                    ? "bg-gradient-to-br from-[#1d0a19]/90 via-[#2d0d11]/80 to-[#401016]/70"
                    : todaysSpecial.key === "morning-light"
                      ? "bg-gradient-to-br from-[#4d1a12]/90 via-[#401016]/80 to-[#f8f1e6]/20"
                      : "bg-[#401016]/80"
              } ${isRamadanSeason ? "ring-2 ring-[#f7d8a6]/60" : ""}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fdfaf5]">
                  {todaysSpecial.icon}
                  Today’s Special Surah
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  {todaysSpecial.subtitle} · {currentDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-2xl font-semibold text-[#fdfaf5]">{todaysSpecial.surah}</p>
                  <p className="text-sm leading-relaxed text-[#f1dfd5]">{todaysSpecial.description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    className="bg-[#f8f1e6] text-[#2a0b11] hover:bg-[#f1dfd5]"
                    onClick={() => console.info(`Play audio for ${todaysSpecial.surah}`)}
                  >
                    <Play className="h-4 w-4" aria-hidden /> Play audio
                  </Button>
                  <Button
                    variant={completedSurahs[todaysSpecial.surah] ? "secondary" : "ghost"}
                    className={
                      completedSurahs[todaysSpecial.surah]
                        ? "bg-[#f1dfd5] text-[#2a0b11] hover:bg-[#f8f1e6]"
                        : "text-[#fceee0] hover:bg-[#401016]"
                    }
                    onClick={() => toggleCompletion(todaysSpecial.surah)}
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden />
                    {completedSurahs[todaysSpecial.surah] ? "Marked as read" : "Mark as read"}
                  </Button>
                  <Button
                    variant={bookmarks[todaysSpecial.surah] ? "secondary" : "ghost"}
                    className={
                      bookmarks[todaysSpecial.surah]
                        ? "bg-[#f1dfd5] text-[#2a0b11] hover:bg-[#f8f1e6]"
                        : "text-[#fceee0] hover:bg-[#401016]"
                    }
                    onClick={() => toggleBookmark(todaysSpecial.surah)}
                  >
                    <Heart className="h-4 w-4" aria-hidden />
                    {bookmarks[todaysSpecial.surah] ? "Added to habit" : "Bookmark / Add to habit"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-[#fceee0] hover:bg-[#401016]"
                    onClick={() => console.info(`Open tafsir for ${todaysSpecial.surah}`)}
                  >
                    <BookOpen className="h-4 w-4" aria-hidden /> View tafsir & hadith
                  </Button>
                </div>
                {isRamadanSeason && (
                  <div className="rounded-lg border border-[#f7d8a6]/40 bg-[#2d0d11]/60 p-4 text-sm text-[#f7d8a6]">
                    <p className="font-medium">Ramadan ambience active</p>
                    <p className="mt-1 text-[#fbeacc]">
                      Lantern glow, dua overlays, and sadaqah reminders are highlighted for students throughout the month.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fdfaf5]">
                  <Bell className="h-5 w-5" aria-hidden /> Gentle Islamic Notifications
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Context-aware nudges appear only when the routine still needs attention, ensuring reminders stay meaningful.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.filter((notification) => notification.shouldShow).length > 0 ? (
                  notifications
                    .filter((notification) => notification.shouldShow)
                    .map((notification) => (
                      <div
                        key={notification.key}
                        className="flex items-start gap-4 rounded-xl border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-4"
                      >
                        <div className="mt-1 rounded-full bg-[#401016] p-2">{notification.icon}</div>
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-[#f1dfd5]/60">{notification.metadata}</p>
                          <p className="text-sm text-[#fceee0]">{notification.message}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[#f8f1e6]/20 bg-[#2d0d11]/60 p-6 text-sm text-[#f1dfd5]">
                    All caught up! The system holds notifications once a routine is marked complete for the day.
                  </div>
                )}
                <p className="text-xs text-[#f1dfd5]/70">
                  Notifications respect completion status. Once students fulfil the recommendation, prompts quietly stand
                  down until the next cycle.
                </p>
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fdfaf5]">
                  <Target className="h-5 w-5" aria-hidden /> Routine Tracker Snapshot
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Visualise which surah sets have been completed today and where gentle prompts will focus next.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {suggestions.map((suggestion) => {
                  const completedCount = suggestion.surahs.filter((surah) => completedSurahs[surah]).length
                  const total = suggestion.surahs.length

                  return (
                    <div
                      key={`${suggestion.key}-tracker`}
                      className="rounded-lg border border-[#f8f1e6]/20 bg-[#2d0d11]/60 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-[#fdfaf5]">{suggestion.context}</p>
                        <span className="text-xs text-[#f1dfd5]">
                          {completedCount}/{total} {total > 1 ? "surahs" : "surah"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {suggestion.surahs.map((surah) => (
                          <button
                            key={surah}
                            onClick={() => toggleCompletion(surah)}
                            className={`rounded-full border px-3 py-1 transition ${
                              completedSurahs[surah]
                                ? "border-[#f7d8a6]/50 bg-[#f7d8a6]/20 text-[#f7d8a6]"
                                : "border-[#f8f1e6]/20 text-[#f1dfd5] hover:border-[#f8f1e6]/40"
                            }`}
                          >
                            {surah}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
