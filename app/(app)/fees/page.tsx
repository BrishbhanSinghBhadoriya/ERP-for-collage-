"use client";

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus, 
  Download, 
  Search, 
  ArrowUpRight, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { feeApi, studentApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import dayjs from 'dayjs';
import { cn, extractList, extractData } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function FeesPage() {
  const { user } = useAuth();
  const isAdminOrStaffOrHR = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'staff' || user?.role === 'hr';

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    type: 'Tuition',
    amount: 0,
    paidAmount: 0,
    dueDate: dayjs().add(15, 'day').format('YYYY-MM-DD'),
  });
  
  const { data: feeTransactions, loading: isLoading } = useFetch<any[]>(
    user?.role === 'student'
      ? () => feeApi.getStudentFees((user as any)?.studentProfile || user?.id || '')
      : () => feeApi.getFees({ page: 1, limit: 200 }),
    { immediate: !!user }
  );

  const transactionList = useMemo(() => extractList<Record<string, any>>(feeTransactions), [feeTransactions]);

  const { data: studentsData, loading: studentsLoading, execute: refetchStudents } = useFetch<any[]>(
    () => studentApi.getAll({ page: 1, limit: 200 }),
    { immediate: false }
  );
  const students = useMemo(() => extractList<Record<string, any>>(studentsData), [studentsData]);

  useEffect(() => {
    if (!addDialogOpen) return;
    refetchStudents();
  }, [addDialogOpen, refetchStudents]);

  useEffect(() => {
    if (!addDialogOpen) return;
    if (form.studentId) return;
    const first = students?.[0];
    if (first?._id) setForm((p) => ({ ...p, studentId: String(first._id) }));
  }, [addDialogOpen, students, form.studentId]);
  
  const { data: stats, loading: statsLoading } = useFetch<any>(
    user?.role === 'student' ? () => Promise.resolve(null) : feeApi.getStats,
    { immediate: !!user && user?.role !== 'student' }
  );

  const statsData = useMemo(() => extractData<Record<string, any>>(stats), [stats]);

  const feeStats = useMemo(() => {
    const list = transactionList || [];
    if (user?.role === 'student') {
      const total = list.reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
      const paid = list
        .filter((f: any) => String(f.status).toLowerCase() === 'paid')
        .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
      const pending = Math.max(0, total - paid);

      return [
        { label: "TOTAL FEES", value: "₹" + total, trend: "Computed", color: "text-blue-500", bg: "bg-blue-500/10", icon: ArrowUpRight },
        { label: "PAID AMOUNT", value: "₹" + paid, trend: "Verified", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
        { label: "PENDING DUES", value: "₹" + pending, trend: "Remaining", color: "text-rose-500", bg: "bg-rose-500/10", icon: Clock },
        { label: "SCHOLARSHIP", value: "₹0", trend: "N/A", color: "text-indigo-500", bg: "bg-indigo-500/10", icon: AlertCircle },
      ];
    }

    return [
      { label: "TOTAL COLLECTION", value: "₹" + (statsData?.totalPaidAmount || 0), trend: "All-time", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: ArrowUpRight },
      { label: "PAID RECORDS", value: statsData?.paidCount || 0, trend: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
      { label: "PENDING RECORDS", value: statsData?.pendingCount || 0, trend: "Due", color: "text-rose-500", bg: "bg-rose-500/10", icon: Clock },
      { label: "TOTAL STUDENTS", value: statsData?.totalRecords || 0, trend: "Fee rows", color: "text-blue-500", bg: "bg-blue-500/10", icon: TrendingUp },
    ];
  }, [user?.role, statsData, transactionList]);

  const submitFee = async () => {
    try {
      if (!form.studentId) return toast.error('Please select student');
      if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter total fee amount');
      const total = Number(form.amount);
      const paid = Math.max(0, Math.min(Number(form.paidAmount || 0), total));
      await feeApi.createFeeRecord({
        student: form.studentId,
        type: form.type,
        amount: total,
        paidAmount: paid,
        dueDate: form.dueDate,
      });
      toast.success('Fee record added');
      setAddDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add fee');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'hr', 'hod', 'staff', 'student']}>
      <div className="space-y-8 pb-10 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
            <CreditCard className="h-10 w-10 text-emerald-500" />
            Financial Core
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Fee Structures & Revenue Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-border bg-card text-white hover:bg-accent font-black text-xs h-12 px-6 uppercase tracking-widest">
            <Download className="mr-2 h-4 w-4" /> Reports
          </Button>
          {isAdminOrStaffOrHR && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Collect Fee
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))
        ) : (
          feeStats.map((stat, i) => (
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl group">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
                <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
                <div className="flex items-center gap-2">
                  <stat.icon className={cn("h-3 w-3", stat.color)} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl lg:col-span-2">
          <CardHeader className="border-b border-border bg-slate-900/30 px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Transaction Ledger</CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Real-time payment verification system</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="SEARCH LEDGER..." 
                  className="pl-12 pr-6 py-3 bg-slate-950 border border-border rounded-2xl text-xs font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-80 shadow-inner transition-all"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable<Record<string, any>>
              data={transactionList}
              isLoading={isLoading}
              columns={[
                { 
                  key: 'student', 
                  label: 'STUDENT NAME', 
                  render: (v, row) => (
                    <div className="flex flex-col">
                      <span className="font-black text-white tracking-tight uppercase">{v?.user?.name || v?.user?.email || 'N/A'}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                        {v?.course?.name ? v.course.name : row?.student?.course?.name || 'N/A'}
                      </span>
                    </div>
                  )
                },
                { 
                  key: 'type', 
                  label: 'FEE TYPE', 
                  render: (v) => <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{v}</span> 
                },
                { 
                  key: 'amount', 
                  label: 'AMOUNT', 
                  render: (v) => <span className="text-xs font-black text-blue-400 uppercase tracking-widest">₹{v}</span> 
                },
                { 
                  key: 'paidAmount', 
                  label: 'PAID', 
                  render: (v) => <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">₹{Number(v || 0)}</span> 
                },
                { 
                  key: 'dueDate', 
                  label: 'DUE DATE', 
                  render: (v) => <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{v ? dayjs(v).format('DD MMM YYYY') : '-'}</span> 
                },
                {
                  key: 'remaining',
                  label: 'REMAINING',
                  render: (_v, row) => {
                    const total = Number(row?.amount || 0);
                    const paid = Number(row?.paidAmount || 0);
                    const remaining = Math.max(0, total - paid);
                    return <span className="text-xs font-black text-rose-400 uppercase tracking-widest">₹{remaining}</span>;
                  }
                },
                { 
                  key: 'status', 
                  label: 'PAYMENT STATUS', 
                  render: (v) => (
                    (() => {
                      const normalized = String(v || '').toLowerCase();
                      const isPaid = normalized === 'paid';
                      const isPending = normalized === 'pending';
                      return (
                    <Badge className={cn(
                      "rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border",
                      isPaid ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      isPending ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      {v}
                    </Badge>
                      );
                    })()
                  )
                },
              ]}
            />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
            <CardHeader className="bg-slate-900/30 border-b border-border p-8">
              <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Fee Catalog</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Academic Session 2024-25</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {[
                { name: 'B.Tech CSE', amount: '₹90,000/yr' },
                { name: 'BBA', amount: '₹65,000/yr' },
                { name: 'MBA', amount: '₹1,20,000/yr' },
                { name: 'B.Com', amount: '₹45,000/yr' },
              ].map((fee, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 transition-all cursor-default">
                  <span className="font-black text-slate-300 uppercase text-xs tracking-widest">{fee.name}</span>
                  <span className="font-black text-emerald-500">{fee.amount}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 rounded-xl border-border bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] h-12 hover:text-white transition-all">
                Full Fee Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-3 leading-none">Intelligence Reports</h3>
              <p className="text-emerald-100/70 font-bold text-xs uppercase tracking-widest mb-8 leading-relaxed">Secure data export for audit & management review.</p>
              <Button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black uppercase tracking-widest h-14 shadow-2xl transition-all hover:scale-105">
                GENERATE AUDIT PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="px-8 pt-8 pb-5 border-b border-border/50 bg-slate-900/20">
            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Add Fee Record
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              HR/Admin can add paid + pending fees
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student</Label>
                <Select value={form.studentId} onValueChange={(v) => setForm((p) => ({ ...p, studentId: v }))}>
                  <SelectTrigger className="bg-slate-950 border-border rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 h-11">
                    <SelectValue placeholder={studentsLoading ? 'Loading...' : 'Select student'} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-border">
                    {students?.length ? (
                      students.map((s: any) => (
                        <SelectItem key={s._id} value={String(s._id)} className="font-bold text-[10px] uppercase tracking-widest">
                          {s.user?.name || s.user?.email || 'Student'} ({s.rollNo || s.rollNumber})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No students found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fee Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-slate-950 border-border rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-border">
                    {['Tuition', 'Library', 'Exam', 'Hostel'].map((t) => (
                      <SelectItem key={t} value={t} className="font-bold text-[10px] uppercase tracking-widest">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="90000"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paid Amount</Label>
                <Input
                  type="number"
                  value={form.paidAmount}
                  onChange={(e) => setForm((p) => ({ ...p, paidAmount: Number(e.target.value) }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="20000"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                className="rounded-2xl border-border hover:bg-slate-900 font-black uppercase text-[10px] tracking-[0.2em] h-11 px-6"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
                onClick={submitFee}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
