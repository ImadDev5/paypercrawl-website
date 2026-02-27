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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Navigation } from "@/components/ui/navigation";
import { FadeIn } from "@/components/ui/fade-in";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<'general'|'support'|'careers'>('general');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center">
              <Badge
                variant="secondary"
                className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  BETA PROGRAM
                </span>
                Contact Us • 100% Revenue Share
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Apply for Exclusive
                <span className="text-primary-foreground/80"> Beta Access</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
                Join our exclusive invite-only program and get 100% revenue share.
                Limited spots available for selected WordPress publishers.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <FadeIn delay={0.2} direction="up">
              <Card className="bg-card text-card-foreground h-full">
                <CardHeader>
                  <Mail className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <CardTitle>Email Us</CardTitle>
                  <CardDescription>Get in touch with our team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">suhailult777@gmail.com</p>
                    <p className="text-sm text-muted-foreground">
                      Technical support & plugin help
                    </p>
                  </div>
                  <div className="space-y-2 mt-4">
                    <p className="font-medium">suhailult777@gmail.com</p>
                    <p className="text-sm text-muted-foreground">
                      General inquiries & partnerships
                    </p>
                  </div>
                  <div className="space-y-2 mt-4">
                    <p className="font-medium">suhailult777@gmail.com</p>
                    <p className="text-sm text-muted-foreground">
                      Roles, internships, and hiring
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <Card className="bg-card text-card-foreground h-full">
                <CardHeader>
                  <Phone className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <CardTitle>Call Us</CardTitle>
                  <CardDescription>Speak with our team directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">
                      Business & Enterprise customers
                    </p>
                  </div>
                  <div className="space-y-2 mt-4">
                    <p className="font-medium">+1 (555) 987-6543</p>
                    <p className="text-sm text-muted-foreground">
                      Technical support line
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.4} direction="up">
              <Card className="bg-card text-card-foreground h-full">
                <CardHeader>
                  <MapPin className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <CardTitle>Our Office</CardTitle>
                  <CardDescription>Visit our headquarters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">123 Innovation Drive</p>
                    <p className="text-sm text-muted-foreground">
                      Suite 456, Tech City, 78910
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Mon-Fri, 9am - 5pm</span>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Contact Form */}
          <FadeIn delay={0.5} direction="up">
            <Card className="max-w-4xl mx-auto bg-card text-card-foreground">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Send us a message</CardTitle>
                <CardDescription>
                We'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setSuccess(null);
                setError(null);
                const form = e.currentTarget as HTMLFormElement;
                const firstName = (form.querySelector('#first-name') as HTMLInputElement)?.value.trim();
                const lastName = (form.querySelector('#last-name') as HTMLInputElement)?.value.trim();
                const email = (form.querySelector('#email') as HTMLInputElement)?.value.trim();
                const subject = (form.querySelector('#subject') as HTMLInputElement)?.value.trim();
                const message = (form.querySelector('#message') as HTMLTextAreaElement)?.value.trim();
                const name = [firstName, lastName].filter(Boolean).join(' ');
                try {
                  const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message, category }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || 'Failed to submit');
                  setSuccess(`Thanks! Your ticket was created. Ticket ID: ${data.ticketId}`);
                  form.reset();
                } catch (err: any) {
                  setError(err.message || 'Submission failed');
                } finally {
                  setSubmitting(false);
                }
              }}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="careers">Careers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Beta Program Inquiry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    className="min-h-[150px]"
                  />
                </div>
                {success && (
                  <div className="text-sm rounded-md border border-green-200 bg-green-50 text-green-800 p-3">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="text-sm rounded-md border border-red-200 bg-red-50 text-red-800 p-3">
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full disabled:opacity-100 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-400" disabled={submitting}>
                  <Send className="mr-2 h-5 w-5" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
          </FadeIn>
        </div>
      </section>

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
