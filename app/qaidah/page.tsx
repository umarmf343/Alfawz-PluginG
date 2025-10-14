import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookA, NotebookPen, ScrollText, Shapes } from "lucide-react"

export default function QaidahPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2a0b11] via-[#5c1520] to-[#f8f1e6] pb-32 text-[#f8f1e6]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,241,230,0.3),_transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(111,29,27,0.55),_transparent_75%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 py-20 lg:px-12">
          <header className="space-y-4">
            <Badge className="w-fit bg-[#f8f1e6]/80 text-[#6f1d1b] shadow">Qa'idah</Badge>
            <h1 className="text-4xl font-semibold text-[#fdfaf5]">Foundational Arabic journeys</h1>
            <p className="text-lg text-[#f1dfd5]">
              Support beginners with interactive Qa'idah lessons, handwriting drills, and pronunciation guidance.
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <ScrollText className="h-5 w-5" aria-hidden />
                  Structured modules
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Build pathways around Arabic letters, vowel markings, and word formation with auto-progress tracking.
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <NotebookPen className="h-5 w-5" aria-hidden />
                  Practice sheets
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Generate printable tracing guides and digital handwriting pads with real-time instructor comments.
              </CardContent>
            </Card>
            <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                  <Shapes className="h-5 w-5" aria-hidden />
                  Multi-sensory learning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#f1dfd5]">
                Engage learners through audio articulation samples, letter puzzles, and progress celebrations.
              </CardContent>
            </Card>
          </section>

          <Card className="border-[#f8f1e6]/40 bg-[#401016]/70 text-[#fceee0] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#fceee0]">
                <BookA className="h-5 w-5" aria-hidden />
                Sample lesson outline
              </CardTitle>
              <CardDescription className="text-[#f1dfd5]">
                Preview how a Qa'idah module guides new readers from letters to confident word recitation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="text-sm">
                <AccordionItem value="stage-1" className="border-b border-[#f8f1e6]/20">
                  <AccordionTrigger className="text-[#fceee0]">Stage 1: Letter recognition</AccordionTrigger>
                  <AccordionContent className="space-y-2 bg-[#2d0d11]/70 p-4 text-[#f1dfd5]">
                    <p>Introduce isolated letter forms with colour-coded articulation points.</p>
                    <p>Play call-and-response audio drills featuring native reciters.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="stage-2" className="border-b border-[#f8f1e6]/20">
                  <AccordionTrigger className="text-[#fceee0]">Stage 2: Harakat mastery</AccordionTrigger>
                  <AccordionContent className="space-y-2 bg-[#2d0d11]/70 p-4 text-[#f1dfd5]">
                    <p>Blend short vowels with letters and reinforce through handwriting strokes.</p>
                    <p>Unlock formative quizzes that auto-grade and notify guardians.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="stage-3">
                  <AccordionTrigger className="text-[#fceee0]">Stage 3: Word fluency</AccordionTrigger>
                  <AccordionContent className="space-y-2 bg-[#2d0d11]/70 p-4 text-[#f1dfd5]">
                    <p>Practice joining letters into full words with tajwid-friendly pacing.</p>
                    <p>Celebrate mastery with certificates and unlock the full reader module.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
