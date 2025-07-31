'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, CheckCircle, Users, ArrowRight, Mail, Globe, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    monthlyVisitors: '',
    whyJoin: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-slate-900">PayPerCrawl</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
                <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
                <Link href="/blog" className="text-slate-600 hover:text-slate-900 transition-colors">Blog</Link>
                <Link href="/"><Button variant="outline">Back to Home</Button></Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Success Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Application Received!
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Thank you for your interest in PayPerCrawl's beta program. We've received your application and will review it carefully.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">What's Next?</h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Review Process</h3>
                    <p className="text-slate-600 text-sm">Our team will review your application within 3-5 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Invitation Email</h3>
                    <p className="text-slate-600 text-sm">If approved, you'll receive an exclusive invitation to join the beta</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Start Earning</h3>
                    <p className="text-slate-600 text-sm">Install the plugin and begin monetizing your AI bot traffic</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="text-lg px-8 py-3">
                  Return to Home
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Read Our Blog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">PayPerCrawl</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/blog" className="text-slate-600 hover:text-slate-900 transition-colors">Blog</Link>
              <Link href="/"><Button variant="outline">Back to Home</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              BETA APPLICATION
            </span>
            Limited Spots Available
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Join the PayPerCrawl
            <span className="text-purple-600"> Beta Program</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Apply for exclusive access to our AI monetization platform. Keep 100% of revenue during beta period.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Beta Application</CardTitle>
              <CardDescription>
                Tell us about your WordPress site and why you'd like to join our beta program.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">WordPress Website URL *</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    required
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yoursite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyVisitors">Monthly Visitors (Approximate)</Label>
                  <Input
                    id="monthlyVisitors"
                    name="monthlyVisitors"
                    type="text"
                    value={formData.monthlyVisitors}
                    onChange={handleChange}
                    placeholder="e.g., 10,000 - 50,000"
                  />
                </div>

                <div>
                  <Label htmlFor="whyJoin">Why do you want to join the beta program? *</Label>
                  <Textarea
                    id="whyJoin"
                    name="whyJoin"
                    required
                    rows={4}
                    value={formData.whyJoin}
                    onChange={handleChange}
                    placeholder="Tell us about your goals and how you plan to use PayPerCrawl..."
                  />
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Beta Program Benefits</h3>
                  <ul className="space-y-1 text-sm text-purple-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      100% revenue share during beta period
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Priority support from founding team
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Early access to new features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Permanent founder status recognition
                    </li>
                  </ul>
                </div>

                <Button type="submit" size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                  Apply for Beta Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              Have questions? 
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 ml-1">
                Contact our team
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Limited to 100 beta participants</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>WordPress sites only</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>2-minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}