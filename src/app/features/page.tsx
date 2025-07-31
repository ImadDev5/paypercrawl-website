'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, DollarSign, Globe, Users, TrendingUp, Database, Code, Lock, BarChart3, Cloud, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
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
              <Link href="/features" className="text-blue-600 font-medium">Features</Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/blog" className="text-slate-600 hover:text-slate-900 transition-colors">Blog</Link>
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
                BETA PROGRAM
              </span>
              Technical Excellence • 100% Revenue Share
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Built for Performance, 
              <span className="text-blue-200"> Designed for Publishers</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover the powerful features that make PayPerCrawl the leading AI bot monetization 
              platform for WordPress publishers
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to monetize AI bot traffic on your WordPress site
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Real-time Detection
                  <Badge variant="secondary">95% Accuracy</Badge>
                </CardTitle>
                <CardDescription>
                  Advanced AI bot identification using machine learning algorithms running at the edge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Instant bot identification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Machine learning powered
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Continuous model updates
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Micro-monetization
                  <Badge variant="secondary">HTTP 402</Badge>
                </CardTitle>
                <CardDescription>
                  Revolutionary revenue model using industry-standard payment protocols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Per-request billing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    100% revenue share
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Instant payouts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="flex items-center gap-2">
                  WordPress Integration
                  <Badge variant="secondary">5-Min Setup</Badge>
                </CardTitle>
                <CardDescription>
                  Seamless compatibility with the entire WordPress ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Elementor compatible
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    WooCommerce support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Caching plugin friendly
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Edge Computing
                  <Badge variant="secondary">Cloudflare</Badge>
                </CardTitle>
                <CardDescription>
                  Global performance optimization using Cloudflare Workers infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    99% cost advantage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Global CDN network
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sub-100ms responses
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Scalable Architecture
                  <Badge variant="secondary">10M+ Requests</Badge>
                </CardTitle>
                <CardDescription>
                  Enterprise-ready infrastructure built for massive scale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Auto-scaling workers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    99.9% uptime SLA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle className="flex items-center gap-2">
                  AI Marketplace
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Connect with AI companies looking for licensed training data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Premium AI partnerships
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Data licensing deals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Revenue optimization
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Technical Specifications
            </h2>
            <p className="text-xl text-slate-600">
              Built with cutting-edge technology for maximum performance and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Code className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Architecture</CardTitle>
                <CardDescription>
                  Modern, serverless architecture designed for scale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-600">Platform</span>
                    <span className="font-medium">Cloudflare Workers</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Storage</span>
                    <span className="font-medium">Cloudflare KV + D1</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">CDN</span>
                    <span className="font-medium">Global Cloudflare Network</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Protocol</span>
                    <span className="font-medium">HTTP 402 Payment Required</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  Optimized for speed and reliability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-600">Response Time</span>
                    <span className="font-medium">&lt;100ms</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Throughput</span>
                    <span className="font-medium">10M+ requests/day</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Detection Accuracy</span>
                    <span className="font-medium">95%+</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Lock className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Enterprise-grade security for your peace of mind
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-600">Data Encryption</span>
                    <span className="font-medium">TLS 1.3</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Authentication</span>
                    <span className="font-medium">OAuth 2.0 + JWT</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Compliance</span>
                    <span className="font-medium">GDPR, CCPA</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Audit Logs</span>
                    <span className="font-medium">Real-time monitoring</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Database className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Integration</CardTitle>
                <CardDescription>
                  Seamless integration with your existing stack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-600">WordPress</span>
                    <span className="font-medium">5.0+ compatible</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Payment</span>
                    <span className="font-medium">Stripe Connect</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">Analytics</span>
                    <span className="font-medium">Real-time dashboard</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">API</span>
                    <span className="font-medium">RESTful + Webhooks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of WordPress publishers monetizing their content with PayPerCrawl
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View Documentation
            </Button>
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