import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bot, Calendar, CheckCircle2, Clock, Mic, Phone, PhoneCall, PhoneOff, Sparkles, User, XCircle } from "lucide-react";
import { Streamdown } from "streamdown";

const outcomeColors: Record<string, string> = {
  scheduled: "text-green-400 bg-green-500/10 border-green-500/30",
  interested: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  callback: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  not_interested: "text-red-400 bg-red-500/10 border-red-500/30",
  voicemail: "text-gray-400 bg-gray-500/10 border-gray-500/30",
};

const sentimentIcons: Record<string, React.ReactNode> = {
  positive: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
  negative: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  neutral: <Clock className="w-3.5 h-3.5 text-gray-400" />,
};

export default function VoiceAI() {
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [script, setScript] = useState("");
  const [showScriptGen, setShowScriptGen] = useState(false);
  const [scriptForm, setScriptForm] = useState({ industry: "", goal: "", tone: "professional and friendly" });
  const [showTranscript, setShowTranscript] = useState<string | null>(null);

  const { data: leadsData } = trpc.leads.list.useQuery({ limit: 100 });
  const { data: recordings } = trpc.messages.getCallRecordings.useQuery({});
  const utils = trpc.useUtils();

  const callMutation = trpc.voiceAI.initiateCall.useMutation({
    onSuccess: (d) => {
      utils.messages.getCallRecordings.invalidate();
      toast.success(`Call completed: ${d.outcome}${d.scheduled ? " — Appointment scheduled!" : ""}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const scriptMutation = trpc.voiceAI.generateScript.useMutation({
    onSuccess: (d) => {
      setScript(d.script);
      setShowScriptGen(false);
      toast.success("Script generated");
    },
  });

  const leads = leadsData?.leads ?? [];
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const stats = {
    total: recordings?.length ?? 0,
    scheduled: recordings?.filter((r) => r.scheduledAppointment).length ?? 0,
    positive: recordings?.filter((r) => r.sentiment === "positive").length ?? 0,
    avgDuration: recordings?.length ? Math.round((recordings.reduce((a, r) => a + (r.duration ?? 0), 0) / recordings.length) / 60) : 0,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Voice AI Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">Human-sounding AI calls with conversation intelligence</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowScriptGen(true)}>
          <Sparkles className="w-4 h-4 mr-2" /> Generate Script
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: stats.total, icon: Phone, color: "text-blue-400" },
          { label: "Appointments Set", value: stats.scheduled, icon: Calendar, color: "text-green-400" },
          { label: "Positive Sentiment", value: stats.positive, icon: CheckCircle2, color: "text-orange-400" },
          { label: "Avg Duration (min)", value: stats.avgDuration, icon: Clock, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Initiate Call */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-primary" /> Initiate AI Call
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Select Lead</Label>
              <Select value={selectedLeadId?.toString() ?? ""} onValueChange={(v) => setSelectedLeadId(parseInt(v))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Choose a lead to call..." />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                      {l.firstName} {l.lastName} {l.company ? `· ${l.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLead && (
              <div className="p-3 rounded-lg bg-secondary/50 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{selectedLead.firstName[0]}{selectedLead.lastName[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedLead.firstName} {selectedLead.lastName}</p>
                    <p className="text-xs text-muted-foreground">{selectedLead.title ?? ""} {selectedLead.company ? `@ ${selectedLead.company}` : ""}</p>
                  </div>
                </div>
                {selectedLead.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{selectedLead.phone}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Call Script (optional)</Label>
              <Textarea
                className="bg-secondary border-border resize-none text-xs"
                rows={4}
                placeholder="Paste or generate a call script, or leave blank for AI to use default..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              disabled={!selectedLeadId || callMutation.isPending}
              onClick={() => callMutation.mutate({ leadId: selectedLeadId!, script: script || undefined })}
            >
              {callMutation.isPending ? (
                <>
                  <Mic className="w-4 h-4 mr-2 animate-pulse" /> AI Calling...
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4 mr-2" /> Start AI Call
                </>
              )}
            </Button>

            {callMutation.data && (
              <div className={`p-3 rounded-lg border text-sm ${callMutation.data.scheduled ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-secondary border-border text-muted-foreground"}`}>
                <div className="font-semibold mb-1">
                  {callMutation.data.scheduled ? "✓ Appointment Scheduled!" : `Outcome: ${callMutation.data.outcome}`}
                </div>
                <div className="text-xs">Duration: {Math.floor(callMutation.data.duration / 60)}m {callMutation.data.duration % 60}s</div>
                <Button variant="ghost" size="sm" className="mt-2 text-xs h-6 px-2" onClick={() => setShowTranscript(callMutation.data!.transcript)}>
                  View Transcript
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Features */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" /> AI Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Human-Sounding Voice", desc: "Natural conversation patterns with real-time adaptation to responses" },
                { title: "Objection Handling", desc: "Trained on thousands of sales calls to handle common objections" },
                { title: "Appointment Setting", desc: "Automatically schedules appointments and sends confirmations" },
                { title: "Sentiment Analysis", desc: "Real-time analysis of prospect interest and engagement level" },
                { title: "Call Recording & Transcription", desc: "Full recordings with searchable AI-generated transcripts" },
                { title: "CRM Integration", desc: "Auto-updates lead status and notes after every call" },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-3 p-3 rounded-lg bg-secondary/50">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Recordings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Call Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          {!recordings?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <PhoneOff className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No calls yet. Initiate your first AI call above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Lead #{r.leadId}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.calledAt!).toLocaleString()} · {Math.floor((r.duration ?? 0) / 60)}m {(r.duration ?? 0) % 60}s</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.sentiment && sentimentIcons[r.sentiment]}
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${outcomeColors[r.outcome ?? ""] ?? "text-gray-400 bg-gray-500/10 border-gray-500/30"}`}>{r.outcome}</span>
                    {r.transcript && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowTranscript(r.transcript!)}>
                        Transcript
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Generator Dialog */}
      <Dialog open={showScriptGen} onOpenChange={setShowScriptGen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Generate Call Script</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Input className="bg-secondary border-border" placeholder="e.g. Solar, Roofing, HVAC..." value={scriptForm.industry} onChange={(e) => setScriptForm((f) => ({ ...f, industry: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Goal</Label>
              <Input className="bg-secondary border-border" placeholder="e.g. Book a consultation, demo, appointment..." value={scriptForm.goal} onChange={(e) => setScriptForm((f) => ({ ...f, goal: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tone</Label>
              <Input className="bg-secondary border-border" value={scriptForm.tone} onChange={(e) => setScriptForm((f) => ({ ...f, tone: e.target.value }))} />
            </div>
          </div>
          <Button
            className="w-full mt-2"
            disabled={!scriptForm.industry || !scriptForm.goal || scriptMutation.isPending}
            onClick={() => scriptMutation.mutate(scriptForm)}
          >
            {scriptMutation.isPending ? "Generating..." : "Generate Script"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Transcript Dialog */}
      <Dialog open={!!showTranscript} onOpenChange={() => setShowTranscript(null)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Transcript</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {showTranscript && <Streamdown>{showTranscript}</Streamdown>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
