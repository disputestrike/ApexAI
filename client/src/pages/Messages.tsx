import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, MessageSquare, Plus, Send, Share2 } from "lucide-react";

const channelIcons: Record<string, React.ReactNode> = {
  sms: <MessageSquare className="w-4 h-4 text-green-400" />,
  email: <Mail className="w-4 h-4 text-orange-400" />,
  social: <Share2 className="w-4 h-4 text-purple-400" />,
};

const statusColors: Record<string, string> = {
  sent: "text-blue-400",
  delivered: "text-green-400",
  read: "text-orange-400",
  replied: "text-purple-400",
  failed: "text-red-400",
  bounced: "text-red-400",
  queued: "text-gray-400",
};

export default function Messages() {
  const [channel, setChannel] = useState<string>("");
  const [showSend, setShowSend] = useState(false);
  const [sendForm, setSendForm] = useState({ leadId: "", channel: "sms" as "sms" | "email" | "voice" | "social", subject: "", body: "" });

  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.messages.list.useQuery({ channel: channel || undefined, limit: 50 });
  const { data: leadsData } = trpc.leads.list.useQuery({ limit: 100 });
  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => { utils.messages.list.invalidate(); setShowSend(false); setSendForm({ leadId: "", channel: "sms", subject: "", body: "" }); toast.success("Message sent"); },
    onError: (e) => toast.error(e.message),
  });

  const leads = leadsData?.leads ?? [];
  const msgs = messages ?? [];

  const stats = {
    total: msgs.length,
    delivered: msgs.filter((m) => m.status === "delivered").length,
    read: msgs.filter((m) => m.status === "read").length,
    replied: msgs.filter((m) => m.status === "replied").length,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">SMS, email, and social outreach history</p>
        </div>
        <Button size="sm" onClick={() => setShowSend(true)}>
          <Send className="w-4 h-4 mr-2" /> Send Message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: stats.total, color: "text-blue-400" },
          { label: "Delivered", value: stats.delivered, color: "text-green-400" },
          { label: "Read", value: stats.read, color: "text-orange-400" },
          { label: "Replied", value: stats.replied, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Channels</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages list */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading messages...</div>
          ) : msgs.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">No messages yet. Send your first outreach.</p>
              <Button size="sm" className="mt-4" onClick={() => setShowSend(true)}>Send Message</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Channel</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Lead</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Message</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {msgs.map((m) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {channelIcons[m.channel]}
                          <span className="text-xs capitalize">{m.channel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">Lead #{m.leadId}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{m.subject ? `${m.subject}: ` : ""}{m.body}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${statusColors[m.status ?? "pending"]}`}>{m.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {m.sentAt ? new Date(m.sentAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Dialog */}
      <Dialog open={showSend} onOpenChange={setShowSend}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Lead</Label>
              <Select value={sendForm.leadId} onValueChange={(v) => setSendForm((f) => ({ ...f, leadId: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select lead..." />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>{l.firstName} {l.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Channel</Label>
              <Select value={sendForm.channel} onValueChange={(v) => setSendForm((f) => ({ ...f, channel: v as any }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sendForm.channel === "email" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <Input className="bg-secondary border-border" value={sendForm.subject} onChange={(e) => setSendForm((f) => ({ ...f, subject: e.target.value }))} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Textarea className="bg-secondary border-border resize-none" rows={4} value={sendForm.body} onChange={(e) => setSendForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
          </div>
          <Button
            className="w-full mt-2"
            disabled={!sendForm.leadId || !sendForm.body || sendMutation.isPending}
            onClick={() => sendMutation.mutate({ leadId: parseInt(sendForm.leadId), channel: sendForm.channel, subject: sendForm.subject || undefined, body: sendForm.body })}
          >
            {sendMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
