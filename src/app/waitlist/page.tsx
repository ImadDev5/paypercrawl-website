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
import { RingLoader } from "@/components/RingLoader";
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
import { Navigation } from "@/components/ui/navigation";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { FadeIn } from "@/components/ui/fade-in";

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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [existingStatus, setExistingStatus] = useState<{
    exists: boolean;
    status: string | null;
    name?: string;
  } | null>(null);
  
  // Check URL params for status
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const statusParam = urlParams?.get('status');
  const showPendingBanner = statusParam === 'pending';
  const showRejectedBanner = statusParam === 'rejected';

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
        <Navigation />

        {/* Success Section */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn delay={0.1} direction="up">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                Application Received!
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                Thank you for your interest in PayPerCrawl's beta program. We've
                received your application and will review it carefully.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                  What's Next?
                </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                      Review Process
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
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
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                      Invitation Email
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
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
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
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
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
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
            </FadeIn>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0.1} direction="up">
            {/* Status Banners */}
            {showPendingBanner && (
              <div className="auth-status-banner pending p-4 mb-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">
                    Application Under Review
                  </span>
                </div>
                <p className="text-amber-700 dark:text-amber-300 text-xs mt-2 text-center">
                  Your application is being reviewed by our team. You'll receive an email notification once approved for dashboard access.
                </p>
              </div>
            )}
            
            {showRejectedBanner && (
              <div className="auth-status-banner rejected p-4 mb-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-red-800 dark:text-red-200 text-sm">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">
                    Application Reviewed
                  </span>
                </div>
                <p className="text-red-700 dark:text-red-300 text-xs mt-2 text-center">
                  Your application has been reviewed. Please contact our support team for more information about next steps.
                </p>
              </div>
            )}

            <div className="relative inline-block mb-4">
            <Badge
              variant="secondary"
              className="text-xs sm:text-sm relative z-10 px-4 py-2"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                BETA APPLICATION
              </span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">Limited Spots Available</span>
            </Badge>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <RingLoader
                width={400}
                height={50}
                strokeWidth={2}
                animationSpeed={5}
                borderRadius={25}
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            <span className="block sm:inline">Join the PayPerCrawl</span>
            <span className="text-primary block sm:inline"> Beta Program</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Get early access to the future of AI content monetization. Keep 100%
            of your revenue during the beta period.
          </p>

          {/* Invite-Only Notice */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
              <Shield className="h-4 w-4" />
              <span className="font-medium">
                Dashboard Access is by Invitation Only
              </span>
            </div>
            <p className="text-amber-700 dark:text-amber-300 text-xs mt-2 text-center">
              After submitting your application, wait for our approval email
              with your unique dashboard access link.
            </p>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.2} direction="up">
            <Card className="shadow-lg dark:bg-card">
              <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">
                Beta Application
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Fill out the form below to apply for our exclusive beta program.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Google Sign-In Section */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Already on the waitlist? Sign in to access the dashboard
                  </p>
                  <GoogleAuthButton 
                    variant="outline"
                    size="lg"
                    className="w-full"
                    useGoogleLogo={true}
                  />
                </div>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or apply for beta access
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm sm:text-base">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-sm sm:text-base">
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    required
                    value={formData.website}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="monthlyVisitors"
                    className="text-sm sm:text-base"
                  >
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whyJoin" className="text-sm sm:text-base">
                    Why do you want to join the beta?
                  </Label>
                  <Textarea
                    id="whyJoin"
                    name="whyJoin"
                    placeholder="Tell us about your content and why you're interested in PayPerCrawl..."
                    required
                    value={formData.whyJoin}
                    onChange={handleChange}
                    className="mt-1 min-h-[100px] sm:min-h-[120px]"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base sm:text-lg py-3 sm:py-4 disabled:opacity-100 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Apply for Beta Access"}
                </Button>
              </form>
            </CardContent>
          </Card>
          </FadeIn>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Beta Program Perks
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                As a beta participant, you'll receive exclusive benefits.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <FadeIn delay={0.2} direction="up">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  Early Access
                </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Be the first to use our groundbreaking AI monetization tools.
              </p>
            </div>
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                Direct Founder Access
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get priority support and directly influence the product roadmap.
              </p>
            </div>
            </FadeIn>
            <FadeIn delay={0.4} direction="up">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                100% Revenue Share
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Keep every dollar you earn during the entire beta period.
              </p>
            </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
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
