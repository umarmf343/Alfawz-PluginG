import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, BookmarkCheck, Headphones, Languages } from "lucide-react"

export default function ReaderPage() {
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
            <Badge className="w-fit bg-[#f8f1e6]/80 text-[#6f1d1b] shadow">Quran Reader</Badge>
            <h1 className="text-4xl font-semibold text-[#fdfaf5]">Immersive recitation experience</h1>
            <p className="text-lg text-[#f1dfd5]">
              Layer audio, translations, tafsir, and bookmarks in one elegant interface crafted for long-form reading.
            </p>
          </header>

          <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                <BookOpen className="h-5 w-5" aria-hidden />
                Reading modes
              </CardTitle>
              <CardDescription className="text-[#f1dfd5]">
                Switch effortlessly between the modes your learners rely on most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mushaf" className="space-y-4">
                <TabsList className="bg-[#2d0d11]/70">
                  <TabsTrigger value="mushaf" className="data-[state=active]:bg-[#6f1d1b] data-[state=active]:text-[#fdfaf5]">
                    Mushaf view
                  </TabsTrigger>
                  <TabsTrigger value="translation" className="data-[state=active]:bg-[#6f1d1b] data-[state=active]:text-[#fdfaf5]">
                    Translation first
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="data-[state=active]:bg-[#6f1d1b] data-[state=active]:text-[#fdfaf5]">
                    Audio follow-along
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mushaf" className="space-y-3 rounded-lg border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-5 text-sm">
                  <p className="text-[#fceee0]">
                    Enjoy a responsive mushaf layout with crisp Arabic typography and auto-scroll that respects ayah groupings.
                  </p>
                  <p className="text-[#f1dfd5]">
                    Highlight tajwid rules, open tafsir side panels, and jump to surah indices without leaving the page.
                  </p>
                </TabsContent>
                <TabsContent value="translation" className="space-y-3 rounded-lg border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-5 text-sm">
                  <p className="text-[#fceee0]">
                    Toggle bilingual or trilingual translations and pin your preferred scholars for quick reference.
                  </p>
                  <p className="text-[#f1dfd5]">
                    Align the reader for classroom projection or mobile single-column flow.
                  </p>
                </TabsContent>
                <TabsContent value="audio" className="space-y-3 rounded-lg border border-[#f8f1e6]/20 bg-[#2d0d11]/70 p-5 text-sm">
                  <p className="text-[#fceee0]">
                    Follow along with curated playlists, adjust playback speed, and repeat ayah segments for mastery.
                  </p>
                  <p className="text-[#f1dfd5]">
                    Learners can mirror the reciter, compare recordings, and bookmark tricky passages.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <section className="grid gap-6 md:grid-cols-3">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Headphones className="h-5 w-5" aria-hidden />
                  Recitation library
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Choose from a global roster of qurrā’ with curated playlists for every juz’ and memorisation pathway.
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <BookmarkCheck className="h-5 w-5" aria-hidden />
                  Smart bookmarks
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Resume sessions instantly with synced bookmarks, streak reminders, and live tafsir highlights.
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Languages className="h-5 w-5" aria-hidden />
                  Translation layers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Present multiple translations side by side or inline, including teacher annotations and classroom notes.
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
