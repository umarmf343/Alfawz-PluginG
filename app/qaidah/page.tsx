import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Award,
  BookA,
  Globe2,
  Headphones,
  NotebookPen,
  ScrollText,
  Shapes,
  Sparkles,
  Target,
  Users,
} from "lucide-react"

export default function QaidahPage() {
  const highlightStats = [
    { label: "Young learners onboarded", value: "12k+" },
    { label: "Interactive lessons", value: "85" },
    { label: "Instructor resources", value: "40+" },
  ]

  const coreFeatures = [
    {
      title: "Structured modules",
      description:
        "Build pathways around Arabic letters, vowel markings, and word formation with auto-progress tracking.",
      icon: ScrollText,
    },
    {
      title: "Practice sheets",
      description:
        "Generate printable tracing guides and digital handwriting pads with real-time instructor comments.",
      icon: NotebookPen,
    },
    {
      title: "Multi-sensory learning",
      description:
        "Engage learners through audio articulation samples, letter puzzles, and progress celebrations.",
      icon: Shapes,
    },
  ]

  const supportPillars = [
    {
      title: "Responsive tutoring",
      description: "In-app annotation, checkpoints, and weekly feedback summaries for guardians.",
      icon: Users,
    },
    {
      title: "Audio articulation lab",
      description: "Native reciter pronunciations, slow-play controls, and mouth positioning guides.",
      icon: Headphones,
    },
    {
      title: "Global curriculum",
      description: "Mapped to popular Qa'idah texts with localization-ready terminology and fonts.",
      icon: Globe2,
    },
  ]

  const lessonStages = [
    {
      id: "stage-1",
      title: "Stage 1: Letter recognition",
      summary: "Introduce isolated letter forms with colour-coded articulation points.",
      details: "Play call-and-response audio drills featuring native reciters.",
    },
    {
      id: "stage-2",
      title: "Stage 2: Harakat mastery",
      summary: "Blend short vowels with letters and reinforce through handwriting strokes.",
      details: "Unlock formative quizzes that auto-grade and notify guardians.",
    },
    {
      id: "stage-3",
      title: "Stage 3: Word fluency",
      summary: "Practice joining letters into full words with tajwid-friendly pacing.",
      details: "Celebrate mastery with certificates and unlock the full reader module.",
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#150406] text-[#f8f1e6]">
      <div
        className="pointer-events-none absolute inset-x-0 top-[-25%] h-[480px] rounded-full bg-[radial-gradient(circle,_rgba(248,241,230,0.22)_0%,_rgba(248,241,230,0)_70%)] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-30%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(173,54,52,0.35)_0%,_rgba(173,54,52,0)_70%)] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 lg:px-12">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#511720]/90 via-[#28080c]/95 to-[#140306]/95 p-10 shadow-[0_35px_120px_-40px_rgba(0,0,0,0.6)] sm:p-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-5 max-w-2xl">
              <Badge className="w-fit bg-[#f8f1e6]/80 text-[#5b1618] shadow">Qa'idah</Badge>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-[#fff8ed] sm:text-5xl">
                  Foundational Arabic journeys for emerging readers
                </h1>
                <p className="text-lg text-[#f6e5db]/90">
                  Support beginners with interactive Qa'idah lessons, handwriting drills, pronunciation guidance, and
                  instructor collaboration tools designed for faith-centered classrooms.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-[#f1dfd5]/90">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-[#ffd6a5]" aria-hidden />
                  <span>Auto-progress analytics</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  <Target className="h-4 w-4 text-[#fcd5ce]" aria-hidden />
                  <span>Tajwid-informed drills</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  <Award className="h-4 w-4 text-[#ffe0a3]" aria-hidden />
                  <span>Gamified celebrations</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button className="bg-[#f8f1e6] text-[#4c1417] hover:bg-[#f8f1e6]/90">Launch Qa'idah module</Button>
                <Button variant="ghost" className="text-[#f8f1e6] hover:bg-white/10">
                  Preview curriculum
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-[#fceee0]/90 shadow-lg">
              <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3">
                {highlightStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-[#2a0c10]/80 px-4 py-5">
                    <p className="text-2xl font-semibold text-[#ffe6c7]">{stat.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-[#f6e5db]/80">{stat.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#f6e5db]/80">
                Built with madrasa partners to keep lessons joyful, structured, and measurable.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#fff4dd]">Core learning pathways</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {coreFeatures.map((feature) => (
                <Card
                  key={feature.title}
                  className="group border-white/10 bg-[#2b0b10]/80 text-[#fceee0] shadow-lg transition hover:-translate-y-1 hover:border-white/20 hover:bg-[#341017]/90"
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#ffd6a5]">
                      <feature.icon className="h-5 w-5" aria-hidden />
                    </div>
                    <CardTitle className="text-lg font-semibold text-[#ffe6c7]">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-[#f3d7cb]">{feature.description}</CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className="border-white/10 bg-[#2b0b10]/80 text-[#fceee0] shadow-lg">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-[#ffe6c7]">
                <BookA className="h-5 w-5" aria-hidden />
                Sample lesson outline
              </CardTitle>
              <CardDescription className="text-[#f3d7cb]">
                Preview how a Qa'idah module guides new readers from letters to confident word recitation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="text-sm">
                {lessonStages.map((stage, index) => (
                  <AccordionItem
                    key={stage.id}
                    value={stage.id}
                    className="border-b border-white/10 last:border-none"
                  >
                    <AccordionTrigger className="text-left text-[#ffe6c7]">
                      <span className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs text-[#ffe6c7]">
                          {index + 1}
                        </span>
                        {stage.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 rounded-2xl bg-[#1f070a]/80 p-4 text-[#f3d7cb]">
                      <p>{stage.summary}</p>
                      <p className="text-[#f9e8db]/80">{stage.details}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {supportPillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="border-white/10 bg-gradient-to-br from-[#351016]/90 via-[#2a0b11]/90 to-[#1b0508]/90 text-[#fceee0] shadow-lg"
            >
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[#ffd6a5]">
                  <pillar.icon className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-xl font-semibold text-[#ffe6c7]">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f3d7cb]">{pillar.description}</CardContent>
            </Card>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#3a0f14]/90 via-[#21070b]/90 to-[#120205]/95 p-10 text-center shadow-[0_25px_90px_-40px_rgba(0,0,0,0.65)] sm:p-14">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <h2 className="text-3xl font-semibold text-[#fff4dd]">Ready to elevate your Qa'idah experience?</h2>
            <p className="text-base text-[#f3d7cb]">
              Integrate classroom dashboards, learner badges, and measurable milestones across your community. Our team
              supports onboarding with curated lesson templates and training for instructors.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button className="bg-[#f8f1e6] text-[#4c1417] hover:bg-[#f8f1e6]/90">
                Book an onboarding call
              </Button>
              <Button variant="ghost" className="text-[#f8f1e6] hover:bg-white/10">
                Download overview deck
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
