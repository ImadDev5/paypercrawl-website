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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Menu,
  X,
  Home as HomeIcon,
  Star,
  Info,
  BookOpen,
  Briefcase,
  Mail,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary-foreground relative">
      {/* Global decorative gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[750px] bg-[radial-gradient(ellipse_at_top,theme(colors.primary)/18%,transparent_70%)] opacity-80 dark:opacity-60" />
      </div>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 supports-[backdrop-filter]:backdrop-blur-xl border-b border-border/60 backdrop-saturate-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-xl font-bold text-foreground">
                PayPerCrawl
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-5 lg:space-x-7 xl:space-x-9">
              <Link
                href="/"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Home
              </Link>
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
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link href="/waitlist">
                <Button
                  size="sm"
                  elevation="md"
                  className="shadow-sm hover:shadow-md"
                >
                  Join Beta
                </Button>
              </Link>
              <ModeToggle />
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <ModeToggle />
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2 h-9 w-9"
                    elevation="none"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[320px] sm:w-[380px] p-0 bg-background/95 backdrop-blur-2xl border-l border-border/50 shadow-2xl"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border/30 bg-background/80 backdrop-blur-xl">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-6 w-6 text-primary drop-shadow-sm" />
                      <span className="text-lg font-bold text-foreground drop-shadow-sm">
                        PayPerCrawl
                      </span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex flex-col h-full bg-background/70 backdrop-blur-md">
                    <nav className="flex-1 p-6 bg-background/50 backdrop-blur-sm">
                      <div className="space-y-1">
                        <Link
                          href="/"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-foreground bg-primary/10 border border-primary/20 transition-all duration-200 group hover:bg-primary/15 hover:border-primary/30 backdrop-blur-sm shadow-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <HomeIcon className="h-5 w-5 text-primary transition-colors drop-shadow-sm" />
                          <span className="font-semibold text-foreground drop-shadow-sm">
                            Home
                          </span>
                        </Link>
                        <Link
                          href="/features"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 group backdrop-blur-sm hover:shadow-md"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Star className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                          <span className="font-medium drop-shadow-sm">
                            Features
                          </span>
                        </Link>
                        <Link
                          href="/about"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 group backdrop-blur-sm hover:shadow-md"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Info className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                          <span className="font-medium drop-shadow-sm">
                            About
                          </span>
                        </Link>
                        <Link
                          href="/blog"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 group backdrop-blur-sm hover:shadow-md"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                          <span className="font-medium drop-shadow-sm">
                            Blog
                          </span>
                        </Link>
                        <Link
                          href="/careers"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 group backdrop-blur-sm hover:shadow-md"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                          <span className="font-medium drop-shadow-sm">
                            Careers
                          </span>
                        </Link>
                        <Link
                          href="/contact"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 group backdrop-blur-sm hover:shadow-md"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                          <span className="font-medium drop-shadow-sm">
                            Contact
                          </span>
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 group backdrop-blur-sm hover:shadow-md"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                          <span className="font-medium drop-shadow-sm">
                            Dashboard
                          </span>
                        </Link>
                      </div>
                    </nav>

                    {/* CTA Section */}
                    <div className="p-6 border-t border-border/40 bg-accent/30 backdrop-blur-lg">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground drop-shadow-sm">
                          Ready to monetize your content?
                        </p>
                        <Link
                          href="/waitlist"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Button
                            elevation="md"
                            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm border border-primary/25"
                          >
                            Join Beta Program
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative radial gradient background (adapts to theme) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)] bg-[radial-gradient(circle_at_center,theme(colors.primary)/12%,transparent_70%)]"
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 text-xs sm:text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                BETA PROGRAM
              </span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">
                Limited Access • 100% Revenue Share
              </span>
            </Badge>
            <h1 className="text-balance text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4 sm:mb-6 leading-tight">
              <span className="block sm:inline">Monetize Your Content</span>
              <span className="text-primary block sm:inline"> Risk-Free</span>
            </h1>
            <p className="text-pretty text-base sm:text-xl lg:text-[1.35rem] text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-2 sm:px-0">
              Join our exclusive beta program and keep 100% of all revenue
              generated. PayPerCrawl turns AI bot traffic into income with our
              simple WordPress plugin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link href="/waitlist">
                <Button
                  size="lg"
                  elevation="md"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 shadow-md hover:shadow-lg"
                >
                  Apply for Beta Access
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="subtle"
                  size="lg"
                  elevation="sm"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary/60 text-secondary-foreground py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                75M+
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">
                WordPress Sites
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                99%
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">
                Cost Advantage
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                &lt;100ms
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">
                Response Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                100%
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">
                Revenue Share
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Program Benefits */}
      <section className="bg-muted/30 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Beta Program Benefits
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Limited-time offer for our founding beta participants
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            <Card className="shadow-lg dark:bg-card transition hover:shadow-xl hover:-translate-y-0.5 focus-within:shadow-xl focus-within:-translate-y-0.5 motion-safe:duration-300">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  100% Revenue Share
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Keep all earnings generated from AI bot traffic during beta
                  period
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:shadow-xl hover:-translate-y-0.5 focus-within:shadow-xl focus-within:-translate-y-0.5 motion-safe:duration-300">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  Priority Support
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Direct access to our founding team for personalized assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:shadow-xl hover:-translate-y-0.5 focus-within:shadow-xl focus-within:-translate-y-0.5 motion-safe:duration-300">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  Early Access
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Be first to access new features and AI marketplace
                  integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:shadow-xl hover:-translate-y-0.5 focus-within:shadow-xl focus-within:-translate-y-0.5 motion-safe:duration-300">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  Founder Status
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Permanent recognition as a founding member of our platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose PayPerCrawl?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for WordPress publishers who want to monetize their content
              in the AI age
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <Card className="shadow-lg dark:bg-card transition hover:border-primary/30 hover:shadow-xl focus-within:shadow-xl motion-safe:duration-300">
              <CardHeader className="p-4 sm:p-6">
                <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Real-time Detection
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Immediate AI bot identification with 95%+ accuracy using
                  advanced edge computing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:border-primary/30 hover:shadow-xl focus-within:shadow-xl motion-safe:duration-300">
              <CardHeader className="p-4 sm:p-6">
                <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Micro-monetization
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Revolutionary revenue model that turns every AI crawl into
                  payable income
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:border-primary/30 hover:shadow-xl focus-within:shadow-xl motion-safe:duration-300">
              <CardHeader className="p-4 sm:p-6">
                <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  WordPress Integration
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Seamless compatibility with WordPress ecosystem - stupidly
                  easy installation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:border-primary/30 hover:shadow-xl focus-within:shadow-xl motion-safe:duration-300">
              <CardHeader className="p-4 sm:p-6">
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Edge Computing
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Global performance optimization using Cloudflare Workers
                  infrastructure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:border-primary/30 hover:shadow-xl focus-within:shadow-xl motion-safe:duration-300">
              <CardHeader className="p-4 sm:p-6">
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Scalable Architecture
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Enterprise-ready infrastructure handling 10M+ bot detections
                  per day
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg dark:bg-card transition hover:border-primary/30 hover:shadow-xl focus-within:shadow-xl motion-safe:duration-300">
              <CardHeader className="p-4 sm:p-6">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  AI Marketplace
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Connect with AI companies looking for licensed, high-quality
                  training data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="bg-muted/30 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why PayPerCrawl Wins
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Our defensible moat creates sustainable competitive advantage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                Infrastructure Arbitrage
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                Our most potent competitive advantage is a structural economic
                moat built on the principle of "infrastructure arbitrage." This
                provides a nearly insurmountable margin advantage.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">
                      99% Cost Advantage
                    </h4>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Cloudflare Workers vs enterprise solutions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">
                      Near-Zero Marginal Cost
                    </h4>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Scale without increasing infrastructure costs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">
                      Symbiotic Relationship
                    </h4>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Working with Cloudflare, not against them
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="shadow-lg dark:bg-card order-1 lg:order-2 transition hover:shadow-xl motion-safe:duration-300">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Market Validation
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Our opportunity is validated by multiple market forces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">
                    $3.2B AI Training Data Market
                  </h4>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Growing at 20% CAGR with insatiable demand
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">
                    TollBit's $31M Funding
                  </h4>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Validates the business model and demand
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">
                    Cloudflare's Protocol Standards
                  </h4>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    HTTP 402 "Payment Required" adoption
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">
                    800M WordPress Sites
                  </h4>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Greenfield opportunity untapped by competitors
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple Integration, Powerful Results
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              A 3-step process to monetize your traffic and protect your
              content.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <DownloadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                1. Install Plugin
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Easily install our lightweight WordPress plugin or integrate our
                Cloudflare Worker.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                2. Set Your Price
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Configure your pricing per 1,000 tokens and define rules for
                different crawlers.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <BarChart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                3. Start Earning
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Automatically bill AI crawlers for accessing your content and
                watch your revenue grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,theme(colors.primary)/20%,transparent_65%)] opacity-70"
        />
        <div className="max-w-4xl mx-auto text-center py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
            Ready to reclaim your content's value?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            Join our private beta and be among the first to monetize AI-driven
            traffic. Secure your spot and help shape the future of web
            monetization.
          </p>
          <Link href="/waitlist">
            <Button
              size="lg"
              elevation="md"
              className="text-base sm:text-lg w-full sm:w-auto px-8 shadow-md hover:shadow-lg"
            >
              Join the Waitlist
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md border-t border-border/60">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Solutions
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    href="/features"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    AI Monetization
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Content Protection
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Publisher Tools
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Support
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    href="/contact"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Company
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                Legal
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm sm:text-base text-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 border-t border-border pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
              &copy; {new Date().getFullYear()} PayPerCrawl. All rights
              reserved.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-primary text-sm sm:text-base"
              >
                Admin
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
