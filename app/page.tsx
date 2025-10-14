"use client"

import Link from "next/link"
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Headphones,
  LayoutDashboard,
  Layers,
  Palette,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const featureHighlights = [
  {
    title: "Immersive Quran Reader",
    description:
      "Layer audio, tafsir, and translations in a single elegant view that honours the mushaf layout on every device.",
    icon: BookOpen,
  },
  {
    title: "Guided Memorisation Studio",
    description:
      "Create repetition loops, mirror reciters, and surface streak insights so every hafidh stays supported.",
    icon: Trophy,
  },
  {
    title: "Community & Guardian Portal",
    description:
      "Share live milestones, publish reminders, and spotlight top learners with beautifully themed leaderboards.",
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

const experiencePanels = [
  {
    title: "Quran Reader",
    icon: BookOpen,
    blurb:
      "Read, listen, and annotate verses with a maroon-and-milk themed interface that mirrors the printed mushaf.",
    bullets: [
      "Audio recitations with gapless looping",
      "Side-by-side translations and tafsir",
      "Bookmarks and hasanat tracking that sync to profiles",
    ],
  },
  {
    title: "Memorisation Panel",
    icon: Layers,
    blurb:
      "Design rehearsal sets, mix repetition styles, and monitor mastery with adaptive difficulty suggestions.",
    bullets: [
      "Segment verses into custom loops",
      "Teacher feedback and audio comparisons",
      "Heatmaps to highlight verses needing review",
    ],
  },
  {
    title: "Settings Studio",
    icon: Palette,
    blurb:
      "Switch reciters, translations, and notification cadences while staying fully aligned with your community brand.",
    bullets: [
      "Theme controls for maroon and milk palettes",
      "Role-based notification templates",
      "Integrations for WhatsApp, email, and SMS reminders",
    ],
  },
  {
    title: "Leaderboard",
    icon: Award,
    blurb:
      "Showcase memorisation streaks, daily reading goals, and class challenges in a celebratory experience.",
    bullets: [
      "Filter by class, age group, or programme",
      "Dynamic trophies for weekly highlights",
      "Guardian-ready share links for each milestone",
    ],
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    blurb:
      "Track attendance, reading minutes, and memorisation growth with dynamic tiles and exportable insights.",
    bullets: [
      "Real-time KPIs for every cohort",
      "Trend charts comparing weeks and months",
      "CSV exports and API hooks for custom reports",
    ],
  },
  {
    title: "Memorisation Goals",
    icon: Target,
    blurb:
      "Set personal or group targets, plan review cadences, and celebrate khatm journeys step by step.",
    bullets: [
      "Attach audio prompts to each milestone",
      "Visualise upcoming assessments",
      "Automated reminders to guardians and students",
    ],
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
    <main className="min-h-screen bg-gradient-to-b from-[#20070a] via-[#641822] to-[#f9f4ec] text-[#2f1b1a]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,244,236,0.22),_transparent_60%)]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(125,29,45,0.4),_transparent_70%)]" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-24 pt-24 lg:px-12">
          <section className="grid gap-12 lg:grid-cols-[2fr,1fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="w-fit bg-[#f8f1e6]/90 text-[#6f1d1b] shadow">WordPress Quran Companion</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#fdfaf5] sm:text-5xl lg:text-6xl">
                Centralise your community's Quran engagement with Alfawz Quran
              </h1>
              <p className="max-w-2xl text-lg text-[#f1dfd5] sm:text-xl">
                Deliver a premium reading, memorising, and coaching experience right inside WordPress. Alfawz Quran now ships with a maroon & milk aesthetic, refined layouts, and automation so your masjid or school can focus on teaching—not juggling spreadsheets.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="bg-[#f8f1e6] text-[#6f1d1b] hover:bg-[#f1dfd5]" asChild>
                  <Link href="https://alfawzquran.com" target="_blank" rel="noreferrer">
                    View full documentation
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#f8f1e6] text-[#f8f1e6] hover:bg-[#f8f1e6]/10 hover:text-[#fceee0]"
                  asChild
                >
                  <Link href="mailto:salam@alfawzquran.com">Book a guided tour</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 pt-4 text-sm text-[#f1dfd5]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#f8f1e6]" />
                  Unlimited community members
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#f8f1e6]" />
                  Secure role-based dashboards
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-[#f8f1e6]" />
                  Global recitations & translations
                </div>
              </div>
            </div>
            <Card className="border-[#f8f1e6]/30 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <LayoutDashboard className="h-5 w-5" />
                  Live engagement snapshot
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Designed dashboards show exactly how your community interacts with the Quran.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#fceee0]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2b090e]/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-[#f1dfd5]/70">Daily verses read</p>
                    <p className="mt-2 text-2xl font-semibold text-[#fdfaf5]">3,284</p>
                    <p className="text-xs text-[#f8f1e6]">+12% vs yesterday</p>
                  </div>
                  <div className="rounded-lg border border-[#f8f1e6]/30 bg-[#2b090e]/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-[#f1dfd5]/70">Memorisation streaks</p>
                    <p className="mt-2 text-2xl font-semibold text-[#fdfaf5]">87 active</p>
                    <p className="text-xs text-[#f8f1e6]">Longest streak: 46 days</p>
                  </div>
                </div>
                <Separator className="bg-[#f8f1e6]/40" />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[#f1dfd5]/70">Upcoming milestones</p>
                  <ul className="space-y-2 text-[#fdfaf5]">
                    <li className="flex items-center justify-between rounded-md bg-[#2b090e]/50 px-3 py-2">
                      <span>Hifth group review • 12 Juz complete</span>
                      <Badge className="bg-[#f8f1e6]/20 text-[#fceee0]">Saturday</Badge>
                    </li>
                    <li className="flex items-center justify-between rounded-md bg-[#2b090e]/50 px-3 py-2">
                      <span>Community khatm celebration</span>
                      <Badge className="bg-[#f8f1e6]/20 text-[#fceee0]">In 5 days</Badge>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-10">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold text-[#fdfaf5] sm:text-4xl">Everything your Quran programme needs</h2>
              <p className="mx-auto max-w-3xl text-lg text-[#f1dfd5]">
                Alfawz Quran unifies recitation, memorisation, analytics, and community engagement so you can deliver unforgettable learning experiences.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureHighlights.map(feature => (
                <Card key={feature.title} className="border-[#f8f1e6]/40 bg-[#461017]/80 text-[#fceee0] shadow-lg shadow-[#1b0406]/40">
                  <CardHeader className="space-y-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f1e6]/20 text-[#f8f1e6]">
                      <feature.icon className="h-6 w-6" />
                    </span>
                    <CardTitle className="text-xl text-[#fdfaf5]">{feature.title}</CardTitle>
                    <CardDescription className="text-[#f1dfd5]">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold text-[#fdfaf5] sm:text-4xl">Purpose-built dashboards</h2>
              <p className="mx-auto max-w-3xl text-lg text-[#f1dfd5]">
                Switch between the experiences tailored for readers, memorizers, and administrators. Each workspace keeps the right tools at hand.
              </p>
            </div>
            <Tabs defaultValue="reader" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#4d1219]/80">
                {platformTabs.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-[#f1dfd5] data-[state=active]:bg-[#f8f1e6]/20 data-[state=active]:text-[#fdfaf5]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {platformTabs.map(tab => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="rounded-b-lg border border-[#f8f1e6]/20 bg-[#3a0d14]/70 p-8 text-[#fceee0]"
                >
                  <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr] lg:items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-[#fdfaf5]">{tab.title}</h3>
                      <p className="text-[#f1dfd5]">{tab.description}</p>
                      <ul className="space-y-3 text-sm text-[#fceee0]">
                        {tab.bullets.map(bullet => (
                          <li key={bullet} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#f8f1e6]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-[#f8f1e6]/30 bg-[#2b090e]/70 p-6 text-sm text-[#fceee0] shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-[#f1dfd5]/70">Sample interface</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg border border-[#f8f1e6]/20 bg-[#401016]/70 p-4">
                          <p className="text-sm font-medium text-[#fdfaf5]">Highlighted Verse</p>
                          <p className="mt-2 text-lg leading-relaxed">"إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"</p>
                          <p className="mt-3 text-xs text-[#f1dfd5]/80">Surah Al-Isra (17:9) • Tap to play recitation</p>
                        </div>
                        <div className="rounded-lg border border-[#f8f1e6]/20 bg-[#401016]/70 p-4">
                          <p className="text-sm font-medium text-[#fdfaf5]">Action shortcuts</p>
                          <ul className="mt-2 grid gap-2 text-xs text-[#fceee0]">
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
              <Card className="border-[#f8f1e6]/30 bg-[#401016]/70 text-[#fceee0]">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#fdfaf5]">Automation that guides every believer</CardTitle>
                  <CardDescription className="text-[#f1dfd5]">
                    Alfawz Quran keeps engagement steady with intelligent reminders, personalised streaks, and celebratory broadcasts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  {automationPerks.map(perk => (
                    <div key={perk.title} className="space-y-3 rounded-lg border border-[#f8f1e6]/20 bg-[#2b090e]/60 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f1e6]/20 text-[#fdfaf5]">
                        <perk.icon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-semibold text-[#fdfaf5]">{perk.title}</p>
                      <p className="text-xs text-[#f1dfd5]">{perk.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-[#f8f1e6]/30 bg-[#401016]/70 text-[#fceee0]">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#fdfaf5]">Launch in three simple steps</CardTitle>
                  <CardDescription className="text-[#f1dfd5]">
                    Everything is packaged with guided checklists so administrators can launch without technical support.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {implementationSteps.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f8f1e6]/40 bg-[#2b090e]/60 text-lg font-semibold text-[#fdfaf5]">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-[#fdfaf5]">{step.title}</p>
                        <p className="text-sm text-[#f1dfd5]">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold text-[#fdfaf5] sm:text-4xl">Deep dive into every Alfawz workspace</h2>
              <p className="mx-auto max-w-3xl text-lg text-[#f1dfd5]">
                We restructured the experience so Quran Reader, Memorisation, Settings, Leaderboard, and Dashboard views feel consistent, fast, and on-brand.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {experiencePanels.map(panel => (
                <Card key={panel.title} className="border-[#f8f1e6]/30 bg-[#fdfaf5]/90 text-[#3c1e1d] shadow-lg">
                  <CardHeader className="space-y-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6f1d1b]/10 text-[#6f1d1b]">
                      <panel.icon className="h-6 w-6" />
                    </span>
                    <CardTitle className="text-xl text-[#2f1b1a]">{panel.title}</CardTitle>
                    <CardDescription className="text-[#5c322f]">{panel.blurb}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-[#3c1e1d]/80">
                      {panel.bullets.map(bullet => (
                        <li key={bullet} className="flex items-start gap-2">
                          <BarChart3 className="mt-0.5 h-4 w-4 text-[#6f1d1b]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold text-[#fdfaf5] sm:text-4xl">Frequently asked questions</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#f1dfd5]">
                Straightforward answers about hosting, integrations, and onboarding for your Quran initiative.
              </p>
            </div>
            <div className="grid gap-4">
              {faqs.map(faq => (
                <Card key={faq.question} className="border-[#f8f1e6]/30 bg-[#401016]/70 text-[#fceee0]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#fdfaf5]">{faq.question}</CardTitle>
                    <CardDescription className="text-[#f1dfd5]">{faq.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#f8f1e6]/40 bg-[#401016]/80 p-10 text-center shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <Badge className="bg-[#f8f1e6]/20 text-[#fceee0]">Ready to elevate your Quran programme?</Badge>
              <h2 className="text-3xl font-semibold text-[#fdfaf5] sm:text-4xl">Bring Alfawz Quran to your community today</h2>
              <p className="max-w-2xl text-lg text-[#f1dfd5]">
                Install the plugin, invite your teachers, and empower every student with a guided, data-informed Quran journey.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-[#f8f1e6] text-[#6f1d1b] hover:bg-[#f1dfd5]" asChild>
                  <Link href="https://wordpress.org/plugins" target="_blank" rel="noreferrer">
                    Download the plugin
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="text-[#fceee0] hover:bg-[#f8f1e6]/10" asChild>
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
