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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  CheckCircle,
  Users,
  ArrowRight,
  Mail,
  Globe,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModeToggle } from "@/components/mode-toggle";

export default function WaitlistPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    monthlyVisitors: "",
    whyJoin: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Map form data to API expected format
      const apiData = {
        name: formData.name,
        email: formData.email,
        website: formData.website,
        companySize: "medium", // Default value since not in form
        useCase: `Monthly visitors: ${formData.monthlyVisitors}. Reason: ${formData.whyJoin}`,
      };

      const response = await fetch("/api/waitlist/join/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Waitlist submission successful:", result);
        toast({
          title: "Success!",
          description:
            "Successfully joined waitlist! Check your email for confirmation.",
        });
        setIsSubmitted(true);
      } else {
        console.error("Waitlist submission failed:", result);
        toast({
          title: "Error",
          description:
            result.error || "Failed to join waitlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
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
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
                <ModeToggle />
              </div>
            </div>
          </div>
        </nav>

        {/* Success Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Application Received!
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Thank you for your interest in PayPerCrawl's beta program. We've
              received your application and will review it carefully.
            </p>
            <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                What's Next?
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Review Process
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Our team will review your application within 3-5 business
                      days
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Invitation Email
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      If approved, you'll receive an exclusive invitation to
                      join the beta
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Start Earning
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Install the plugin and begin monetizing your AI bot
                      traffic
                    </p>
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
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  Read Our Blog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              BETA APPLICATION
            </span>
            Limited Spots Available
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Join the PayPerCrawl
            <span className="text-primary"> Beta Program</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get early access to the future of AI content monetization. Keep 100%
            of your revenue during the beta period.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg dark:bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Beta Application</CardTitle>
              <CardDescription>
                Fill out the form below to apply for our exclusive beta program.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    required
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyVisitors">
                    Estimated Monthly Visitors
                  </Label>
                  <Input
                    id="monthlyVisitors"
                    name="monthlyVisitors"
                    type="text"
                    placeholder="e.g., 100,000"
                    required
                    value={formData.monthlyVisitors}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="whyJoin">
                    Why do you want to join the beta?
                  </Label>
                  <Textarea
                    id="whyJoin"
                    name="whyJoin"
                    placeholder="Tell us about your content and why you're interested in PayPerCrawl..."
                    required
                    value={formData.whyJoin}
                    onChange={handleChange}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Apply for Beta Access"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Beta Program Perks
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              As a beta participant, you'll receive exclusive benefits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Early Access
              </h3>
              <p className="text-muted-foreground">
                Be the first to use our groundbreaking AI monetization tools.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Direct Founder Access
              </h3>
              <p className="text-muted-foreground">
                Get priority support and directly influence the product roadmap.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                100% Revenue Share
              </h3>
              <p className="text-muted-foreground">
                Keep every dollar you earn during the entire beta period.
              </p>
            </div>
          </div>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
