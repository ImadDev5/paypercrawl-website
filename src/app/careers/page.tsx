'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Users, Target, TrendingUp, Award, Globe, ArrowRight, Star, Building, Code, Megaphone, DollarSign, Shield } from "lucide-react"
import Link from "next/link"

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
          description: "Lead WordPress plugin development with deep expertise in the WordPress ecosystem."
        },
        {
          title: "Cloudflare Workers Specialist",
          type: "Full-time", 
          location: "Remote",
          description: "Build and optimize edge computing infrastructure using Cloudflare Workers platform."
        },
        {
          title: "Full Stack Developer",
          type: "Full-time",
          location: "Remote", 
          description: "Work across the stack from frontend interfaces to backend API development."
        },
        {
          title: "DevOps Engineer",
          type: "Full-time",
          location: "Remote",
          description: "Manage deployment pipelines and ensure system reliability at scale."
        }
      ]
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
          description: "Drive partnerships with AI companies and enterprise clients."
        },
        {
          title: "Sales Representative",
          type: "Full-time",
          location: "Remote",
          description: "Convert WordPress publishers to paid plans and drive revenue growth."
        },
        {
          title: "Partnership Manager",
          type: "Full-time",
          location: "Remote",
          description: "Build and maintain relationships with WordPress ecosystem partners."
        }
      ]
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
          description: "Create compelling content targeting WordPress users and AI companies."
        },
        {
          title: "Growth Marketer",
          type: "Full-time",
          location: "Remote",
          description: "Drive user acquisition through WordPress community engagement and SEO."
        },
        {
          title: "Community Manager",
          type: "Full-time", 
          location: "Remote",
          description: "Build and nurture our WordPress developer and publisher community."
        }
      ]
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
          description: "Shape product strategy and prioritize features based on user feedback."
        },
        {
          title: "Customer Success Manager",
          type: "Full-time",
          location: "Remote",
          description: "Ensure customer satisfaction and drive platform adoption."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">PayPerCrawl</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">Home</Link>
              <Link href="/features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/blog" className="text-slate-600 hover:text-slate-900 transition-colors">Blog</Link>
              <Link href="/careers" className="text-blue-600 font-medium">Careers</Link>
              <Link href="/waitlist"><Button className="bg-purple-600 hover:bg-purple-700">Join Beta</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                JOIN OUR TEAM
              </span>
              We're Hiring Multiple Positions
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Build the Future of
              <span className="text-blue-200"> Content Monetization</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our team of experts and professionals building the essential marketplace connecting 
              content creators with the AI industry. We're looking for passionate individuals who want 
              to shape the future of the content economy.
            </p>
            <div className="flex items-center justify-center gap-8 text-blue-200">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Remote-First Culture</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>Competitive Compensation</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Equity Opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Join PayPerCrawl?
            </h2>
            <p className="text-xl text-slate-600">
              Be part of a mission-driven team building the future of content monetization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <CardTitle className="text-xl">First-Mover Advantage</CardTitle>
                <CardDescription>
                  Pioneer in AI bot monetization with massive market opportunity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 text-center">
                  Work on cutting-edge technology that's defining the future of content licensing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <Globe className="h-12 w-12 text-green-600 mb-4 mx-auto" />
                <CardTitle className="text-xl">Global Impact</CardTitle>
                <CardDescription>
                  Affect millions of WordPress sites worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 text-center">
                  Your work will directly impact content creators across the globe.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-purple-600 mb-4 mx-auto" />
                <CardTitle className="text-xl">Expert Team</CardTitle>
                <CardDescription>
                  Work with industry-leading professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 text-center">
                  Collaborate with a team of experts and professionals at the top of their fields.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 text-orange-600 mb-4 mx-auto" />
                <CardTitle className="text-xl">Growth Opportunities</CardTitle>
                <CardDescription>
                  Rapid career advancement in a scaling startup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 text-center">
                  Grow your career as we scale, with opportunities for leadership and innovation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-slate-600">
              We're looking for talented individuals across multiple functions
            </p>
          </div>

          <div className="space-y-12">
            {positions.map((category, index) => (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-8">
                  <category.icon className={`h-8 w-8 ${category.color === 'blue' ? 'text-blue-600' : category.color === 'green' ? 'text-green-600' : category.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`} />
                  <h3 className="text-2xl font-bold text-slate-900">{category.category}</h3>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.roles.map((role, roleIndex) => (
                    <Card key={roleIndex} className="border-0 shadow-lg hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{role.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {role.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {role.location}
                          </span>
                        </div>
                        <CardDescription className="text-sm">
                          {role.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            window.location.href = `mailto:imaduddin.dev@gmail.com?subject=Application for ${role.title}&body=Hi, I'm interested in the ${role.title} position at PayPerCrawl. Please find my CV/resume attached.`
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Apply via Email
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How to Apply
            </h2>
            <p className="text-xl text-slate-600">
              Simple application process for all positions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Position</h3>
              <p className="text-slate-600">
                Browse our open positions and find the role that matches your expertise
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Send Your CV</h3>
              <p className="text-slate-600">
                Email your resume/CV to imaduddin.dev@gmail.com with the position title
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Interview Process</h3>
              <p className="text-slate-600">
                We'll review your application and reach out for interviews if there's a match
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Email Your Application</CardTitle>
                <CardDescription>
                  Send your CV/resume to the email address below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  className="w-full md:w-auto"
                  onClick={() => {
                    window.location.href = 'mailto:imaduddin.dev@gmail.com?subject=Job Application at PayPerCrawl&body=Hi, I\'m interested in joining the PayPerCrawl team. Please find my CV/resume attached.'
                  }}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  imaduddin.dev@gmail.com
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">PayPerCrawl</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2025 PayPerCrawl. All rights reserved.</p>
              <p className="text-sm mt-1">The Cloudflare for WordPress</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}