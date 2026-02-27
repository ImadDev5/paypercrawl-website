"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Users,
  Target,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  Star,
  Building,
  Code,
  Megaphone,
  DollarSign,
  Shield,
  Briefcase,
  HomeIcon,
  Info,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { Navigation } from "@/components/ui/navigation";
import CareerApplicationForm from "@/components/career-application-form";
import { FadeIn } from "@/components/ui/fade-in";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Fallback positions if API fails
  const fallbackPositions = [
    {
      category: "Engineering",
      icon: Code,
      color: "blue",
      roles: [
        {
          title: "Senior WordPress Developer",
          type: "Full-time",
          location: "Remote",
          description:
            "Lead WordPress plugin development with deep expertise in the WordPress ecosystem.",
        },
        {
          title: "Cloudflare Workers Specialist",
          type: "Full-time",
          location: "Remote",
          description:
            "Build and optimize edge computing infrastructure using Cloudflare Workers platform.",
        },
        {
          title: "Full Stack Developer",
          type: "Full-time",
          location: "Remote",
          description:
            "Work across the stack from frontend interfaces to backend API development.",
        },
        {
          title: "DevOps Engineer",
          type: "Full-time",
          location: "Remote",
          description:
            "Manage deployment pipelines and ensure system reliability at scale.",
        },
      ],
    },
    {
      category: "Business & Sales",
      icon: DollarSign,
      color: "green",
      roles: [
        {
          title: "Business Development Manager",
          type: "Full-time",
          location: "Remote",
          description:
            "Drive partnerships with AI companies and enterprise clients.",
        },
        {
          title: "Sales Representative",
          type: "Full-time",
          location: "Remote",
          description:
            "Convert WordPress publishers to paid plans and drive revenue growth.",
        },
        {
          title: "Partnership Manager",
          type: "Full-time",
          location: "Remote",
          description:
            "Build and maintain relationships with WordPress ecosystem partners.",
        },
      ],
    },
    {
      category: "Marketing & Growth",
      icon: Megaphone,
      color: "purple",
      roles: [
        {
          title: "Content Marketing Manager",
          type: "Full-time",
          location: "Remote",
          description:
            "Create compelling content targeting WordPress users and AI companies.",
        },
        {
          title: "Growth Marketer",
          type: "Full-time",
          location: "Remote",
          description:
            "Drive user acquisition through WordPress community engagement and SEO.",
        },
        {
          title: "Community Manager",
          type: "Full-time",
          location: "Remote",
          description:
            "Build and nurture our WordPress developer and publisher community.",
        },
      ],
    },
    {
      category: "Operations",
      icon: Building,
      color: "orange",
      roles: [
        {
          title: "Product Manager",
          type: "Full-time",
          location: "Remote",
          description:
            "Shape product strategy and prioritize features based on user feedback.",
        },
        {
          title: "Customer Success Manager",
          type: "Full-time",
          location: "Remote",
          description:
            "Ensure customer satisfaction and drive platform adoption.",
        },
      ],
    },
  ];

  const [categories, setCategories] = useState<any[]>([])
  useEffect(() => {
    Promise.all([
      fetch('/api/jobs?active=true').then(r=>r.json()).catch(()=>({})),
      fetch('/api/job-categories').then(r=>r.json()).catch(()=>({}))
    ]).then(([j, c]) => {
      if (Array.isArray(j.jobs)) setJobs(j.jobs)
      if (Array.isArray(c.categories)) setCategories(c.categories)
    })
  }, [])

  const grouped = jobs.length ?
    jobs.reduce((acc: Record<string, { cat?: any, jobs: any[] }>, job) => {
      const cat = categories.find((x:any)=>x.id===job.categoryId)
      const key = cat?.name || job.category
      if (!acc[key]) acc[key] = { cat, jobs: [] }
      acc[key].jobs.push(job)
      return acc
    }, {}) : null

  // Safelist mapping for tailwind color classes
  const colorToTextClass: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    indigo: 'text-indigo-500',
    pink: 'text-pink-500',
    teal: 'text-teal-500',
    cyan: 'text-cyan-500',
    gray: 'text-gray-500',
    slate: 'text-slate-500',
    lime: 'text-lime-500',
    emerald: 'text-emerald-500',
    violet: 'text-violet-500',
  }
  const getColorClass = (c?: string) => (c && colorToTextClass[(c || '').toLowerCase()]) || 'text-primary'

  const ICONS: Record<string, any> = {
    Code,
    Megaphone,
    Building,
    DollarSign,
    Shield,
    Star,
    Briefcase,
    Users,
    Target,
    TrendingUp,
    Award,
    Globe,
    Home: HomeIcon,
    Info,
    BookOpen,
    LayoutDashboard,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="container mx-auto px-4 py-12 md:px-6">
        <FadeIn delay={0.1} direction="up">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Join Our Mission
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We're building the future of decentralized web data. Be part of the
              revolution.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-12">
          {(grouped ? Object.entries(grouped) : fallbackPositions.map((c:any) => [c.category, { jobs: c.roles }, c])).map((entry: any, index: number) => {
            const [category, data, meta] = entry
            const IconComp = grouped && data?.cat?.icon ? ICONS[data.cat.icon] : undefined
            return (
            <FadeIn key={category} delay={0.2 + index * 0.1} direction="up">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                {/* Icon from category when available; fallback to static */}
                {grouped ? (
                  IconComp ? (
                    <IconComp className={`h-8 w-8 mr-4 ${getColorClass(data.cat.color)}`} />
                  ) : null
                ) : (
                  meta?.icon ? (
                    <meta.icon className={`h-8 w-8 mr-4 ${getColorClass(meta.color)}`} />
                  ) : null
                )}
                {category}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(grouped ? data.jobs : (data.jobs as any)).map((role: any) => (
                  <Card
                    key={role.id || role.title}
                    className="bg-card text-card-foreground"
                  >
                    <CardHeader>
                      <CardTitle>{role.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{role.type}</Badge>
                        <Badge variant="outline">{role.location}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {role.description}
                      </p>
                      <Button
                        variant="link"
                        className="p-0 mt-4"
                        onClick={() => { setSelectedJob(role); setFormOpen(true); }}
                      >
                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            </FadeIn>
            )
          })}
        </div>

        <FadeIn delay={0.5} direction="up">
          <Card className="mt-20 text-center p-8 bg-card">
            <CardTitle className="text-3xl font-bold">
              Don't See Your Role?
            </CardTitle>
            <CardDescription className="mt-2 text-lg text-muted-foreground">
              We're always looking for talented people. If you're passionate about
              our mission, we'd love to hear from you.
            </CardDescription>
            <Button size="lg" className="mt-6">
              <Mail className="mr-2 h-5 w-5" /> Get in Touch
            </Button>
          </Card>
        </FadeIn>
      </main>

      <footer className="border-t border-border/40">
        <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} PayperCrawl. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </footer>
      <CareerApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        position={selectedJob?.title || 'Role'}
        jobId={selectedJob?.id}
      />
    </div>
  );
}
