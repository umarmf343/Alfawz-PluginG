import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Activity, CalendarCheck, LayoutDashboard, Target } from "lucide-react"

export default function DashboardPage() {
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
        </div>
      </div>
    </main>
  )
}
