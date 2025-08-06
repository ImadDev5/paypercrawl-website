"use client";

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
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function CareersPage() {
  const positions = [
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <TrendingUp className="h-6 w-6" />
            <span className="font-bold">PayperCrawl</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/features"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <Link href="/careers" className="text-foreground">
              Careers
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ModeToggle />
            <Button asChild>
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            Join Our Mission
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We're building the future of decentralized web data. Be part of the
            revolution.
          </p>
        </div>

        <div className="grid gap-12">
          {positions.map((positionCategory) => (
            <div key={positionCategory.category}>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <positionCategory.icon
                  className={`h-8 w-8 mr-4 text-${positionCategory.color}-500`}
                />
                {positionCategory.category}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {positionCategory.roles.map((role) => (
                  <Card
                    key={role.title}
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
                      <Button variant="link" className="p-0 mt-4">
                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

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
    </div>
  );
}
