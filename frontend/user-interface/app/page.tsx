import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Zap, Shield, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">AI Support</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Support
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Support tickets that <span className="text-primary">work smarter</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            Empower your support team with AI-powered categorization, intelligent tagging, and instant response suggestions. Resolve tickets faster than ever.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-base">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3 bg-card hover:bg-card/80 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Auto-Categorization</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI automatically categorizes tickets for faster routing and resolution.
            </p>
          </Card>
          
          <Card className="p-6 space-y-3 bg-card hover:bg-card/80 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-lg">Smart Tagging</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Intelligent tags help you find and organize tickets effortlessly.
            </p>
          </Card>
          
          <Card className="p-6 space-y-3 bg-card hover:bg-card/80 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[color:var(--success)]" />
            </div>
            <h3 className="font-semibold text-lg">Suggested Replies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get AI-powered response suggestions you can use or customize.
            </p>
          </Card>
          
          <Card className="p-6 space-y-3 bg-card hover:bg-card/80 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[color:var(--warning)]" />
            </div>
            <h3 className="font-semibold text-lg">Real-Time Updates</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stay informed with instant status updates and notifications.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 AI Support. Powered by AI to deliver exceptional support.
          </p>
        </div>
      </footer>
    </div>
  )
}
