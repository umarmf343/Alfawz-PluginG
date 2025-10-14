import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Flame, Settings, Target } from "lucide-react"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2a0b11] via-[#5c1520] to-[#f8f1e6] pb-32 text-[#f8f1e6]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,241,230,0.28),_transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(111,29,27,0.5),_transparent_75%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 py-20 lg:px-12">
          <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-[#f8f1e6]/70 shadow">
                <AvatarImage src="https://api.dicebear.com/7.x/shapes/svg?seed=Amina" alt="Amina Yusuf" />
                <AvatarFallback className="bg-[#6f1d1b] text-[#fdfaf5]">AY</AvatarFallback>
              </Avatar>
              <div>
                <Badge className="mb-2 w-fit bg-[#f8f1e6]/80 text-[#6f1d1b] shadow">Guardian & Hafidh</Badge>
                <h1 className="text-4xl font-semibold text-[#fdfaf5]">Amina Yusuf</h1>
                <p className="text-[#f1dfd5]">Joined Ramadan 1444 • Instructor approval pending</p>
              </div>
            </div>
            <Button className="bg-[#f8f1e6] text-[#6f1d1b] hover:bg-[#f1dfd5]">
              <Settings className="mr-2 h-4 w-4" aria-hidden />
              Manage profile
            </Button>
          </header>

          <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Flame className="h-5 w-5" aria-hidden />
                  Active streaks
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Stay motivated with milestone reminders for personal and family goals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                  <p className="text-base font-semibold text-[#fceee0]">Memorisation streak</p>
                  <p className="text-[#f1dfd5]">46 consecutive days reciting Juz' 1-3 with teacher feedback.</p>
                </div>
                <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                  <p className="text-base font-semibold text-[#fceee0]">Family halaqah</p>
                  <p className="text-[#f1dfd5]">Weekly Saturday session with 4 attendees and shared reflection notes.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Calendar className="h-5 w-5" aria-hidden />
                  Upcoming check-ins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#f1dfd5]">
                <div>
                  <p className="font-medium text-[#fceee0]">Teacher review • 15 Sha'ban 1445</p>
                  <p>Submit recording for Surah Al-Baqarah ayah 75-82.</p>
                </div>
                <Separator className="bg-[#f8f1e6]/20" />
                <div>
                  <p className="font-medium text-[#fceee0]">Family milestone • 17 Sha'ban 1445</p>
                  <p>Share reflections for Surah Al-Kahf circle.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                <Target className="h-5 w-5" aria-hidden />
                Personal goals
              </CardTitle>
              <CardDescription className="text-[#f1dfd5]">
                Align personal growth with memorisation, recitation, and teaching aspirations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm md:grid-cols-3">
              <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                <p className="font-semibold text-[#fceee0]">Complete Surah An-Nisa</p>
                <p className="text-[#f1dfd5]">Target completion before Ramadan with bi-weekly check-ins.</p>
              </div>
              <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                <p className="font-semibold text-[#fceee0]">Lead youth halaqah</p>
                <p className="text-[#f1dfd5]">Coordinate a monthly circle for teens with interactive Qa'idah refreshers.</p>
              </div>
              <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2d0d11]/70 p-4">
                <p className="font-semibold text-[#fceee0]">Mentor new readers</p>
                <p className="text-[#f1dfd5]">Allocate two hours weekly to support Qa'idah cohorts with pronunciation tips.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
