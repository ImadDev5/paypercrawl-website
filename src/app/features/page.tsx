"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RingLoader } from "@/components/RingLoader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ArrowRight,
  Shield,
  Zap,
  DollarSign,
  Globe,
  Users,
  TrendingUp,
  Database,
  Code,
  Lock,
  BarChart3,
  Cloud,
  CheckCircle,
  Twitter,
  Github,
  BrainCircuit,
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
import { Navigation } from "@/components/ui/navigation";
import { FadeIn } from "@/components/ui/fade-in";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 xl:py-32">
          <div className="text-center">
            <FadeIn delay={0.1}>
              <div className="relative inline-block mb-4">
                <Badge variant="secondary" className="relative z-10 px-4 py-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></span>
                    BETA PROGRAM
                  </span>
                  <span className="hidden sm:inline">
                    {" "}
                    Technical Excellence • 100% Revenue Share
                  </span>
                </Badge>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <RingLoader
                    width={460}
                    height={50}
                    strokeWidth={2}
                    animationSpeed={5}
                    borderRadius={25}
                    className="max-w-full"
                  />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
                Built for Performance,
                <span className="text-primary-foreground/80">
                  {" "}
                  Designed for Publishers
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Discover the powerful features that make PayPerCrawl the leading
                AI bot monetization platform for WordPress publishers
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <FadeIn delay={0.1}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Core Features
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to monetize AI bot traffic on your WordPress
                site
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FadeIn delay={0.3} direction="up">
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-card h-full">
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="flex items-center gap-2">
                    Real-time Detection
                    <Badge variant="secondary">95% Accuracy</Badge>
                  </CardTitle>
                  <CardDescription>
                    Advanced AI bot identification using machine learning
                    algorithms running at the edge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Instant bot identification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Machine learning powered
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Continuous model updates
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.4} direction="up">
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-card h-full">
                <CardHeader>
                  <DollarSign className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="flex items-center gap-2">
                    Micro-monetization
                    <Badge variant="secondary">HTTP 402</Badge>
                </CardTitle>
                <CardDescription>
                  Revolutionary revenue model using industry-standard payment
                  protocols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Per-request billing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    100% revenue share
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Instant payouts
                  </li>
                </ul>
              </CardContent>
            </Card>
            </FadeIn>

            <FadeIn delay={0.5} direction="up">
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-card h-full">
                <CardHeader>
                  <Globe className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="flex items-center gap-2">
                    WordPress Integration
                    <Badge variant="secondary">5-Min Setup</Badge>
                  </CardTitle>
                  <CardDescription>
                    Seamless compatibility with the entire WordPress ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Elementor compatible
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    WooCommerce support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Caching plugin friendly
                  </li>
                </ul>
              </CardContent>
            </Card>
            </FadeIn>

            <FadeIn delay={0.6} direction="up">
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-card h-full">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="flex items-center gap-2">
                    Edge Computing
                    <Badge variant="secondary">Cloudflare</Badge>
                  </CardTitle>
                  <CardDescription>
                    Global performance optimization using Cloudflare Workers
                    infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      99% cost advantage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Global CDN network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Sub-100ms responses
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.7} direction="up">
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-card h-full">
                <CardHeader>
                  <TrendingUp className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="flex items-center gap-2">
                    Scalable Architecture
                    <Badge variant="secondary">10M+ Requests</Badge>
                  </CardTitle>
                  <CardDescription>
                  Enterprise-ready infrastructure built for massive scale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Auto-scaling workers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    99.9% uptime SLA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Real-time analytics
                  </li>
                </ul>
              </CardContent>
            </Card>
            </FadeIn>

            <FadeIn delay={0.8} direction="up">
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-card h-full">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="flex items-center gap-2">
                    AI Marketplace
                    <Badge variant="secondary">Coming Soon</Badge>
                  </CardTitle>
                  <CardDescription>
                    Connect with AI companies looking for licensed training data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Premium AI partnerships
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Data licensing deals
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Revenue optimization
                    </li>
                </ul>
              </CardContent>
            </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Technical Specifications
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                PayPerCrawl is built on a modern, scalable, and secure technology
                stack
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="bg-card rounded-lg shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Key Technologies
                  </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="p-2 bg-primary/10 rounded-full mr-4">
                      <Cloud className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Cloudflare Workers
                      </h4>
                      <p className="text-muted-foreground">
                        Serverless execution environment for high-performance,
                        low-latency bot detection.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="p-2 bg-primary/10 rounded-full mr-4">
                      <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Machine Learning
                      </h4>
                      <p className="text-muted-foreground">
                        Proprietary models for bot detection, continuously
                        trained on new data.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="p-2 bg-primary/10 rounded-full mr-4">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        HTTP 402 Protocol
                      </h4>
                      <p className="text-muted-foreground">
                        Native browser payment requests for a seamless user
                        experience.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Bot Detection Latency
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        &lt;100ms
                      </span>
                    </div>
                    <Progress value={95} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Uptime SLA
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        99.9%
                      </span>
                    </div>
                    <Progress value={99.9} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Accuracy
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        &gt;95%
                      </span>
                    </div>
                    <Progress value={95} className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0.1} direction="up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to Stop Unpaid AI Traffic?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our waitlist to get early access to PayPerCrawl and start
              monetizing your content.
            </p>
            <Button size="lg" className="text-lg">
              Request Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </FadeIn>
        </div>
      </section>

      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              &copy; 2024 PayPerCrawl. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Admin
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
