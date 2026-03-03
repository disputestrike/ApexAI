import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowRight, Bot, Mail, Megaphone, MessageSquare, Pause, Phone, Play, Plus, Share2, Trash2, Users,
} from "lucide-react";

const channelIcons: Record<string, React.ReactNode> = {
  voice: <Phone className="w-3.5 h-3.5" />,
  sms: <MessageSquare className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  social: <Share2 className="w-3.5 h-3.5" />,
};

const channelColors: Record<string, string> = {
  voice: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  sms: "text-green-400 bg-green-500/10 border-green-500/30",
  email: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  social: "text-purple-400 bg-purple-500/10 border-purple-500/30",
};

const statusColors: Record<string, string> = {
  active: "apex-badge-active",
  draft: "apex-badge-draft",
  paused: "apex-badge-paused",
  completed: "text-blue-400 bg-blue-500/10 border-blue-500/30 text-xs px-2 py-0.5 rounded-full border font-medium",
  archived: "text-gray-400 bg-gray-500/10 border-gray-500/30 text-xs px-2 py-0.5 rounded-full border font-medium",
};

const CHANNELS = ["voice", "sms", "email", "social"] as const;
const GOALS = ["appointments", "demos", "sales", "awareness", "follow_up"] as const;
const INDUSTRIES = ["Roofing", "Solar", "HVAC", "Real Estate", "Insurance", "Financial Services", "Healthcare", "Legal", "Home Services", "B2B SaaS", "Other"];

export default function Campaigns() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", description: "", goal: "appointments" as typeof GOALS[number], industry: "", dailyLimit: "50" });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.campaigns.list.useQuery({});
  const createMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => { utils.campaigns.list.invalidate(); setShowCreate(false); setSelectedChannels([]); setForm({ name: "", description: "", goal: "appointments", industry: "", dailyLimit: "50" }); toast.success("Campaign created"); },
    onError: (e) => toast.error(e.message),
  });
  const launchMutation = trpc.campaigns.launch.useMutation({ onSuccess: () => { utils.campaigns.list.invalidate(); toast.success("Campaign launched!"); } });
  const pauseMutation = trpc.campaigns.pause.useMutation({ onSuccess: () => { utils.campaigns.list.invalidate(); toast.success("Campaign paused"); } });
  const deleteMutation = trpc.campaigns.delete.useMutation({ onSuccess: () => { utils.campaigns.list.invalidate(); toast.success("Campaign deleted"); } });

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const campaigns = data?.campaigns ?? [];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} campaigns · Multi-channel outreach automation</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active", count: campaigns.filter((c) => c.status === "active").length, color: "text-green-400" },
          { label: "Draft", count: campaigns.filter((c) => c.status === "draft").length, color: "text-gray-400" },
          { label: "Paused", count: campaigns.filter((c) => c.status === "paused").length, color: "text-yellow-400" },
          { label: "Completed", count: campaigns.filter((c) => c.status === "completed").length, color: "text-blue-400" },
        ].map(({ label, count, color }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{count}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="font-semibold mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Create your first multi-channel outreach campaign</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((c) => {
            const channels: string[] = JSON.parse(c.channels ?? "[]");
            const responseRate = c.sentCount && c.sentCount > 0 ? Math.round(((c.responseCount ?? 0) / c.sentCount) * 100) : 0;
            const scheduleRate = c.responseCount && c.responseCount > 0 ? Math.round(((c.scheduledCount ?? 0) / c.responseCount) * 100) : 0;
            return (
              <Card key={c.id} className="bg-card border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <Link href={`/campaigns/${c.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">{c.name}</h3>
                          </Link>
                          {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                        </div>
                      </div>

                      {/* Channels */}
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {channels.map((ch) => (
                          <span key={ch} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${channelColors[ch] ?? ""}`}>
                            {channelIcons[ch]}
                            {ch}
                          </span>
                        ))}
                        {c.industry && <Badge variant="outline" className="text-xs">{c.industry}</Badge>}
                        <Badge variant="outline" className="text-xs capitalize">{c.goal?.replace("_", " ")}</Badge>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Contacts", value: c.totalContacts ?? 0 },
                          { label: "Sent", value: c.sentCount ?? 0 },
                          { label: "Response %", value: `${responseRate}%` },
                          { label: "Schedule %", value: `${scheduleRate}%` },
                        ].map(({ label, value }) => (
                          <div key={label} className="text-center p-2 rounded-lg bg-secondary/50">
                            <div className="text-sm font-bold">{value}</div>
                            <div className="text-[10px] text-muted-foreground">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={statusColors[c.status] ?? "apex-badge-draft"}>{c.status}</span>
                      <div className="flex gap-1.5">
                        {c.status === "draft" || c.status === "paused" ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => launchMutation.mutate({ id: c.id })}>
                            <Play className="w-3 h-3 mr-1" /> Launch
                          </Button>
                        ) : c.status === "active" ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => pauseMutation.mutate({ id: c.id })}>
                            <Pause className="w-3 h-3 mr-1" /> Pause
                          </Button>
                        ) : null}
                        <Link href={`/campaigns/${c.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate({ id: c.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign Name *</Label>
              <Input className="bg-secondary border-border" placeholder="e.g. Solar Q1 Outreach" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea className="bg-secondary border-border resize-none" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Goal</Label>
                <Select value={form.goal} onValueChange={(v) => setForm((f) => ({ ...f, goal: v as typeof GOALS[number] }))}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => <SelectItem key={g} value={g} className="capitalize">{g.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Industry</Label>
                <Select value={form.industry} onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Channels *</Label>
              <div className="grid grid-cols-2 gap-2">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${selectedChannels.includes(ch) ? `border-primary bg-primary/10 text-primary` : "border-border bg-secondary text-muted-foreground hover:border-border/80"}`}
                  >
                    {channelIcons[ch]}
                    <span className="capitalize">{ch}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Daily Contact Limit</Label>
              <Input className="bg-secondary border-border" type="number" value={form.dailyLimit} onChange={(e) => setForm((f) => ({ ...f, dailyLimit: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              disabled={!form.name || selectedChannels.length === 0 || createMutation.isPending}
              onClick={() => createMutation.mutate({ name: form.name, description: form.description || undefined, channels: selectedChannels as any, goal: form.goal, industry: form.industry || undefined, dailyLimit: parseInt(form.dailyLimit) || 50 })}
            >
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
