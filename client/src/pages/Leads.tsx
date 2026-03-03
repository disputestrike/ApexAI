import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Bot, Building2, CheckCircle2, Filter, Mail, MapPin, Phone, Plus, Search, Shield, Star, Trash2, Upload, User, XCircle,
} from "lucide-react";

const segmentBadge = (s: string) => {
  const map: Record<string, string> = { hot: "apex-badge-hot", warm: "apex-badge-warm", cold: "apex-badge-cold", unqualified: "apex-badge-unverified" };
  return map[s] ?? "apex-badge-unverified";
};

const verifyBadge = (s: string) => {
  const map: Record<string, string> = { verified: "apex-badge-verified", unverified: "apex-badge-unverified", bounced: "text-red-400 bg-red-500/10 border-red-500/30 text-xs px-2 py-0.5 rounded-full border font-medium", pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30 text-xs px-2 py-0.5 rounded-full border font-medium" };
  return map[s] ?? "apex-badge-unverified";
};

export default function Leads() {
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [segment, setSegment] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", industry: "", title: "", linkedinUrl: "", notes: "" });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.leads.list.useQuery({ search: search || undefined, segment: segment || undefined, status: status || undefined, limit: 50 });
  const createMutation = trpc.leads.create.useMutation({ onSuccess: () => { utils.leads.list.invalidate(); setShowCreate(false); setForm({ firstName: "", lastName: "", email: "", phone: "", company: "", industry: "", title: "", linkedinUrl: "", notes: "" }); toast.success("Lead created"); } });
  const deleteMutation = trpc.leads.delete.useMutation({ onSuccess: () => { utils.leads.list.invalidate(); toast.success("Lead deleted"); } });
  const verifyMutation = trpc.leads.verify.useMutation({ onSuccess: (d) => { utils.leads.list.invalidate(); toast.success(`Verification: ${d.status}`); } });
  const aiSearchMutation = trpc.leads.aiSearch.useMutation({
    onSuccess: (d) => {
      toast.success(`AI found ${d.leads.length} leads`);
    },
  });

  const handleAiSearch = () => {
    if (!aiQuery.trim()) return;
    aiSearchMutation.mutate({ query: aiQuery });
  };

  const displayLeads = aiSearchMutation.data?.leads ?? data?.leads ?? [];
  const total = aiSearchMutation.data?.total ?? data?.total ?? 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total leads · AI-powered search and verification</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Import CSV — feature coming soon")}>
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      {/* AI Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                className="pl-9 bg-secondary border-border"
                placeholder='Ask in plain English: "Show me hot leads in solar industry with verified emails"'
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
              />
            </div>
            <Button onClick={handleAiSearch} disabled={aiSearchMutation.isPending} className="px-5">
              {aiSearchMutation.isPending ? "Searching..." : "AI Search"}
            </Button>
            {aiSearchMutation.data && (
              <Button variant="outline" size="sm" onClick={() => aiSearchMutation.reset()}>Clear</Button>
            )}
          </div>
          {aiSearchMutation.data?.filters && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {Object.entries(aiSearchMutation.data.filters).filter(([, v]) => v).map(([k, v]) => (
                <Badge key={k} variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">{k}: {v as string}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 bg-secondary border-border" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={segment} onValueChange={setSegment}>
          <SelectTrigger className="w-36 bg-secondary border-border">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Segments</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36 bg-secondary border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading leads...</div>
          ) : displayLeads.length === 0 ? (
            <div className="py-12 text-center">
              <User className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No leads found. Add your first lead to get started.</p>
              <Button size="sm" className="mt-4" onClick={() => setShowCreate(true)}>Add Lead</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Company</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Contact</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Score</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Segment</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Verified</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary">{lead.firstName[0]}{lead.lastName[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                            {lead.title && <p className="text-xs text-muted-foreground">{lead.title}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{lead.company ?? "—"}</span>
                        </div>
                        {lead.industry && <p className="text-xs text-muted-foreground mt-0.5">{lead.industry}</p>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="space-y-0.5">
                          {lead.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{lead.email}</div>}
                          {lead.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{lead.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${lead.score ?? 0}%` }} />
                          </div>
                          <span className="text-xs font-medium">{lead.score ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={segmentBadge(lead.segment ?? "cold")}>{lead.segment ?? "cold"}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={verifyBadge(lead.verificationStatus ?? "unverified")}>{lead.verificationStatus ?? "unverified"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" onClick={() => verifyMutation.mutate({ id: lead.id })} title="Verify">
                            <Shield className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate({ id: lead.id })} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Lead Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input className="bg-secondary border-border" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name *</Label>
              <Input className="bg-secondary border-border" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input className="bg-secondary border-border" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input className="bg-secondary border-border" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input className="bg-secondary border-border" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Input className="bg-secondary border-border" value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input className="bg-secondary border-border" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">LinkedIn URL</Label>
              <Input className="bg-secondary border-border" value={form.linkedinUrl} onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Input className="bg-secondary border-border" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={!form.firstName || !form.lastName || createMutation.isPending} onClick={() => createMutation.mutate({ ...form, email: form.email || undefined, phone: form.phone || undefined, company: form.company || undefined, industry: form.industry || undefined, title: form.title || undefined, linkedinUrl: form.linkedinUrl || undefined, notes: form.notes || undefined })}>
              {createMutation.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
