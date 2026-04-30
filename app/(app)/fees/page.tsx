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
  AlertCircle,
  Edit,
  Trash2,
  Pencil,
} from 'lucide-react';
import { feeApi, studentApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import dayjs from 'dayjs';
import { cn, extractList, extractData } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
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

  const [ledgerOverrides, setLedgerOverrides] = useState<any[]>([]);
  const [overriddenStats, setOverriddenStats] = useState<Record<string, any>>({});
  const [catalogList, setCatalogList] = useState([
    { id: '1', name: 'B.Tech CSE', amount: '₹90,000/yr' },
    { id: '2', name: 'BBA', amount: '₹65,000/yr' },
    { id: '3', name: 'MBA', amount: '₹1,20,000/yr' },
    { id: '4', name: 'B.Com', amount: '₹45,000/yr' },
  ]);

  const [isStatsEditOpen, setIsStatsEditOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<any>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<any>(null);
  const [isLedgerEditOpen, setIsLedgerEditOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const [tempValue, setTempValue] = useState('');
  
  const { data: feeTransactions, loading: isLoading, execute: refetchLedger } = useFetch<any[]>(
    user?.role === 'student'
      ? () => feeApi.getStudentFees((user as any)?.studentProfile || user?.id || '')
      : () => feeApi.getFees({ page: 1, limit: 200 }),
    { immediate: !!user }
  );

  const transactionList = useMemo(() => {
    const base = extractList<Record<string, any>>(feeTransactions);
    const overrides = [...ledgerOverrides];
    const list = [...base];
    overrides.forEach(ov => {
      const idx = list.findIndex(l => (l.id || l._id) === ov.id);
      if (idx > -1) list[idx] = { ...list[idx], ...ov };
      else list.unshift(ov);
    });
    return list;
  }, [feeTransactions, ledgerOverrides]);

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
  
  const { data: stats, loading: statsLoading, execute: refetchStats } = useFetch<any>(
    user?.role === 'student' ? () => Promise.resolve(null) : feeApi.getStats,
    { immediate: !!user && user?.role !== 'student' }
  );

  const statsData = useMemo(() => {
    const base = extractData<Record<string, any>>(stats) || {};
    return { ...base, ...overriddenStats };
  }, [stats, overriddenStats]);

  const feeStats = useMemo(() => {
    const list = transactionList || [];
    if (user?.role === 'student') {
      const total = list.reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
      const paid = list
        .filter((f: any) => String(f.status).toLowerCase() === 'paid')
        .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
      const pending = Math.max(0, total - paid);

      return [
        { label: "TOTAL FEES", value: "₹" + total, trend: "Computed", color: "text-blue-500", bg: "bg-blue-500/10", icon: ArrowUpRight, key: 'total' },
        { label: "PAID AMOUNT", value: "₹" + paid, trend: "Verified", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2, key: 'paid' },
        { label: "PENDING DUES", value: "₹" + pending, trend: "Remaining", color: "text-rose-500", bg: "bg-rose-500/10", icon: Clock, key: 'pending' },
        { label: "SCHOLARSHIP", value: "₹0", trend: "N/A", color: "text-indigo-500", bg: "bg-indigo-500/10", icon: AlertCircle, key: 'scholarship' },
      ];
    }

    return [
      { label: "TOTAL COLLECTION", value: "₹" + (statsData?.totalPaidAmount || 0), trend: "All-time", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: ArrowUpRight, key: 'totalPaidAmount' },
      { label: "PAID RECORDS", value: statsData?.paidCount || 0, trend: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2, key: 'paidCount' },
      { label: "PENDING RECORDS", value: statsData?.pendingCount || 0, trend: "Due", color: "text-rose-500", bg: "bg-rose-500/10", icon: Clock, key: 'pendingCount' },
      { label: "TOTAL STUDENTS", value: statsData?.totalRecords || 0, trend: "Fee rows", color: "text-blue-500", bg: "bg-blue-500/10", icon: TrendingUp, key: 'totalRecords' },
    ];
  }, [user?.role, statsData, transactionList]);

  const handleSaveStats = () => {
    if (!editingStat) return;
    setOverriddenStats(prev => ({
      ...prev,
      [editingStat.key]: tempValue.includes('₹') ? tempValue.replace('₹', '') : tempValue
    }));
    setIsStatsEditOpen(false);
    toast.success('Stats updated');
  };

  const handleSaveCatalog = () => {
    if (editingCatalog) {
      setCatalogList(prev => prev.map(c => c.id === editingCatalog.id ? { ...c, name: editingCatalog.name, amount: editingCatalog.amount } : c));
      toast.success('Catalog updated');
    } else {
      setCatalogList(prev => [...prev, { id: Date.now().toString(), name: tempValue, amount: '₹0/yr' }]);
      toast.success('Catalog item added');
    }
    setIsCatalogModalOpen(false);
  };

  const handleSaveLedger = () => {
    if (!editingTransaction) return;
    setLedgerOverrides(prev => {
      const existing = prev.filter(p => p.id !== editingTransaction.id);
      return [...existing, editingTransaction];
    });
    setIsLedgerEditOpen(false);
    toast.success('Transaction updated');
  };

  const deleteCatalogItem = (id: string) => {
    setCatalogList(prev => prev.filter(c => c.id !== id));
    toast.success('Catalog item removed');
  };

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
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-8 shadow-xl group relative overflow-hidden">
              <div className="flex items-center gap-6">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                  <stat.icon className={cn("h-7 w-7", stat.color)} />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    {user?.role !== 'student' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setEditingStat(stat);
                          setTempValue(String(stat.value).replace('₹', ''));
                          setIsStatsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3 text-slate-500" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="text-xl font-black text-white uppercase tracking-tight">{stat.value}</p>
                    <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg mb-1", stat.bg, stat.color)}>{stat.trend}</span>
                  </div>
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
                {
                  key: 'actions',
                  label: 'ACTIONS',
                  render: (_, row) => (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-white"
                        onClick={() => {
                          setEditingTransaction({
                            id: row.id || row._id,
                            amount: row.amount,
                            status: row.status,
                            type: row.type
                          });
                          setIsLedgerEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                },
              ]}
            />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
            <CardHeader className="bg-slate-900/30 border-b border-border p-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Fee Catalog</CardTitle>
                  <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Standard Academic Schedule</CardDescription>
                </div>
                {user?.role !== 'student' && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 text-emerald-500"
                    onClick={() => {
                      setEditingCatalog(null);
                      setTempValue('');
                      setIsCatalogModalOpen(true);
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {catalogList.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-900 transition-all hover:border-emerald-500/30">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.amount}</p>
                    </div>
                  </div>
                  {user?.role !== 'student' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-500"
                        onClick={() => {
                          setEditingCatalog(item);
                          setIsCatalogModalOpen(true);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-500"
                        onClick={() => deleteCatalogItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  {user?.role === 'student' && <ArrowUpRight className="h-4 w-4 text-slate-700" />}
                </div>
              ))}
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

      {/* Stats Edit Modal */}
      <Dialog open={isStatsEditOpen} onOpenChange={setIsStatsEditOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit {editingStat?.label}</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manual statistics override</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Value</Label>
            <Input 
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="bg-slate-950 border-border rounded-xl font-black text-white mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatsEditOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveStats} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Catalog Modal */}
      <Dialog open={isCatalogModalOpen} onOpenChange={setIsCatalogModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              {editingCatalog ? 'Edit Catalog Item' : 'Add Catalog Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Name</Label>
              <Input 
                value={editingCatalog ? editingCatalog.name : tempValue}
                onChange={(e) => editingCatalog ? setEditingCatalog({...editingCatalog, name: e.target.value}) : setTempValue(e.target.value)}
                className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
              />
            </div>
            {editingCatalog && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount Text</Label>
                <Input 
                  value={editingCatalog.amount}
                  onChange={(e) => setEditingCatalog({...editingCatalog, amount: e.target.value})}
                  className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCatalogModalOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveCatalog} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ledger Edit Modal */}
      <Dialog open={isLedgerEditOpen} onOpenChange={setIsLedgerEditOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (₹)</Label>
              <Input 
                type="number"
                value={editingTransaction?.amount}
                onChange={(e) => setEditingTransaction({...editingTransaction, amount: Number(e.target.value)})}
                className="bg-slate-950 border-border rounded-xl font-black text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</Label>
              <Select 
                value={editingTransaction?.status} 
                onValueChange={(v) => setEditingTransaction({...editingTransaction, status: v})}
              >
                <SelectTrigger className="bg-slate-950 border-border rounded-xl text-xs font-black uppercase tracking-widest">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-border text-white">
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLedgerEditOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveLedger} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
