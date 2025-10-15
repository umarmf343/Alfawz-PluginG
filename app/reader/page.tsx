"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type Verse = {
  number: number
  numberInSurah: number
  text: string
  juz?: number
  hizbQuarter?: number
  page?: number
  surah?: {
    number: number
    name: string
    englishName: string
  }
}

type DailyGoalState = {
  count: number
  target: number
  remaining: number
  percentage: number
  last_reset: string
  just_completed?: boolean
  already_counted?: boolean
}

type EggChallengeState = {
  count: number
  target: number
  percentage: number
  completed?: boolean
  previous_target?: number | null
}

import CelebrationOverlay from "@/components/celebration-overlay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpenCheck, Flame, RotateCcw, Sparkles } from "lucide-react"

const API_BASE = "/wp-json/alfawzquran/v1"

function dispatchDailyProgress(payload: DailyGoalState) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent<DailyGoalState>("alfawz:daily-progress", {
      detail: payload,
    }),
  )
}

export default function ReaderPage() {
  const [verses, setVerses] = useState<Verse[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingVerses, setLoadingVerses] = useState(true)
  const [dailyState, setDailyState] = useState<DailyGoalState | null>(null)
  const [eggState, setEggState] = useState<EggChallengeState | null>(null)
  const [dailyCelebrationOpen, setDailyCelebrationOpen] = useState(false)
  const [eggCelebrationOpen, setEggCelebrationOpen] = useState(false)
  const [eggCelebrationMessage, setEggCelebrationMessage] = useState<string | null>(null)
  const [eggRecentlyCompleted, setEggRecentlyCompleted] = useState(false)

  const timezoneOffset = useMemo(() => -new Date().getTimezoneOffset(), [])

  const currentVerse = verses[currentIndex]

  const fetchDailyGoal = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/recitation-goal?timezone_offset=${timezoneOffset}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to load daily goal")
      }

      const data: DailyGoalState = await response.json()
      setDailyState(data)
      dispatchDailyProgress(data)
    } catch (error) {
      console.error(error)
    }
  }, [timezoneOffset])

  const fetchEggChallenge = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/egg-challenge`, { credentials: "include" })

      if (!response.ok) {
        throw new Error("Failed to load egg challenge")
      }

      const data: EggChallengeState = await response.json()
      setEggState(data)
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    async function loadVerses() {
      setLoadingVerses(true)
      try {
        const response = await fetch(`${API_BASE}/surahs/1/verses`)
        if (!response.ok) {
          throw new Error("Unable to load verses")
        }

        const data: Verse[] = await response.json()
        setVerses(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingVerses(false)
      }
    }

    loadVerses()
  }, [])

  useEffect(() => {
    fetchDailyGoal()
    fetchEggChallenge()
  }, [fetchDailyGoal, fetchEggChallenge])

  useEffect(() => {
    if (!eggRecentlyCompleted) {
      return
    }

    const timeout = window.setTimeout(() => setEggRecentlyCompleted(false), 2600)
    return () => window.clearTimeout(timeout)
  }, [eggRecentlyCompleted])

  const verseIdentifier = useCallback((verse: Verse) => {
    const surahNumber = verse.surah?.number ?? 1
    const localNumber = verse.numberInSurah ?? verse.number
    return `${surahNumber}:${localNumber}`
  }, [])

  const handleNextVerse = useCallback(async () => {
    if (!verses.length || !currentVerse || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE}/verse-progress`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verse_key: verseIdentifier(currentVerse),
          timezone_offset: timezoneOffset,
        }),
      })

      if (!response.ok) {
        throw new Error("Unable to update progress")
      }

      const data = (await response.json()) as { daily: DailyGoalState; egg: EggChallengeState }

      if (data.daily) {
        setDailyState(data.daily)
        dispatchDailyProgress(data.daily)
        if (data.daily.just_completed) {
          setDailyCelebrationOpen(true)
        }
      }

      if (data.egg) {
        setEggState(data.egg)
        if (data.egg.completed) {
          setEggCelebrationMessage(
            `Takbir! You’ve broken the egg through ${data.egg.previous_target ?? data.egg.target - 5} verses of recitation. The next challenge rises to ${data.egg.target} verses.`,
          )
          setEggCelebrationOpen(true)
          setEggRecentlyCompleted(true)
        }
      }

      setCurrentIndex((index) => Math.min(index + 1, Math.max(verses.length - 1, 0)))
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentVerse, isSubmitting, verseIdentifier, timezoneOffset, verses.length])

  const handlePreviousVerse = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0))
  }, [])

  const progressLabel = useMemo(() => {
    if (!dailyState) {
      return "Loading..."
    }

    return `${dailyState.count} / ${dailyState.target} Verses`
  }, [dailyState])

  const eggProgressLabel = useMemo(() => {
    if (!eggState) {
      return "Loading..."
    }

    return `${eggState.count} / ${eggState.target} Verses`
  }, [eggState])

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2a0b11] via-[#5c1520] to-[#f8f1e6] pb-28 text-[#f8f1e6]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,241,230,0.28),_transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(111,29,27,0.5),_transparent_75%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:px-12">
          <header className="space-y-4">
            <Badge className="w-fit bg-[#f8f1e6]/80 text-[#6f1d1b] shadow">Quran Reader</Badge>
            <h1 className="text-4xl font-semibold text-[#fdfaf5]">Recite with rhythm and joy</h1>
            <p className="text-lg text-[#f1dfd5]">
              Advance verse by verse, honouring the prophetic encouragement of small but steady deeds. Hit today’s 10-verse
              micro-goal and keep breaking the egg to reveal deeper knowledge.
            </p>
          </header>

          <section className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/80 text-[#fceee0] backdrop-blur">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-[#fdfaf5]">
                  <BookOpenCheck className="h-5 w-5" aria-hidden />
                  Today’s Recitation Goal
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Track each verse as you move forward. Your dashboard will refresh instantly as you progress.
                </CardDescription>
                <div className="rounded-2xl border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-4">
                  <div className="flex items-center justify-between text-sm text-[#f1dfd5]">
                    <span>{progressLabel}</span>
                    <span>{dailyState ? `${Math.min(100, Math.round(dailyState.percentage))}%` : ""}</span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#f8f1e6] transition-[width] duration-500 ease-out"
                      style={{ width: `${Math.min(100, dailyState?.percentage ?? 0)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[#f1dfd5]/80">Automatically resets at your local midnight.</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl border border-[#f8f1e6]/20 bg-gradient-to-br from-[#2d0d11]/90 via-[#401016]/70 to-[#6f1d1b]/60 px-6 pb-8 pt-28 text-center">
                  <div className="absolute left-1/2 top-6 flex w-[180px] -translate-x-1/2 flex-col items-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f1e6]/15 shadow ${
                        eggRecentlyCompleted ? "chick-pop" : "egg-animate-pulse"
                      }`}
                    >
                      <span className="text-4xl" aria-live="polite">
                        {eggRecentlyCompleted ? "🐣" : "🥚"}
                      </span>
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f1dfd5]/80">
                      Break the Egg!
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#f7d8a6] transition-[width] duration-500 ease-out"
                        style={{ width: `${Math.min(100, eggState?.percentage ?? 0)}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-[#f1dfd5]">{eggProgressLabel}</div>
                  </div>

                  <div className="space-y-6">
                    {loadingVerses ? (
                      <div className="space-y-4">
                        <Skeleton className="mx-auto h-8 w-3/4 bg-white/10" />
                        <Skeleton className="mx-auto h-8 w-2/3 bg-white/10" />
                        <Skeleton className="mx-auto h-6 w-1/2 bg-white/10" />
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-semibold leading-relaxed text-[#fdfaf5]" dir="rtl">
                          {currentVerse?.text ?? ""}
                        </p>
                        <p className="text-sm uppercase tracking-widest text-[#f1dfd5]/70">
                          {currentVerse
                            ? `Surah ${currentVerse.surah?.englishName ?? "Al-Fatihah"} · Ayah ${currentVerse.numberInSurah}`
                            : ""}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-[#f1dfd5]/60">
                          <span>Juz {currentVerse?.juz ?? "—"}</span>
                          <span>•</span>
                          <span>Page {currentVerse?.page ?? "—"}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-[#f1dfd5]/80">
                    <Flame className="h-4 w-4" aria-hidden /> Keep the rhythm — every verse strengthens your memorisation flow.
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      className="text-[#fceee0] hover:bg-[#401016]"
                      onClick={handlePreviousVerse}
                      disabled={currentIndex === 0 || isSubmitting}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Previous
                    </Button>
                    <Button
                      className="bg-[#f8f1e6] text-[#2a0b11] hover:bg-[#f1dfd5]"
                      onClick={handleNextVerse}
                      disabled={isSubmitting || loadingVerses}
                    >
                      {isSubmitting ? "Recording..." : "Next verse"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader className="space-y-4">
                <CardTitle className="flex items-center gap-2 text-[#fdfaf5]">
                  <Sparkles className="h-5 w-5" aria-hidden /> Spiritual Momentum
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Gentle reminders, duas, and encouragement appear as you stay consistent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#f1dfd5]">
                <div className="rounded-2xl border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-4">
                  <p className="text-sm font-semibold text-[#fdfaf5]">Small deeds, constant reward</p>
                  <p className="mt-1 leading-relaxed">
                    “The most beloved deeds to Allah are those that are most consistent, even if they are small.” Let today’s ten
                    verses anchor your daily relationship with the Qur’an.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-4">
                  <p className="text-sm font-semibold text-[#fdfaf5]">Celebrate your wins</p>
                  <p className="mt-1 leading-relaxed">
                    When you complete the daily target or break the egg, a celebration appears — keep reciting to stack barakah
                    filled victories.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-4">
                  <p className="text-sm font-semibold text-[#fdfaf5]">Live sync with dashboard</p>
                  <p className="mt-1 leading-relaxed">
                    Teacher dashboards refresh automatically so mentors can cheer you on without delay.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <CelebrationOverlay
        open={dailyCelebrationOpen}
        onClose={() => setDailyCelebrationOpen(false)}
        title="MashaAllah!"
        message="You’ve completed your daily recitation goal. Barakallahu Feek — may Allah increase you in knowledge."
      />
      <CelebrationOverlay
        open={eggCelebrationOpen}
        onClose={() => setEggCelebrationOpen(false)}
        title="Takbir!"
        message={eggCelebrationMessage ?? "You’ve broken the egg through steadfast recitation."}
        subtext="The challenge gently grows — keep nurturing the chick of knowledge."
      />
    </main>
  )
}
