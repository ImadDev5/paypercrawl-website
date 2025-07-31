'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, DollarSign, Globe, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
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
              <Link href="/careers" className="text-slate-600 hover:text-slate-900 transition-colors">Careers</Link>
              <Link href="/waitlist"><Button className="bg-purple-600 hover:bg-purple-700">Join Beta</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                BETA PROGRAM
              </span>
              Limited Access • 100% Revenue Share
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Monetize Your Content
              <span className="text-purple-600"> Risk-Free</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Join our exclusive beta program and keep 100% of all revenue generated. 
              PayPerCrawl turns AI bot traffic into income with our simple WordPress plugin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/waitlist">
                <Button size="lg" className="text-lg px-8 py-3 bg-purple-600 hover:bg-purple-700">
                  Apply for Beta Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">75M+</div>
              <div className="text-slate-300">WordPress Sites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">99%</div>
              <div className="text-slate-300">Cost Advantage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">&lt;100ms</div>
              <div className="text-slate-300">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
              <div className="text-slate-300">Revenue Share</div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Program Benefits */}
      <section className="bg-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Beta Program Benefits
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Limited-time offer for our founding beta participants
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">100% Revenue Share</CardTitle>
                <CardDescription>
                  Keep all earnings generated from AI bot traffic during beta period
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Priority Support</CardTitle>
                <CardDescription>
                  Direct access to our founding team for personalized assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Early Access</CardTitle>
                <CardDescription>
                  Be first to access new features and AI marketplace integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Founder Status</CardTitle>
                <CardDescription>
                  Permanent recognition as a founding member of our platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose PayPerCrawl?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built for WordPress publishers who want to monetize their content in the AI age
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Real-time Detection</CardTitle>
                <CardDescription>
                  Immediate AI bot identification with 95%+ accuracy using advanced edge computing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Micro-monetization</CardTitle>
                <CardDescription>
                  Revolutionary revenue model that turns every AI crawl into payable income
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>WordPress Integration</CardTitle>
                <CardDescription>
                  Seamless compatibility with WordPress ecosystem - stupidly easy installation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Edge Computing</CardTitle>
                <CardDescription>
                  Global performance optimization using Cloudflare Workers infrastructure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Scalable Architecture</CardTitle>
                <CardDescription>
                  Enterprise-ready infrastructure handling 10M+ bot detections per day
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>AI Marketplace</CardTitle>
                <CardDescription>
                  Connect with AI companies looking for licensed, high-quality training data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why PayPerCrawl Wins
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our defensible moat creates sustainable competitive advantage
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Infrastructure Arbitrage
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                Our most potent competitive advantage is a structural economic moat built on the principle 
                of "infrastructure arbitrage." This provides a nearly insurmountable margin advantage.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">99% Cost Advantage</h4>
                    <p className="text-slate-600">Cloudflare Workers vs enterprise solutions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Near-Zero Marginal Cost</h4>
                    <p className="text-slate-600">Scale without increasing infrastructure costs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Symbiotic Relationship</h4>
                    <p className="text-slate-600">Working with Cloudflare, not against them</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Market Validation</CardTitle>
                <CardDescription>
                  Our opportunity is validated by multiple market forces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">$3.2B AI Training Data Market</h4>
                  <p className="text-slate-600 text-sm">Growing at 20% CAGR with insatiable demand</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">TollBit's $31M Funding</h4>
                  <p className="text-slate-600 text-sm">Validates the business model and demand</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cloudflare's Protocol Standards</h4>
                  <p className="text-slate-600 text-sm">HTTP 402 "Payment Required" adoption</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">800M WordPress Sites</h4>
                  <p className="text-slate-600 text-sm">Greenfield opportunity untapped by competitors</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How PayPerCrawl Works
            </h2>
            <p className="text-xl text-slate-600">
              Three simple steps to start monetizing your content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Install Plugin</h3>
              <p className="text-slate-600">
                Download and install our WordPress plugin in under 2 minutes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Configure Settings</h3>
              <p className="text-slate-600">
                Set your monetization preferences and connect your payment account
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Earning</h3>
              <p className="text-slate-600">
                Receive payments when AI companies access your content
              </p>
            </div>
          </div>
        </div>
      </section>

  

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ready to Monetize Your Content?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of WordPress publishers already earning from AI bot traffic
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/waitlist">
              <Button size="lg" className="text-lg px-8 py-3 bg-purple-600 hover:bg-purple-700">
                Apply for Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </Link>
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