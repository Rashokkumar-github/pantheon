import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Briefcase,
  FileText,
  ImageIcon,
  ListChecks,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Briefcase,
    title: 'Job Tracking',
    description:
      'Keep all your job applications organized in one place. Track status, deadlines, and follow-ups effortlessly.',
  },
  {
    icon: FileText,
    title: 'Cover Letter Generator',
    description:
      'Generate tailored cover letters with AI. Input the job description and get a personalized letter in seconds.',
  },
  {
    icon: ImageIcon,
    title: 'Photo Enhancement',
    description:
      'Upload your profile photo and enhance it professionally for your job applications and LinkedIn.',
  },
  {
    icon: ListChecks,
    title: 'Resume Bullets',
    description:
      'Create impactful resume bullet points tailored to specific job descriptions using AI.',
  },
]

const benefits = [
  'Save hours on every application',
  'Never miss a follow-up deadline',
  'Stand out with AI-enhanced materials',
  'Track your progress at a glance',
]

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="absolute right-0 top-1/4">
          <div className="h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Search Tools
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Land your dream job,{' '}
              <span className="gradient-text">faster</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Pantheon helps you track applications, generate personalized cover
              letters, enhance your photos, and create compelling resume bullets
              — all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">See Features</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Demo/Mockup */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Main card - Job Application Preview */}
              <Card className="overflow-hidden border-border/50 bg-card/80 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Recent Applications
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    3 active
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      company: 'Stripe',
                      role: 'Senior Frontend Engineer',
                      status: 'Interview',
                      statusColor: 'bg-green-500/10 text-green-600',
                    },
                    {
                      company: 'Vercel',
                      role: 'Product Designer',
                      status: 'Applied',
                      statusColor: 'bg-blue-500/10 text-blue-600',
                    },
                    {
                      company: 'Linear',
                      role: 'Full Stack Developer',
                      status: 'Review',
                      statusColor: 'bg-amber-500/10 text-amber-600',
                    },
                  ].map((job) => (
                    <div
                      key={job.company}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold text-muted-foreground">
                          {job.company[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {job.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.statusColor}`}
                      >
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Floating card - AI generating */}
              <Card className="absolute -bottom-6 -left-6 border-border/50 bg-card/90 p-4 shadow-lg backdrop-blur-sm sm:-left-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Cover letter ready!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tailored for Stripe
                    </p>
                  </div>
                </div>
              </Card>

              {/* Floating card - Stats */}
              <Card className="absolute -right-4 -top-4 border-border/50 bg-card/90 p-4 shadow-lg backdrop-blur-sm sm:-right-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground">
                    Applications
                    <br />
                    this week
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to land the job
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools designed to streamline your job search and help you
              stand out from the competition.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-card/50 p-6 transition-all hover:border-primary/20 hover:bg-card hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, powerful workflow
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started in minutes and transform your job search
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Add your applications',
                description:
                  'Log your job applications with company details, job descriptions, and important dates.',
              },
              {
                step: '02',
                title: 'Generate materials',
                description:
                  'Use AI to create tailored cover letters and resume bullets for each application.',
              },
              {
                step: '03',
                title: 'Track & follow up',
                description:
                  'Monitor your progress, get reminders for follow-ups, and land more interviews.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 sm:px-12 sm:py-20">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="10"
                    height="10"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to transform your job search?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of job seekers who are landing more interviews
                with Pantheon.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="gap-2 bg-white text-primary hover:bg-white/90"
                >
                  <Link href="/auth/sign-up">
                    Start Free Today
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pantheon. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

