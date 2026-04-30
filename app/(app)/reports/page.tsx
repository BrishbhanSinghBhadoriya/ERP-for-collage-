"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Filter, 
  TrendingUp, 
  Users, 
  CreditCard, 
  BookOpen,
  PieChart,
  BarChart3,
  Calendar,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';
import { attendanceApi, feeApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import { cn, extractData } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';

const STATIC_ATTENDANCE_REPORT = {
  avgAttendance: 82,
  trend: "+3% vs last month",
  totalLectures: 1240,
  lowAttendanceCount: 38,
  trends: [
    { name: "Jan", percentage: 78 },
    { name: "Feb", percentage: 80 },
    { name: "Mar", percentage: 81 },
    { name: "Apr", percentage: 83 },
    { name: "May", percentage: 82 },
  ],
  byDepartment: [
    { name: "CSE", percentage: 85 },
    { name: "BBA", percentage: 79 },
    { name: "MBA", percentage: 81 },
    { name: "B.Com", percentage: 76 },
  ],
};

const STATIC_FEE_REPORT = {
  totalCollected: 1250000,
  totalPending: 310000,
  totalScholarships: 85000,
  collectionRate: 80,
  byCourse: [
    { name: "B.Tech", collected: 420000, pending: 100000 },
    { name: "BBA", collected: 280000, pending: 75000 },
    { name: "MBA", collected: 350000, pending: 90000 },
    { name: "B.Com", collected: 200000, pending: 45000 },
  ],
};

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdminOrHODOrHR = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'hr';

  const [activeTab, setActiveTab] = useState<'attendance' | 'fees'>('attendance');
  
  const [attendanceOverrides, setAttendanceOverrides] = useState<any>(null);
  const [feeOverrides, setFeeOverrides] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{type: 'attendance' | 'fees', key: string, label: string} | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [tempTrend, setTempTrend] = useState('');

  const [isChartEditModalOpen, setIsChartEditModalOpen] = useState(false);
  const [editingChartItem, setEditingChartItem] = useState<{type: 'attendance' | 'fees', index: number, name: string, value: number} | null>(null);

  const { data: attendanceDataFetched } = useFetch<any>(async () => {
    try {
      const response = await attendanceApi.getAttendance();
      const rows = Array.isArray(response?.data) ? response.data : [];
      if (!rows.length) return STATIC_ATTENDANCE_REPORT;

      const present = rows.filter((r: any) => String(r?.status).toLowerCase() === "present").length;
      const avgAttendance = Math.round((present / rows.length) * 100);
      return {
        ...STATIC_ATTENDANCE_REPORT,
        avgAttendance,
        totalLectures: rows.length,
      };
    } catch {
      return STATIC_ATTENDANCE_REPORT;
    }
  });

  const { data: feeDataFetched } = useFetch<any>(async () => {
    try {
      const response = await feeApi.getStats();
      const payload = response?.data || {};
      if (!payload || Object.keys(payload).length === 0) return STATIC_FEE_REPORT;
      const totalCollected = Number(payload.totalPaidAmount || 0);
      const totalPending = Number(payload.pendingCount || 0) * 10000;
      const total = totalCollected + totalPending;
      const collectionRate = total > 0 ? Math.round((totalCollected / total) * 100) : 0;
      return {
        ...STATIC_FEE_REPORT,
        totalCollected,
        totalPending,
        collectionRate,
      };
    } catch {
      return STATIC_FEE_REPORT;
    }
  });

  const attendanceData = useMemo(() => {
    const base = attendanceDataFetched || STATIC_ATTENDANCE_REPORT;
    return attendanceOverrides ? { ...base, ...attendanceOverrides } : base;
  }, [attendanceDataFetched, attendanceOverrides]);

  const feeData = useMemo(() => {
    const base = feeDataFetched || STATIC_FEE_REPORT;
    return feeOverrides ? { ...base, ...feeOverrides } : base;
  }, [feeDataFetched, feeOverrides]);

  const handleSaveStat = () => {
    if (!editingSection) return;
    const val = tempValue.includes('%') ? parseInt(tempValue.replace('%', '')) : parseInt(tempValue);
    
    if (editingSection.type === 'attendance') {
      setAttendanceOverrides((prev: any) => ({
        ...(prev || {}),
        [editingSection.key]: val,
        trend: tempTrend || (prev || {}).trend
      }));
    } else {
      setFeeOverrides((prev: any) => ({
        ...(prev || {}),
        [editingSection.key]: val
      }));
    }
    setIsEditModalOpen(false);
    toast.success('Report updated');
  };

  const handleSaveChartItem = () => {
    if (!editingChartItem) return;
    
    if (editingChartItem.type === 'attendance') {
      const newTrends = [...(attendanceData.trends || [])];
      newTrends[editingChartItem.index] = { ...newTrends[editingChartItem.index], percentage: editingChartItem.value };
      setAttendanceOverrides((prev: any) => ({ ...(prev || {}), trends: newTrends }));
    } else {
      const newByCourse = [...(feeData.byCourse || [])];
      newByCourse[editingChartItem.index] = { ...newByCourse[editingChartItem.index], collected: editingChartItem.value };
      setFeeOverrides((prev: any) => ({ ...(prev || {}), byCourse: newByCourse }));
    }
    setIsChartEditModalOpen(false);
    toast.success('Chart data updated');
  };

  const chartData = activeTab === 'attendance' 
    ? (attendanceData?.trends || []) 
    : (feeData?.byCourse || []);

  return (
    <RoleGuard allowedRoles={['admin', 'hod', 'professor', 'assistant_professor', 'staff', 'hr']}>
      <div className="space-y-8 pb-10 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
            <BarChart3 className="h-10 w-10 text-emerald-500" />
            Analytics Hub
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Advanced University Reporting & Insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 border-border font-black text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-all">
            <Filter className="mr-2 h-4 w-4" /> Filter Reports
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105">
            <Download className="mr-2 h-4 w-4" /> Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-slate-900/50 p-1 rounded-2xl border border-border mb-8 inline-flex">
          <TabsTrigger value="attendance" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
            Attendance Analysis
          </TabsTrigger>
          {(user?.role === 'admin' || user?.role === 'hod' || user?.role === 'staff' || user?.role === 'hr') && (
            <TabsTrigger value="fees" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
              Financial Insights
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="attendance" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "AVG ATTENDANCE", value: (attendanceData?.avgAttendance || 0) + "%", trend: attendanceData?.trend || "+0% vs last month", color: "text-emerald-500", icon: TrendingUp, key: 'avgAttendance' },
              { label: "TOTAL LECTURES", value: attendanceData?.totalLectures || 0, trend: "This semester", color: "text-blue-500", icon: BookOpen, key: 'totalLectures' },
              { label: "LOW ATTENDANCE", value: attendanceData?.lowAttendanceCount || 0, trend: "Requires attention", color: "text-rose-500", icon: Users, key: 'lowAttendanceCount' },
            ].map((stat, i) => (
              <Card key={i} className="rounded-[2rem] border border-border bg-card p-8 shadow-xl group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-slate-900">
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  {isAdminOrHODOrHR && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setEditingSection({ type: 'attendance', key: stat.key, label: stat.label });
                        setTempValue(String(stat.value));
                        setTempTrend(stat.trend);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3 text-slate-500" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl lg:col-span-2">
              <CardHeader className="px-0 pt-0 mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Attendance Trends</CardTitle>
                    <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Monthly participation metrics across all courses</CardDescription>
                  </div>
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                    />
                    <YAxis 
                      width={40}
                      orientation="left"
                      type="number"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
              <CardHeader className="px-0 pt-0 mb-8">
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Department Wise</CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Attendance distribution by faculty</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-6">
                {(attendanceData?.byDepartment || []).map((dept: any, i: number) => (
                  <div key={i} className="space-y-2 group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase tracking-widest">{dept.name}</span>
                        {isAdminOrHODOrHR && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setEditingChartItem({ type: 'attendance', index: i, name: dept.name, value: dept.percentage });
                              setIsChartEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-2.5 w-2.5 text-slate-500" />
                          </Button>
                        )}
                      </div>
                      <span className="text-xs font-black text-emerald-500">{dept.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "TOTAL COLLECTED", value: "₹" + (feeData?.totalCollected || 0), trend: "This academic year", color: "text-emerald-500", icon: CreditCard, key: 'totalCollected' },
              { label: "TOTAL PENDING", value: "₹" + (feeData?.totalPending || 0), trend: "Action required", color: "text-rose-500", icon: Calendar, key: 'totalPending' },
              { label: "SCHOLARSHIPS", value: "₹" + (feeData?.totalScholarships || 0), trend: "Financial aid", color: "text-blue-500", icon: Users, key: 'totalScholarships' },
            ].map((stat, i) => (
              <Card key={i} className="rounded-[2rem] border border-border bg-card p-8 shadow-xl group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-slate-900">
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  {isAdminOrHODOrHR && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setEditingSection({ type: 'fees', key: stat.key, label: stat.label });
                        setTempValue(String(stat.value).replace('₹', ''));
                        setTempTrend(stat.trend);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3 text-slate-500" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl lg:col-span-2">
              <CardHeader className="px-0 pt-0 mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Fee Collection By Program</CardTitle>
                    <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Financial distribution across departments</CardDescription>
                  </div>
                  <BarChart3 className="h-6 w-6 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feeData?.byCourse || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                    />
                    <YAxis 
                      width={40}
                      orientation="left"
                      type="number"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
              <CardHeader className="px-0 pt-0 mb-8">
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Collection Status</CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Overall payment fulfillment</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 flex flex-col items-center justify-center">
                <div className="relative h-48 w-48 mb-8">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle className="text-slate-900 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                    <circle 
                      className="text-emerald-500 stroke-current transition-all duration-1000" 
                      strokeWidth="10" 
                      strokeDasharray={`${(feeData?.collectionRate || 0) * 2.51}, 251.2`} 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="40" cx="50" cy="50" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{feeData?.collectionRate || 0}%</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Collected</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Received</span>
                    <span className="text-xs font-black text-white">₹{feeData?.totalCollected || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Due</span>
                    <span className="text-xs font-black text-white">₹{feeData?.totalPending || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Stat Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit {editingSection?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Value</Label>
              <Input 
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="bg-slate-950 border-border rounded-xl font-black text-white"
              />
            </div>
            {editingSection?.type === 'attendance' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trend Text</Label>
                <Input 
                  value={tempTrend}
                  onChange={(e) => setTempTrend(e.target.value)}
                  className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveStat} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chart Item Edit Modal */}
      <Dialog open={isChartEditModalOpen} onOpenChange={setIsChartEditModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit {editingChartItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Percentage / Amount</Label>
              <Input 
                type="number"
                value={editingChartItem?.value}
                onChange={(e) => setEditingChartItem(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                className="bg-slate-950 border-border rounded-xl font-black text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChartEditModalOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveChartItem} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
