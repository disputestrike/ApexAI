import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit2, FileText, Mail, MessageSquare, Phone, Plus, Share2, Sparkles, Trash2 } from "lucide-react";

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

export default function Templates() {
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [form, setForm] = useState({ name: "", channel: "sms" as "voice" | "sms" | "email" | "social", subject: "", body: "", industry: "", goal: "", variables: "" });
  const [aiPrompt, setAiPrompt] = useState("");

  const utils = trpc.useUtils();
  const { data: templates, isLoading } = trpc.templates.list.useQuery({});
  const createMutation = trpc.templates.create.useMutation({
    onSuccess: () => { utils.templates.list.invalidate(); setShowCreate(false); resetForm(); toast.success("Template created"); },
  });
  const updateMutation = trpc.templates.update.useMutation({
    onSuccess: () => { utils.templates.list.invalidate(); setEditTemplate(null); toast.success("Template updated"); },
  });
  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => { utils.templates.list.invalidate(); toast.success("Template deleted"); },
  });
  const aiMutation = trpc.templates.generateWithAI.useMutation({
    onSuccess: (d) => { setForm((f) => ({ ...f, body: d.content ?? "" })); toast.success("AI template generated"); },
  });

  const resetForm = () => setForm({ name: "", channel: "sms", subject: "", body: "", industry: "", goal: "", variables: "" });

  const openEdit = (t: any) => {
    setEditTemplate(t);
    setForm({ name: t.name, channel: t.channel, subject: t.subject ?? "", body: t.body, industry: "", goal: "", variables: (JSON.parse(t.variables ?? "[]") as string[]).join(", ") });
  };

  const handleSave = () => {
    const vars = form.variables.split(",").map((v) => v.trim()).filter(Boolean);
    const payload = { name: form.name, channel: form.channel, subject: form.subject || undefined, body: form.body, variables: vars };
    if (editTemplate) {
      updateMutation.mutate({ id: editTemplate.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const allTemplates = templates ?? [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">{allTemplates.length} templates · Personalized outreach scripts</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
      ) : allTemplates.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="font-semibold mb-2">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Create reusable message templates for all your outreach channels</p>
            <Button onClick={() => { resetForm(); setShowCreate(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allTemplates.map((t) => {
            const vars: string[] = JSON.parse(t.variables ?? "[]");
            return (
              <Card key={t.id} className="bg-card border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{t.name}</h3>
    
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${channelColors[t.channel]}`}>
                        {channelIcons[t.channel]} {t.channel}
                      </span>
                    </div>
                  </div>
                  {t.subject && <p className="text-xs font-medium text-muted-foreground mb-1">Subject: {t.subject}</p>}
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{t.body}</p>
                  {vars.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {vars.map((v) => (
                        <Badge key={v} variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">{`{{${v}}}`}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(t)}>
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate({ id: t.id })}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate || !!editTemplate} onOpenChange={(o) => { if (!o) { setShowCreate(false); setEditTemplate(null); } }}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* AI Generator */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-xs font-medium text-primary flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> AI Template Generator</p>
              <div className="flex gap-2">
                <Input className="bg-secondary border-border text-xs" placeholder='e.g. "Solar roofing SMS for homeowners"' value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
                  <Button size="sm" variant="outline" disabled={!aiPrompt || aiMutation.isPending} onClick={() => aiMutation.mutate({ channel: form.channel, industry: form.industry || aiPrompt, goal: form.goal || aiPrompt })}>
                  {aiMutation.isPending ? "..." : "Generate"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input className="bg-secondary border-border" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Channel</Label>
                <Select value={form.channel} onValueChange={(v) => setForm((f) => ({ ...f, channel: v as any }))}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Input className="bg-secondary border-border" placeholder="e.g. Solar, Roofing..." value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
            </div>
            {form.channel === "email" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <Input className="bg-secondary border-border" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Body *</Label>
              <Textarea className="bg-secondary border-border resize-none" rows={5} placeholder="Use {{firstName}}, {{company}}, {{industry}} for personalization..." value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Variables (comma-separated)</Label>
              <Input className="bg-secondary border-border" placeholder="firstName, company, industry" value={form.variables} onChange={(e) => setForm((f) => ({ ...f, variables: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditTemplate(null); }}>Cancel</Button>
            <Button disabled={!form.name || !form.body || createMutation.isPending || updateMutation.isPending} onClick={handleSave}>
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
