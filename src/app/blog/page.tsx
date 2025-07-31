'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Calendar, User, Search, ArrowRight, Clock, Tag, Star } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const blogPosts = [
    {
      title: "How AI is Revolutionizing Content Revenue Models",
      excerpt: "The shift from ad-based revenue to AI licensing: How ChatGPT and Perplexity are changing the way publishers monetize content.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "8 min read",
      tags: ["AI", "Revenue Models", "Content Licensing"],
      featured: true
    },
    {
      title: "From Blog Readers to AI Models: The New Attention Economy",
      excerpt: "Understanding how AI assistants are becoming the primary consumers of content and what it means for publisher revenue streams.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "6 min read",
      tags: ["AI", "Attention Economy", "Publishing"],
      featured: false
    },
    {
      title: "Cloudflare's HTTP 402: Building the Payment Layer for AI Content",
      excerpt: "How Cloudflare's Pay-Per-Crawl initiative is creating the infrastructure for the future of content monetization.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "7 min read",
      tags: ["Cloudflare", "HTTP 402", "AI Payments"],
      featured: false
    },
    {
      title: "The Decline of Ad Revenue: Why AI Licensing is the Future",
      excerpt: "As users shift from traditional browsing to AI queries, publishers need new monetization strategies beyond display advertising.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "9 min read",
      tags: ["Ad Revenue", "AI Licensing", "Publishing Strategy"],
      featured: false
    },
    {
      title: "ChatGPT vs. Google: How AI Search is Changing Content Discovery",
      excerpt: "The fundamental shift in how users find and consume information, and what it means for content creators and publishers.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "10 min read",
      tags: ["ChatGPT", "AI Search", "Content Discovery"],
      featured: false
    },
    {
      title: "Building Sustainable Revenue in the Age of AI",
      excerpt: "Practical strategies for WordPress publishers to thrive as AI becomes the primary interface for information consumption.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "7 min read",
      tags: ["WordPress", "AI Strategy", "Revenue"],
      featured: false
    },
    {
      title: "The Ethics of AI Content Licensing: Fair Compensation for Creators",
      excerpt: "Exploring the moral imperative of ensuring content creators are compensated when AI models use their work.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "8 min read",
      tags: ["AI Ethics", "Content Rights", "Fair Compensation"],
      featured: false
    },
    {
      title: "Perplexity, Claude, and the Rise of AI Research Assistants",
      excerpt: "How AI research tools are changing academic and professional research, creating new opportunities for specialized content.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "6 min read",
      tags: ["Perplexity", "Claude", "AI Research"],
      featured: false
    },
    {
      title: "Preparing Your WordPress Site for the AI Content Economy",
      excerpt: "Technical and strategic preparations WordPress publishers need to make to capitalize on the AI content licensing revolution.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "5 min read",
      tags: ["WordPress", "AI Preparation", "Technical Guide"],
      featured: false
    }
  ]

  const categories = [
    { name: "AI & Machine Learning", count: 15 },
    { name: "Revenue Models", count: 12 },
    { name: "Content Strategy", count: 10 },
    { name: "WordPress", count: 8 },
    { name: "Cloudflare & Infrastructure", count: 6 },
    { name: "AI Ethics", count: 4 }
  ]

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
              <Link href="/blog" className="text-blue-600 font-medium">Blog</Link>
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
              Resources & Blog • 100% Revenue Share
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Insights for WordPress
              <span className="text-blue-200"> Content Creators</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Exclusive insights for our invite-only beta participants on AI monetization, 
              WordPress optimization, and content licensing strategies.
            </p>
            <div className="relative max-w-md mx-auto">
              <Input 
                placeholder="Search articles..." 
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 lg:p-12">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">Featured Article</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                  How AI is Revolutionizing Content Revenue Models
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  The shift from ad-based revenue to AI licensing: How ChatGPT and Perplexity are changing the way publishers monetize content. 
                  Discover why traditional advertising is declining and what the future holds for content creators.
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Md Imad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>July 31, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>8 min read</span>
                  </div>
                </div>
                <Button size="lg">
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What you'll learn:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-600">The decline of traditional ad revenue models</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-600">How AI assistants consume content differently</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-600">New revenue opportunities in AI licensing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-600">Preparing your content strategy for the AI era</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Latest Articles</h2>
                <div className="space-y-8">
                  {blogPosts.filter(post => !post.featured).map((post, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          {post.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="text-xl hover:text-blue-600 transition-colors cursor-pointer">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-slate-600" />
                          <span className="text-sm text-slate-700">{category.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Stay Updated</CardTitle>
                  <CardDescription>
                    Get the latest insights on AI monetization delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input placeholder="Enter your email" />
                    <Button className="w-full">
                      Subscribe
                    </Button>
                    <p className="text-xs text-slate-600 text-center">
                      Join 10,000+ WordPress publishers
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["AI", "Revenue Models", "Content Licensing", "ChatGPT", "Perplexity", "Cloudflare", "HTTP 402", "WordPress", "AI Ethics", "Content Strategy"].map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm text-slate-700 hover:text-blue-600 cursor-pointer">
                        Plugin Documentation
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm text-slate-700 hover:text-blue-600 cursor-pointer">
                        API Reference
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm text-slate-700 hover:text-blue-600 cursor-pointer">
                        Video Tutorials
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm text-slate-700 hover:text-blue-600 cursor-pointer">
                        Community Forum
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ready to Start Monetizing?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of WordPress publishers already earning with PayPerCrawl
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View All Resources
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