"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeDebugger } from "@/components/theme-debugger";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { ThemeShowcaseCard } from "@/components/theme-showcase";
import { ModeToggle } from "@/components/mode-toggle";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import {
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Home,
  Settings,
  User,
  Bell,
} from "lucide-react";
import Link from "next/link";

export default function ThemeTestPage() {
  const { theme, resolvedTheme, mounted } = useThemeUtils();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-foreground">
                Theme Test Page
              </h1>
              <Badge variant="outline">
                {mounted ? `${theme} (${resolvedTheme})` : "Loading..."}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Theme Customizer Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Theme Customizer
            </h2>
            <p className="text-muted-foreground">
              Experiment with different color presets and see how they affect
              the interface
            </p>
          </div>
          <div className="flex justify-center">
            <ThemeCustomizer />
          </div>
        </div>

        {/* Theme Showcase */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Theme Showcase
            </h2>
            <p className="text-muted-foreground">
              Comprehensive theme demonstration with all components
            </p>
          </div>
          <ThemeShowcaseCard />
        </div>

        {/* Add theme debugger for testing */}
        <ThemeDebugger show={true} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colors & Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Colors & Typography</CardTitle>
              <CardDescription>
                Testing theme color variables and text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">
                  Heading 1
                </h1>
                <h2 className="text-3xl font-semibold text-foreground">
                  Heading 2
                </h2>
                <h3 className="text-2xl font-medium text-foreground">
                  Heading 3
                </h3>
                <p className="text-base text-foreground">
                  Regular paragraph text
                </p>
                <p className="text-sm text-muted-foreground">Muted text</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">
                    Primary
                  </span>
                </div>
                <div className="h-12 bg-secondary rounded flex items-center justify-center">
                  <span className="text-secondary-foreground text-sm">
                    Secondary
                  </span>
                </div>
                <div className="h-12 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground text-sm">Accent</span>
                </div>
                <div className="h-12 bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Muted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Different button variants and states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
                <Button disabled>Disabled</Button>
                <Button size="sm">Small</Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & Status</CardTitle>
              <CardDescription>Status indicators and badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-foreground">Success message</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-foreground">Warning message</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-foreground">Error message</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-foreground">Info message</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Inputs and interactive elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background border-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-input bg-background"
                />
                <Label htmlFor="terms">I agree to the terms</Label>
              </div>
            </CardContent>
          </Card>

          {/* Navigation & Sidebar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Navigation Elements</CardTitle>
              <CardDescription>
                Testing navigation and sidebar-like components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-sidebar border border-sidebar-border rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-sidebar-accent text-sidebar-accent-foreground">
                    <Home className="h-4 w-4" />
                    <span>Active Item</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Theme Debugger - Only show in development */}
      <ThemeDebugger show={process.env.NODE_ENV === "development"} />
    </div>
  );
}
