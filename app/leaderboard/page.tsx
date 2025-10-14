import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Crown, Medal, Trophy } from "lucide-react"

const leaderboardData = [
  { position: 1, name: "Amina Yusuf", streak: "46 days", verses: "1,280" },
  { position: 2, name: "Bilal Khan", streak: "39 days", verses: "1,115" },
  { position: 3, name: "Maryam Ali", streak: "35 days", verses: "1,032" },
  { position: 4, name: "Hassan Idris", streak: "31 days", verses: "968" },
  { position: 5, name: "Layla Rahman", streak: "28 days", verses: "910" },
]

export default function LeaderboardPage() {
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
          <header className="space-y-4">
            <Badge className="w-fit bg-[#f8f1e6]/80 text-[#6f1d1b] shadow">Leaderboard</Badge>
            <h1 className="text-4xl font-semibold text-[#fdfaf5]">Celebrate every milestone</h1>
            <p className="text-lg text-[#f1dfd5]">
              Showcase top readers, memorisers, and guardians with automatically refreshed rankings and awards.
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Trophy className="h-5 w-5" aria-hidden />
                  Weekly leaderboard
                </CardTitle>
                <CardDescription className="text-[#f1dfd5]">
                  Rankings update with recitation minutes, memorisation check-ins, and community participation.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden rounded-lg border border-[#f8f1e6]/20">
                <Table>
                  <TableHeader className="bg-[#2d0d11]/70 text-[#fceee0]">
                    <TableRow className="border-b border-[#f8f1e6]/20">
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Streak</TableHead>
                      <TableHead className="text-right">Verses read</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-[#401016]/70 text-[#f1dfd5]">
                    {leaderboardData.map((row) => (
                      <TableRow key={row.position} className="border-b border-[#f8f1e6]/10">
                        <TableCell className="font-semibold text-[#fceee0]">#{row.position}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.streak}</TableCell>
                        <TableCell className="text-right">{row.verses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Crown className="h-5 w-5" aria-hidden />
                  Spotlight rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#f1dfd5]">
                <div className="rounded-lg border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-[#fceee0]">
                    <Medal className="h-4 w-4" aria-hidden /> Memorisation streak
                  </h2>
                  <p className="mt-1">
                    Awarded to learners who maintain a 30-day streak with precise tajwid feedback from their mentors.
                  </p>
                </div>
                <div className="rounded-lg border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-[#fceee0]">
                    <Trophy className="h-4 w-4" aria-hidden /> Community champion
                  </h2>
                  <p className="mt-1">
                    Celebrates readers who host halaqah circles, submit reflections, and encourage peers every week.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
