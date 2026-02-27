"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Shield,
  Calendar,
  User,
  Search,
  ArrowRight,
  Clock,
  Tag,
  Star,
  Twitter,
  Github,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Navigation } from "@/components/ui/navigation";
import { FadeIn } from "@/components/ui/fade-in";

export default function BlogPage() {

  const blogPosts = [
    {
      id: "ai-revolutionizing-content-revenue",
      title: "How AI is Revolutionizing Content Revenue Models",
      excerpt:
        "The shift from ad-based revenue to AI licensing: How ChatGPT and Perplexity are changing the way publishers monetize content.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "8 min read",
      tags: ["AI", "Revenue Models", "Content Licensing"],
      featured: true,
    },
    {
      id: "blog-readers-to-ai-models",
      title: "From Blog Readers to AI Models: The New Attention Economy",
      excerpt:
        "Understanding how AI assistants are becoming the primary consumers of content and what it means for publisher revenue streams.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "6 min read",
      tags: ["AI", "Attention Economy", "Publishing"],
      featured: false,
    },
    {
      id: "cloudflare-http-402-payment-layer",
      title: "Cloudflare's HTTP 402: Building the Payment Layer for AI Content",
      excerpt:
        "How Cloudflare's Pay-Per-Crawl initiative is creating the infrastructure for the future of content monetization.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "7 min read",
      tags: ["Cloudflare", "HTTP 402", "AI Payments"],
      featured: false,
    },
    {
      id: "decline-ad-revenue-ai-licensing",
      title: "The Decline of Ad Revenue: Why AI Licensing is the Future",
      excerpt:
        "As users shift from traditional browsing to AI queries, publishers need new monetization strategies beyond display advertising.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "9 min read",
      tags: ["Ad Revenue", "AI Licensing", "Publishing Strategy"],
      featured: false,
    },
    {
      id: "chatgpt-vs-google-ai-search",
      title: "ChatGPT vs. Google: How AI Search is Changing Content Discovery",
      excerpt:
        "The fundamental shift in how users find and consume information, and what it means for content creators and publishers.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "10 min read",
      tags: ["ChatGPT", "AI Search", "Content Discovery"],
      featured: false,
    },
    {
      id: "building-sustainable-revenue-ai",
      title: "Building Sustainable Revenue in the Age of AI",
      excerpt:
        "Practical strategies for WordPress publishers to thrive as AI becomes the primary interface for information consumption.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "7 min read",
      tags: ["WordPress", "AI Strategy", "Revenue"],
      featured: false,
    },
    {
      id: "ethics-ai-content-licensing",
      title:
        "The Ethics of AI Content Licensing: Fair Compensation for Creators",
      excerpt:
        "Exploring the moral imperative of ensuring content creators are compensated when AI models use their work.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "8 min read",
      tags: ["AI Ethics", "Content Rights", "Fair Compensation"],
      featured: false,
    },
    {
      id: "perplexity-claude-ai-research",
      title: "Perplexity, Claude, and the Rise of AI Research Assistants",
      excerpt:
        "How AI research tools are changing academic and professional research, creating new opportunities for specialized content.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "6 min read",
      tags: ["Perplexity", "Claude", "AI Research"],
      featured: false,
    },
    {
      id: "wordpress-ai-content-economy",
      title: "Preparing Your WordPress Site for the AI Content Economy",
      excerpt:
        "Technical and strategic preparations WordPress publishers need to make to capitalize on the AI content licensing revolution.",
      author: "Md Imad",
      date: "July 31, 2025",
      readTime: "5 min read",
      tags: ["WordPress", "AI Preparation", "Technical Guide"],
      featured: false,
    },
  ];

  const categories = [
    { name: "AI & Machine Learning", count: 15 },
    { name: "Revenue Models", count: 12 },
    { name: "Content Strategy", count: 10 },
    { name: "WordPress", count: 8 },
    { name: "Cloudflare & Infrastructure", count: 6 },
    { name: "AI Ethics", count: 4 },
  ];

  // Imported posts from DB
  const [importedPosts, setImportedPosts] = useState<
    { slug: string; title: string; author: string | null; publishedAt: string | null; tags: string[] }[]
  >([]);
  const [importedLoading, setImportedLoading] = useState(false);
  const [importedError, setImportedError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setImportedLoading(true);
        const res = await fetch("/api/blogs?limit=24", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load imported posts");
        setImportedPosts(data.posts || []);
      } catch (e: any) {
        setImportedError(e.message);
      } finally {
        setImportedLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <FadeIn delay={0.1} direction="up">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Badge variant="secondary" className="relative z-10 px-4 py-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></span>
                    BETA PROGRAM
                  </span>
                  Resources & Blog • 100% Revenue Share
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
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Insights for WordPress
                <span className="text-primary-foreground/80">
                  {" "}
                Content Creators
              </span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Exclusive insights for our invite-only beta participants on AI
              monetization, WordPress optimization, and content licensing
              strategies.
            </p>
            <div className="relative max-w-md mx-auto">
              <Input
                placeholder="Search articles..."
                className="bg-primary/50 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/70"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-foreground/70" />
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.2} direction="up">
            <div className="bg-secondary rounded-2xl p-8 lg:p-12">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Featured Article
                </span>
              </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  How AI is Revolutionizing Content Revenue Models
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  The shift from ad-based revenue to AI licensing: How ChatGPT
                  and Perplexity are changing the way publishers monetize
                  content. Discover why traditional advertising is declining and
                  what the future holds for content creators.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
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
                <Link href={`/blog/${blogPosts[0].id}`}>
                  <Button size="lg">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg shadow-lg aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Featured Article
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Imported Posts (from external source via Admin → Fetch) */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.3} direction="up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Imported Posts</h2>
              <Link href="/admin/fetch-blog" className="text-sm text-primary underline">Import new</Link>
            </div>
            {importedLoading && <p>Loading posts…</p>}
            {importedError && <p className="text-red-500">{importedError}</p>}
            {!importedLoading && !importedError && importedPosts.length === 0 && (
              <p className="text-muted-foreground">No imported posts yet. Use Admin → Fetch Blog to add one.</p>
            )}
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {importedPosts.map((post, index) => (
              <FadeIn key={post.slug} delay={0.4 + index * 0.1} direction="up">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    {(post.tags || []).slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </Link>
                  {/* No excerpt for imported posts */}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{post.author || "Imported"}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm">Read More</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Blog Posts */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.slice(1).map((post, index) => (
                  <FadeIn key={post.id} delay={0.2 + index * 0.1} direction="up">
                  <Card
                    className="shadow-lg hover:shadow-xl transition-shadow dark:bg-card h-full"
                  >
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription>{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                        <Link
                          href={`/blog/${post.id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          Read more
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                  </FadeIn>
                ))}
              </div>
              <FadeIn delay={0.5} direction="up">
                <div className="mt-12 text-center">
                  <Button variant="outline">Load More Articles</Button>
                </div>
              </FadeIn>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              <FadeIn delay={0.3} direction="up">
                <Card className="dark:bg-card">
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {categories.map((category) => (
                        <li
                          key={category.name}
                          className="flex justify-between items-center text-sm"
                        >
                          <Link
                            href="#"
                            className="text-muted-foreground hover:text-primary"
                          >
                            {category.name}
                          </Link>
                          <Badge variant="secondary">{category.count}</Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </FadeIn>
              <FadeIn delay={0.4} direction="up">
                <Card className="dark:bg-card">
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                  {blogPosts
                    .flatMap((p) => p.tags)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .slice(0, 10)
                    .map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>
              <FadeIn delay={0.5} direction="up">
                <Card className="bg-primary text-primary-foreground text-center p-6">
                  <CardHeader>
                    <CardTitle>Join the Beta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Get exclusive access and help shape the future of content
                      monetization.
                    </p>
                    <Button variant="secondary" className="w-full">
                      Request Invite
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
            </aside>
          </div>
        </div>
      </main>

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
