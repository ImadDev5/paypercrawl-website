"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Shield,
  Zap,
  DollarSign,
  Globe,
  Users,
  TrendingUp,
  DownloadCloud,
  Settings,
  BarChart,
  Twitter,
  Github,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                PayPerCrawl
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/careers"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Careers
              </Link>
              <Link href="/waitlist">
                <Button>Join Beta</Button>
              </Link>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                BETA PROGRAM
              </span>
              Limited Access • 100% Revenue Share
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Monetize Your Content
              <span className="text-primary"> Risk-Free</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join our exclusive beta program and keep 100% of all revenue
              generated. PayPerCrawl turns AI bot traffic into income with our
              simple WordPress plugin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/waitlist">
                <Button size="lg" className="text-lg px-8 py-3">
                  Apply for Beta Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">75M+</div>
              <div className="text-muted-foreground">WordPress Sites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <div className="text-muted-foreground">Cost Advantage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                &lt;100ms
              </div>
              <div className="text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Revenue Share</div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Program Benefits */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Beta Program Benefits
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Limited-time offer for our founding beta participants
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-lg dark:bg-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">100% Revenue Share</CardTitle>
                <CardDescription>
                  Keep all earnings generated from AI bot traffic during beta
                  period
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Priority Support</CardTitle>
                <CardDescription>
                  Direct access to our founding team for personalized assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Early Access</CardTitle>
                <CardDescription>
                  Be first to access new features and AI marketplace
                  integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose PayPerCrawl?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for WordPress publishers who want to monetize their content
              in the AI age
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-lg dark:bg-card">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Real-time Detection</CardTitle>
                <CardDescription>
                  Immediate AI bot identification with 95%+ accuracy using
                  advanced edge computing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Micro-monetization</CardTitle>
                <CardDescription>
                  Revolutionary revenue model that turns every AI crawl into
                  payable income
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4" />
                <CardTitle>WordPress Integration</CardTitle>
                <CardDescription>
                  Seamless compatibility with WordPress ecosystem - stupidly
                  easy installation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Edge Computing</CardTitle>
                <CardDescription>
                  Global performance optimization using Cloudflare Workers
                  infrastructure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Scalable Architecture</CardTitle>
                <CardDescription>
                  Enterprise-ready infrastructure handling 10M+ bot detections
                  per day
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI Marketplace</CardTitle>
                <CardDescription>
                  Connect with AI companies looking for licensed, high-quality
                  training data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why PayPerCrawl Wins
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our defensible moat creates sustainable competitive advantage
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Infrastructure Arbitrage
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Our most potent competitive advantage is a structural economic
                moat built on the principle of "infrastructure arbitrage." This
                provides a nearly insurmountable margin advantage.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">99% Cost Advantage</h4>
                    <p className="text-muted-foreground">
                      Cloudflare Workers vs enterprise solutions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Near-Zero Marginal Cost</h4>
                    <p className="text-muted-foreground">
                      Scale without increasing infrastructure costs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Symbiotic Relationship</h4>
                    <p className="text-muted-foreground">
                      Working with Cloudflare, not against them
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="shadow-lg dark:bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Market Validation</CardTitle>
                <CardDescription>
                  Our opportunity is validated by multiple market forces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">
                    $3.2B AI Training Data Market
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Growing at 20% CAGR with insatiable demand
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">TollBit's $31M Funding</h4>
                  <p className="text-muted-foreground text-sm">
                    Validates the business model and demand
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Cloudflare's Protocol Standards
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    HTTP 402 "Payment Required" adoption
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">800M WordPress Sites</h4>
                  <p className="text-muted-foreground text-sm">
                    Greenfield opportunity untapped by competitors
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple Integration, Powerful Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A 3-step process to monetize your traffic and protect your
              content.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <DownloadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                1. Install Plugin
              </h3>
              <p className="text-muted-foreground">
                Easily install our lightweight WordPress plugin or integrate our
                Cloudflare Worker.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                2. Set Your Price
              </h3>
              <p className="text-muted-foreground">
                Configure your pricing per 1,000 tokens and define rules for
                different crawlers.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <BarChart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                3. Start Earning
              </h3>
              <p className="text-muted-foreground">
                Automatically bill AI crawlers for accessing your content and
                watch your revenue grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            Ready to reclaim your content's value?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our private beta and be among the first to monetize AI-driven
            traffic. Secure your spot and help shape the future of web
            monetization.
          </p>
          <Button size="lg" className="text-lg">
            <Link href="/waitlist">Join the Waitlist</Link>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Solutions
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/features"
                    className="text-base text-foreground hover:text-primary"
                  >
                    AI Monetization
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Content Protection
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Publisher Tools
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/contact"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-base text-foreground hover:text-primary"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-base text-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-base text-muted-foreground">
              &copy; {new Date().getFullYear()} PayPerCrawl. All rights
              reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-primary"
              >
                Admin
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
