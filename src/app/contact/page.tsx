'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Phone, MapPin, Clock, Send, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
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
              Contact Us • 100% Revenue Share
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Apply for Exclusive
              <span className="text-blue-200"> Beta Access</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our exclusive invite-only program and get 100% revenue share. 
              Limited spots available for selected WordPress publishers.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <Mail className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <CardTitle>Email Us</CardTitle>
                <CardDescription>
                  Get in touch with our team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">support@crawlguard.com</p>
                  <p className="text-sm text-slate-600">Technical support & plugin help</p>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="font-medium">sales@crawlguard.com</p>
                  <p className="text-sm text-slate-600">Sales inquiries & partnerships</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-green-600 mb-4 mx-auto" />
                <CardTitle>Call Us</CardTitle>
                <CardDescription>
                  Speak with our team directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">+1 (555) 123-4567</p>
                  <p className="text-sm text-slate-600">Business & Enterprise customers</p>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="font-medium">+1 (555) 987-6543</p>
                  <p className="text-sm text-slate-600">Technical support line</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-600 mb-4 mx-auto" />
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>
                  When we're available to help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span>Closed</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    24/7 support available for Business & Enterprise plans
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Forms */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* General Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={4} placeholder="Tell us more about your inquiry..." />
                </div>
                <Button className="w-full" size="lg">
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Contact Options */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Help</CardTitle>
                  <CardDescription>
                    Get answers to common questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Plugin Documentation</h4>
                      <p className="text-sm text-slate-600">Setup guides and API reference</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Docs
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Community Forum</h4>
                      <p className="text-sm text-slate-600">Connect with other users</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Join Forum
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Video Tutorials</h4>
                      <p className="text-sm text-slate-600">Step-by-step guides</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Watch Videos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Sales Inquiries</CardTitle>
                  <CardDescription>
                    Interested in our Business or Enterprise plans?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-slate-600">
                      Our sales team is ready to help you find the perfect solution for your needs. 
                      Schedule a demo to see PayPerCrawl in action.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        Schedule a Demo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full">
                        Request Pricing
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Visit Our Office
            </h2>
            <p className="text-xl text-slate-600">
              Stop by for a cup of coffee and a conversation about the future of content monetization
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Headquarters</CardTitle>
                <CardDescription>
                  Our main office and team hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="font-semibold">San Francisco, CA</p>
                  <p className="text-slate-600">
                    1234 Market Street<br />
                    Suite 500<br />
                    San Francisco, CA 94103
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Open Monday - Friday, 9 AM - 6 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <MapPin className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>European Office</CardTitle>
                <CardDescription>
                  Serving our European customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="font-semibold">London, UK</p>
                  <p className="text-slate-600">
                    1 Tottenham Court Road<br />
                    Floor 8<br />
                    London W1T 7AA, UK
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Open Monday - Friday, 9 AM - 5 PM GMT</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Response Time承诺 */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Our Response Time Commitment
              </h2>
              <p className="text-lg text-slate-600">
                We pride ourselves on providing exceptional support to all our customers
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt; 1 Hour</div>
                <div className="font-semibold mb-1">Critical Issues</div>
                <div className="text-sm text-slate-600">Business & Enterprise plans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 4 Hours</div>
                <div className="font-semibold mb-1">Technical Support</div>
                <div className="text-sm text-slate-600">All paid plans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">&lt; 24 Hours</div>
                <div className="font-semibold mb-1">General Inquiries</div>
                <div className="text-sm text-slate-600">All customers</div>
              </div>
            </div>
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
            Have questions? Our team is here to help you every step of the way
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Contact Sales
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