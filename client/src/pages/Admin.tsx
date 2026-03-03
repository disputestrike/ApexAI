import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Activity, AlertTriangle, BarChart3, Database, Settings, Shield, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("users");

  // Redirect non-admins
  if (user && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const { data: users } = trpc.admin.users.useQuery();
  const { data: stats } = trpc.admin.systemStats.useQuery();
  const { data: logs } = trpc.admin.activityLogs.useQuery({ limit: 50 });
  const { data: campaigns } = trpc.campaigns.list.useQuery({});

  const promoteUserMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("User role updated"); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">User management, campaign oversight, and system configuration</p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Campaigns", value: stats?.totalCampaigns ?? 0, icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Total Leads", value: stats?.totalLeads ?? 0, icon: Database, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Admin Users", value: stats?.adminUsers ?? 0, icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="config">System Config</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["User", "Email", "Login Method", "Role", "Joined", "Actions"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(users ?? []).map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                            </div>
                            <span className="font-medium">{u.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{u.email ?? "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground capitalize">{u.loginMethod ?? "—"}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-xs capitalize ${u.role === "admin" ? "text-red-400 border-red-500/30 bg-red-500/5" : "text-muted-foreground"}`}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">
                          {u.id !== user?.id && (
                            <Select
                              value={u.role}
                              onValueChange={(role) => promoteUserMutation.mutate({ userId: u.id, role: role as "admin" | "user" })}
                            >
                              <SelectTrigger className="h-7 w-24 bg-secondary border-border text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!users?.length && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No users found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Campaign Oversight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Campaign", "Channels", "Status", "Contacts", "Sent", "Responses", "Response %"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(campaigns?.campaigns ?? []).map((c) => {
                      const responseRate = c.sentCount ? Math.round(((c.responseCount ?? 0) / c.sentCount) * 100) : 0;
                      const channels: string[] = JSON.parse(c.channels ?? "[]");
                      return (
                        <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="px-3 py-2 font-medium">{c.name}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              {channels.map((ch) => (
                                <Badge key={ch} variant="outline" className="text-[10px] capitalize">{ch}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className={`text-xs capitalize ${c.status === "active" ? "text-green-400 border-green-500/30" : c.status === "paused" ? "text-orange-400 border-orange-500/30" : "text-muted-foreground"}`}>
                              {c.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{c.totalContacts ?? 0}</td>
                          <td className="px-3 py-2 text-muted-foreground">{c.sentCount ?? 0}</td>
                          <td className="px-3 py-2 text-muted-foreground">{c.responseCount ?? 0}</td>
                          <td className="px-3 py-2">
                            <span className={`font-medium ${responseRate >= 30 ? "text-green-400" : responseRate >= 15 ? "text-orange-400" : "text-red-400"}`}>{responseRate}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!campaigns?.campaigns?.length && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No campaigns found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {(logs ?? []).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium capitalize">{log.action} {log.entityType}</p>
                      {log.description && <p className="text-xs text-muted-foreground truncate">{log.description}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
                {!logs?.length && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No activity logs</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Config Tab */}
        <TabsContent value="config" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "AI Voice Settings",
                icon: Settings,
                items: [
                  { label: "Voice Model", value: "Neural TTS v3" },
                  { label: "Default Language", value: "English (US)" },
                  { label: "Call Recording", value: "Enabled" },
                  { label: "Max Concurrent Calls", value: "50" },
                ],
              },
              {
                title: "Outreach Limits",
                icon: AlertTriangle,
                items: [
                  { label: "Daily SMS Limit", value: "500/user" },
                  { label: "Daily Email Limit", value: "1,000/user" },
                  { label: "Daily Call Limit", value: "200/user" },
                  { label: "Rate Limiting", value: "Active" },
                ],
              },
              {
                title: "Integrations",
                icon: Database,
                items: [
                  { label: "Twilio (Voice/SMS)", value: "Connected" },
                  { label: "SendGrid (Email)", value: "Connected" },
                  { label: "LinkedIn API", value: "Pending" },
                  { label: "CRM Webhook", value: "Not configured" },
                ],
              },
              {
                title: "Security",
                icon: Shield,
                items: [
                  { label: "OAuth Provider", value: "Manus Auth" },
                  { label: "Session Timeout", value: "24 hours" },
                  { label: "2FA", value: "Optional" },
                  { label: "Data Encryption", value: "AES-256" },
                ],
              },
            ].map(({ title, icon: Icon, items }) => (
              <Card key={title} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" /> {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={`font-medium text-xs ${value === "Connected" || value === "Enabled" || value === "Active" ? "text-green-400" : value === "Pending" || value === "Optional" ? "text-orange-400" : value === "Not configured" ? "text-red-400" : ""}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
