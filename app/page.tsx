"use client"

import Link from "next/link"
import { BookOpen, CheckCircle2, Clock, Headphones, LayoutDashboard, Settings, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const featureHighlights = [
  {
    title: "Immersive Quran Reader",
    description:
      "Stream recitations, read translations, and track your progress verse by verse with bookmarking and hasanat counters.",
    icon: BookOpen,
  },
  {
    title: "Smart Memorization Coach",
    description:
      "Adaptive practice sessions, revision heatmaps, and streak reminders keep every memorizer on track without overwhelm.",
    icon: Trophy,
  },
  {
    title: "Community & Leaderboards",
    description:
      "Celebrate milestones together with masjid-wide leaderboards, session logging, and upcoming event reminders.",
    icon: Users,
  },
]

const automationPerks = [
  {
    title: "Automated Hasanat Tracking",
    description: "Calculate letters read across every device and surface the rewards in real time for your community.",
    icon: Sparkles,
  },
  {
    title: "Daily Surah Scheduling",
    description: "Serve curated surahs for every day of the week and send friendly nudges when someone falls behind.",
    icon: Clock,
  },
  {
    title: "Granular Access Controls",
    description: "Assign teachers, students, and guardians the exact dashboard tools they need—nothing more, nothing less.",
    icon: ShieldCheck,
  },
  {
    title: "Seamless WordPress Integration",
    description: "Drop the plugin into any site, sync user roles instantly, and start measuring engagement without custom code.",
    icon: Settings,
  },
]

const platformTabs = [
  {
    value: "reader",
    label: "Reader",
    title: "Beautiful, distraction-free recitation",
    description:
      "Choose from global reciters, toggle translations, and enjoy an elegant reading experience optimised for large and small screens alike.",
    bullets: [
      "Instant Arabic & English rendering with audio playback",
      "Smart bookmarks and resume where you left off",
      "Session analytics that feed straight into your community leaderboard",
    ],
  },
  {
    value: "memorizer",
    label: "Memorizer",
    title: "Adaptive revision schedule",
    description:
      "Boost retention with AI assisted repetition sets, listening drills, and visual revision heatmaps for each student.",
    bullets: [
      "Dynamic difficulty based on previous attempts",
      "Audio comparison tools to perfect pronunciation",
      "Exportable reports for teachers and guardians",
    ],
  },
  {
    value: "admin",
    label: "Admin",
    title: "Bird's-eye view for every organiser",
    description:
      "See community-wide progress, approve submissions, and configure gamified incentives without leaving your dashboard.",
    bullets: [
      "Role-aware navigation that mirrors WordPress permissions",
      "Configurable hasanat multipliers and milestone rewards",
      "Automation toggles to schedule reminders and newsletters",
    ],
  },
]

const implementationSteps = [
  {
    title: "Install & Connect",
    description: "Upload the plugin, activate it, and link your WordPress users in minutes with the guided onboarding wizard.",
  },
  {
    title: "Brand & Configure",
    description: "Customise colours, upload your community banner, and fine-tune hasanat, reminders, and leaderboards.",
  },
  {
    title: "Launch to Your Community",
    description: "Invite teachers and students, publish the daily surah widget, and let the engagement roll in.",
  },
]

const faqs = [
  {
    question: "Does Alfawz Quran work with my existing WordPress members?",
    answer:
      "Yes. The plugin respects existing user roles and adds Quran-specific dashboards for administrators, teachers, students, and guardians without breaking current permissions.",
  },
  {
    question: "Is an internet connection required for recitations?",
    answer:
      "Recitations stream from the AlQuran Cloud service so an internet connection is required for audio playback. Reading and memorisation tools remain available offline once the page loads.",
  },
  {
    question: "Can I track memorisation progress per student?",
    answer:
      "Absolutely. Alfawz Quran stores memorisation attempts, assigns streak points, and surfaces detailed analytics per learner so coaches can intervene at the right time.",
  },
]

export default function SyntheticV0PageForDeployment() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%)]" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-20 pt-24 lg:px-12">
          <section className="grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="w-fit bg-cyan-500/20 text-cyan-200">WordPress Quran Companion</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Centralise your community's Quran engagement with Alfawz Quran
              </h1>
              <p className="max-w-2xl text-lg text-slate-200 sm:text-xl">
                Deliver a premium reading, memorising, and coaching experience right inside WordPress. Alfawz Quran blends elegant design with automation so your masjid or school can focus on teaching—not juggling spreadsheets.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="https://alfawzquran.com" target="_blank" rel="noreferrer">
                    View full documentation
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-200 hover:bg-cyan-500/10" asChild>
                  <Link href="mailto:salam@alfawzquran.com">Book a guided tour</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Unlimited community members
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  Secure role-based dashboards
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-cyan-400" />
                  Global recitations & translations
                </div>
              </div>
            </div>
            <Card className="border-cyan-500/40 bg-slate-900/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-100">
                  <LayoutDashboard className="h-5 w-5" />
                  Live engagement snapshot
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Designed dashboards show exactly how your community interacts with the Quran.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-cyan-500/30 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Daily verses read</p>
                    <p className="mt-2 text-2xl font-semibold text-white">3,284</p>
                    <p className="text-xs text-emerald-300">+12% vs yesterday</p>
                  </div>
                  <div className="rounded-lg border border-cyan-500/30 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Memorisation streaks</p>
                    <p className="mt-2 text-2xl font-semibold text-white">87 active</p>
                    <p className="text-xs text-emerald-300">Longest streak: 46 days</p>
                  </div>
                </div>
                <Separator className="bg-cyan-500/40" />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Upcoming milestones</p>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between rounded-md bg-slate-950/50 px-3 py-2">
                      <span>Hifth group review • 12 Juz complete</span>
                      <Badge className="bg-emerald-500/20 text-emerald-200">Saturday</Badge>
                    </li>
                    <li className="flex items-center justify-between rounded-md bg-slate-950/50 px-3 py-2">
                      <span>Community khatm celebration</span>
                      <Badge className="bg-cyan-500/20 text-cyan-100">In 5 days</Badge>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-10">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Everything your Quran programme needs</h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-200">
                Alfawz Quran unifies recitation, memorisation, analytics, and community engagement so you can deliver unforgettable learning experiences.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureHighlights.map(feature => (
                <Card key={feature.title} className="border-slate-800/80 bg-slate-900/70">
                  <CardHeader className="space-y-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
                      <feature.icon className="h-6 w-6" />
                    </span>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-300">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Purpose-built dashboards</h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-200">
                Switch between the experiences tailored for readers, memorizers, and administrators. Each workspace keeps the right tools at hand.
              </p>
            </div>
            <Tabs defaultValue="reader" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-900/80">
                {platformTabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {platformTabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="rounded-b-lg border border-slate-800/80 bg-slate-900/60 p-8">
                  <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr] lg:items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-white">{tab.title}</h3>
                      <p className="text-slate-200">{tab.description}</p>
                      <ul className="space-y-3 text-sm text-slate-300">
                        {tab.bullets.map(bullet => (
                          <li key={bullet} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-400" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-6 text-sm text-slate-200 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Sample interface</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-900/80 p-4">
                          <p className="text-sm font-medium text-white">Highlighted Verse</p>
                          <p className="mt-2 text-lg leading-relaxed">"إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"</p>
                          <p className="mt-3 text-xs text-slate-400">Surah Al-Isra (17:9) • Tap to play recitation</p>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-900/80 p-4">
                          <p className="text-sm font-medium text-white">Action shortcuts</p>
                          <ul className="mt-2 grid gap-2 text-xs text-slate-300">
                            <li>• Resume memorisation plan</li>
                            <li>• View teacher feedback</li>
                            <li>• Share progress with guardians</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          <section className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-800/80 bg-slate-900/70">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Automation that guides every believer</CardTitle>
                  <CardDescription className="text-slate-300">
                    Alfawz Quran keeps engagement steady with intelligent reminders, personalised streaks, and celebratory broadcasts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  {automationPerks.map(perk => (
                    <div key={perk.title} className="space-y-3 rounded-lg border border-cyan-500/20 bg-slate-950/60 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
                        <perk.icon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-semibold text-white">{perk.title}</p>
                      <p className="text-xs text-slate-300">{perk.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-slate-800/80 bg-slate-900/70">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Launch in three simple steps</CardTitle>
                  <CardDescription className="text-slate-300">
                    Everything is packaged with guided checklists so administrators can launch without technical support.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {implementationSteps.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/40 bg-slate-950/60 text-lg font-semibold text-cyan-200">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-white">{step.title}</p>
                        <p className="text-sm text-slate-300">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-200">
                Straightforward answers about hosting, integrations, and onboarding for your Quran initiative.
              </p>
            </div>
            <div className="grid gap-4">
              {faqs.map(faq => (
                <Card key={faq.question} className="border-slate-800/80 bg-slate-900/70">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{faq.question}</CardTitle>
                    <CardDescription className="text-slate-300">{faq.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-10 text-center shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <Badge className="bg-cyan-500/20 text-cyan-100">Ready to elevate your Quran programme?</Badge>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Bring Alfawz Quran to your community today</h2>
              <p className="max-w-2xl text-lg text-slate-200">
                Install the plugin, invite your teachers, and empower every student with a guided, data-informed Quran journey.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" asChild>
                  <Link href="https://wordpress.org/plugins" target="_blank" rel="noreferrer">
                    Download the plugin
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="text-cyan-200 hover:bg-cyan-500/10" asChild>
                  <Link href="mailto:support@alfawzquran.com">Talk to an onboarding specialist</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
