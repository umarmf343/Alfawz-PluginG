import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BrainCircuit, CalendarClock, Repeat2, Sparkles } from "lucide-react"

export default function MemorizationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2a0b11] via-[#5c1520] to-[#f8f1e6] pb-32 text-[#f8f1e6]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,241,230,0.34),_transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(111,29,27,0.55),_transparent_75%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 py-20 lg:px-12">
          <header className="space-y-4">
            <Badge className="w-fit bg-[#f8f1e6]/80 text-[#6f1d1b] shadow">Memorisation Studio</Badge>
            <h1 className="text-4xl font-semibold text-[#fdfaf5]">Adaptive memorisation journeys</h1>
            <p className="text-lg text-[#f1dfd5]">
              Create repetition loops, mirror reciters, and unlock AI-assisted revisions so every hafidh stays on track.
            </p>
          </header>

          <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                <BrainCircuit className="h-5 w-5" aria-hidden />
                Progress snapshot
              </CardTitle>
              <CardDescription className="text-[#f1dfd5]">
                Visualise memorisation health across all students and highlight where attention is needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <div>
                <div className="mb-2 flex items-center justify-between text-[#fceee0]">
                  <span>Juz' currently memorised</span>
                  <span className="text-[#f8f1e6]">16 / 30</span>
                </div>
                <Progress value={54} className="h-2 bg-[#2d0d11]/70" indicatorClassName="bg-[#f8f1e6]" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-[#fceee0]">
                  <span>Average retention</span>
                  <span className="text-[#f8f1e6]">92%</span>
                </div>
                <Progress value={92} className="h-2 bg-[#2d0d11]/70" indicatorClassName="bg-[#f8f1e6]" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-[#fceee0]">
                  <span>Peer reviews completed</span>
                  <span className="text-[#f8f1e6]">48 this week</span>
                </div>
                <Progress value={72} className="h-2 bg-[#2d0d11]/70" indicatorClassName="bg-[#f8f1e6]" />
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 md:grid-cols-3">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Repeat2 className="h-5 w-5" aria-hidden />
                  Smart loops
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Generate repetition sets by ayah, surah, or juz' with audio mirroring and auto-assessed pronunciation.
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <CalendarClock className="h-5 w-5" aria-hidden />
                  Revision planner
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Personalised schedules adjust based on streaks, assessments, and guardian feedback.
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Sparkles className="h-5 w-5" aria-hidden />
                  AI coaching
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Receive tajwid suggestions, motivational prompts, and ready-to-send guardian updates.
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
