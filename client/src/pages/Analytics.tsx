import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Activity, BarChart3, DollarSign, MessageSquare, TrendingUp, Users } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

const mockMonthlyData = [
  { month: "Oct", leads: 120, responses: 48, scheduled: 32, showed: 24, converted: 8, revenue: 24000 },
  { month: "Nov", leads: 145, responses: 62, scheduled: 42, showed: 31, converted: 11, revenue: 33000 },
  { month: "Dec", leads: 98, responses: 38, scheduled: 26, showed: 19, converted: 7, revenue: 21000 },
  { month: "Jan", leads: 180, responses: 82, scheduled: 58, showed: 44, converted: 16, revenue: 48000 },
  { month: "Feb", leads: 210, responses: 98, scheduled: 72, showed: 55, converted: 21, revenue: 63000 },
  { month: "Mar", leads: 195, responses: 91, scheduled: 67, showed: 51, converted: 19, revenue: 57000 },
];

const channelPerformance = [
  { channel: "Voice", responseRate: 38, scheduleRate: 62, showRate: 78, roi: 420 },
  { channel: "SMS", responseRate: 28, scheduleRate: 48, showRate: 71, roi: 310 },
  { channel: "Email", responseRate: 18, scheduleRate: 35, showRate: 65, roi: 240 },
  { channel: "Social", responseRate: 12, scheduleRate: 28, showRate: 58, roi: 180 },
];

const industryData = [
  { name: "Solar", value: 32, color: "#f59e0b" },
  { name: "Roofing", value: 24, color: "#6366f1" },
  { name: "HVAC", value: 18, color: "#22c55e" },
  { name: "Real Estate", value: 14, color: "#a855f7" },
  { name: "Other", value: 12, color: "#64748b" },
];

export default function Analytics() {
  const [period, setPeriod] = useState("30d");
  const { data: metrics } = trpc.analytics.globalMetrics.useQuery();
  const { data: campaigns } = trpc.campaigns.list.useQuery({});

  const totalRevenue = mockMonthlyData.reduce((a, m) => a + m.revenue, 0);
  const avgROI = channelPerformance.reduce((a, c) => a + c.roi, 0) / channelPerformance.length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time performance tracking and ROI analysis</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Total Leads", value: metrics?.totalLeads ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Campaigns", value: metrics?.totalCampaigns ?? 0, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Messages", value: metrics?.totalMessages ?? 0, icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Response Rate", value: `${metrics?.responseRate ?? 0}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Avg ROI", value: `${Math.round(avgROI)}%`, icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Trend */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Revenue & Conversion Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockMonthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.012 260)" />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: "oklch(0.11 0.012 260)", border: "1px solid oklch(0.2 0.012 260)", borderRadius: "8px", color: "oklch(0.96 0.005 260)" }} />
              <Area yAxisId="left" type="monotone" dataKey="leads" stroke="#6366f1" fill="url(#leadsGrad)" strokeWidth={2} name="Leads" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Channel Performance + Industry Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Channel Performance */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.012 260)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="channel" tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip contentStyle={{ background: "oklch(0.11 0.012 260)", border: "1px solid oklch(0.2 0.012 260)", borderRadius: "8px", color: "oklch(0.96 0.005 260)" }} />
                <Bar dataKey="responseRate" fill="#6366f1" radius={[0, 4, 4, 0]} name="Response %" />
                <Bar dataKey="scheduleRate" fill="#22c55e" radius={[0, 4, 4, 0]} name="Schedule %" />
                <Bar dataKey="showRate" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Show %" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" /> Response</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" /> Schedule</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" /> Show</span>
            </div>
          </CardContent>
        </Card>

        {/* Industry Mix */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Industry Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={industryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {industryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.11 0.012 260)", border: "1px solid oklch(0.2 0.012 260)", borderRadius: "8px", color: "oklch(0.96 0.005 260)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {industryData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Monthly Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.012 260)" />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.11 0.012 260)", border: "1px solid oklch(0.2 0.012 260)", borderRadius: "8px", color: "oklch(0.96 0.005 260)" }} />
              <Bar dataKey="leads" fill="#6366f1" name="Leads" radius={[4, 4, 0, 0]} />
              <Bar dataKey="responses" fill="#22c55e" name="Responses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="scheduled" fill="#f59e0b" name="Scheduled" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" fill="#a855f7" name="Converted" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign ROI Table */}
      {campaigns?.campaigns?.length ? (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Campaign ROI Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Campaign", "Sent", "Responses", "Scheduled", "Response %", "Schedule %"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.campaigns.map((c) => {
                    const responseRate = c.sentCount ? Math.round(((c.responseCount ?? 0) / c.sentCount) * 100) : 0;
                    const scheduleRate = c.responseCount ? Math.round(((c.scheduledCount ?? 0) / c.responseCount) * 100) : 0;
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-3 py-2 font-medium">{c.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{c.sentCount ?? 0}</td>
                        <td className="px-3 py-2 text-muted-foreground">{c.responseCount ?? 0}</td>
                        <td className="px-3 py-2 text-muted-foreground">{c.scheduledCount ?? 0}</td>
                        <td className="px-3 py-2"><span className={`font-medium ${responseRate >= 30 ? "text-green-400" : responseRate >= 15 ? "text-orange-400" : "text-red-400"}`}>{responseRate}%</span></td>
                        <td className="px-3 py-2"><span className={`font-medium ${scheduleRate >= 50 ? "text-green-400" : scheduleRate >= 25 ? "text-orange-400" : "text-red-400"}`}>{scheduleRate}%</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
