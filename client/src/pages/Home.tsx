import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Share2,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const features = [
  { icon: Phone, title: "Voice AI Calls", desc: "Human-sounding AI that books appointments on autopilot across any industry." },
  { icon: MessageSquare, title: "SMS Outreach", desc: "Personalized SMS campaigns with intelligent follow-up sequences." },
  { icon: Mail, title: "Email Automation", desc: "Multi-step email sequences with dynamic personalization at scale." },
  { icon: Share2, title: "Social Outreach", desc: "Automated LinkedIn and social media engagement with verified contacts." },
  { icon: Users, title: "Lead Intelligence", desc: "Plain English search, lead scoring, segmentation, and verification." },
  { icon: TrendingUp, title: "Real-Time Analytics", desc: "Live dashboards tracking response rate, show rate, and ROI." },
];

const competitors = [
  { from: "Premura", what: "Vertical case studies with names" },
  { from: "LiveHuman", what: "Voice AI + closers-only model" },
  { from: "B2B Rocket", what: "Multichannel + lead database" },
  { from: "ListKit", what: "Plain English lead search + verification" },
  { from: "WooSender", what: "4 metric proof + industry testimonials" },
  { from: "WooSender", what: "Done-for-you + 30-day onboarding" },
];

const staticTestimonials = [
  { name: "Moises R.", industry: "Roofing", result: "200+ appointments, 160 contracts, $2M in two weeks", before: "Manual cold calling, 5% response rate", after: "AI-driven outreach, 47% response rate" },
  { name: "Sarah K.", industry: "Solar", result: "312 qualified leads in 30 days, $890K pipeline", before: "3 SDRs, 40 calls/day", after: "AI handles 500+ touchpoints daily" },
  { name: "Marcus T.", industry: "HVAC", result: "89 booked appointments, $240K closed in 6 weeks", before: "Struggling to fill calendar", after: "Calendar fully booked 3 weeks out" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: testimonials } = trpc.testimonials.list.useQuery({ featuredOnly: false });

  const displayTestimonials = testimonials && testimonials.length > 0
    ? testimonials.slice(0, 3)
    : staticTestimonials;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">ApexAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#proof" className="hover:text-foreground transition-colors">Results</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Case Studies</a>
            <a href="#onboarding" className="hover:text-foreground transition-colors">Onboarding</a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 text-xs font-medium">
            <Zap className="w-3 h-3 mr-1.5" />
            AI-Powered Outbound Engine
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Stop Chasing Leads.
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Start Closing Deals.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered outbound calling, SMS, email, and social outreach that books appointments on autopilot — for any industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-8 h-12" onClick={() => (window.location.href = isAuthenticated ? "/dashboard" : getLoginUrl())}>
              Launch Your Campaign
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => { import('sonner').then(m => m.toast.info('Demo video coming soon!')); }}>
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Expert setup day one · 30-day dedicated support · No Zapier needed
          </p>
        </div>
      </section>

      {/* 4 Metrics */}
      <section id="proof" className="py-16 px-6 border-y border-border bg-card/30">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-10 uppercase tracking-widest font-medium">Platform Performance Metrics</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Avg Response Rate", value: "47%", color: "text-blue-400", desc: "vs 5% industry avg" },
              { label: "Avg Schedule Rate", value: "68%", color: "text-green-400", desc: "of all responses" },
              { label: "Avg Show Rate", value: "82%", color: "text-orange-400", desc: "appointment attendance" },
              { label: "Avg Increase In Sales", value: "312%", color: "text-purple-400", desc: "within 90 days" },
            ].map((m) => (
              <div key={m.label} className="text-center p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className={`text-4xl font-black ${m.color} mb-2`}>{m.value}</div>
                <div className="text-sm font-semibold text-foreground mb-1">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive advantage */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">WooSender connects 100+ tools.</h2>
          <p className="text-4xl font-black text-primary mb-12">ApexAI replaces them all.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((c) => (
              <div key={c.what} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border text-left">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">From {c.from}</p>
                  <p className="text-sm font-medium">{c.what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-card/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything in One Native Platform</h2>
            <p className="text-muted-foreground">No integrations. No Zapier. No outside tools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Real Results, Real Industries</h2>
            <p className="text-muted-foreground">Every result follows the same pattern: specific numbers, before and after.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayTestimonials.map((t: any, i: number) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="font-bold text-primary text-lg mb-3">
                  {t.resultValue ?? t.result}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="text-red-400 font-medium">Before: </span>
                    {t.beforeMetric ?? t.before}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-400 font-medium">After: </span>
                    {t.afterMetric ?? t.after}
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-semibold">{t.clientName ?? t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.industry}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section id="onboarding" className="py-16 px-6 bg-card/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Not Just Software. A Done-For-You System.</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            A dedicated specialist sets up your entire system on day one, optimizes it for 30 days, and makes it perform.
            That's the difference between a $97/month tool and a $3,000/month service.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { day: "Day 1", title: "Expert Setup", desc: "Dedicated specialist configures your campaigns, templates, and targeting from scratch." },
              { day: "Days 2–14", title: "Sales Optimization", desc: "We analyze early data, refine messaging, and optimize your conversion funnel." },
              { day: "Days 15–30", title: "Scale & Handoff", desc: "Full system running at peak performance with complete documentation and training." },
            ].map((step) => (
              <div key={step.day} className="p-6 rounded-xl bg-card border border-border text-left">
                <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">{step.day}</Badge>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/20">
            <h2 className="text-4xl font-black mb-4">Ready to Close More Deals?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join businesses using ApexAI to automate outreach and fill their calendars.
            </p>
            <Button size="lg" className="text-base px-10 h-12" onClick={() => (window.location.href = isAuthenticated ? "/dashboard" : getLoginUrl())}>
              Start Your Campaign Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">ApexAI</span>
            <span className="text-muted-foreground text-xs ml-2">by CrucibAI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 ApexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
