"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, extractList, extractData } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  GraduationCap
} from 'lucide-react';
import { studentApi, dashboardApi, courseApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/auth/role-guard';
import { useAuth } from '@/lib/auth-context';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { StudentForm, StudentFormData } from '@/components/forms/student-form';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function StudentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isEditStatsOpen, setIsEditStatsOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<{label: string, key: string, value: any} | null>(null);
  const [tempStatValue, setTempStatValue] = useState('');
  const [overriddenStats, setOverriddenStats] = useState<Record<string, any>>({});
  
  const { data: studentsData, loading: isLoading, execute: refreshStudents } = useFetch<any[]>(studentApi.getAll);
  const { data: statsDataResponse, loading: statsLoading, execute: refreshStats } = useFetch<any>(dashboardApi.getStats);
  const { data: coursesData } = useFetch<any[]>(courseApi.getAll);

  const courses = useMemo(() => extractList<any>(coursesData), [coursesData]);

  const handleAdmissionSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      // Add required fields for the backend
      const payload = {
        ...data,
        role: 'student',
        isStudent: true,
        isActive: data.status === 'active',
        // Convert semester to number if needed
        semester: parseInt(data.semester),
        // Map fields to match potential backend requirements
        studentId: data.rollNo,
        rollNumber: data.rollNo,
        enrollmentNumber: data.enrollmentNo,
        // Map admissionDate to date for dashboard
        date: data.admissionDate || new Date().toISOString()
      };
      
      await studentApi.create(payload);
      toast.success('Student admission completed successfully!');
      setIsAdmissionModalOpen(false);
      refreshStudents();
      refreshStats();
    } catch (error: any) {
      console.error('Admission Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to complete admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'rollNo', 
      label: 'ROLL NO',
      render: (v: any) => <span className="font-black text-[10px] text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg tracking-widest">#{v}</span>
    },
    { 
      key: 'enrollmentNumber',
      label: 'ENROLLMENT',
      render: (v: any) => <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">{v || 'N/A'}</span>
    },
    { 
      key: 'user', 
      label: 'STUDENT NAME', 
      render: (v: any) => {
        const studentName = v?.name || 'N/A';
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-xl border border-border">
              <AvatarImage src={v?.profilePicture} />
              <AvatarFallback className="bg-slate-900 text-blue-500 font-black text-xs">{studentName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-black text-white tracking-tight uppercase">{studentName}</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{v?.email}</span>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'course', 
      label: 'PROGRAM',
      render: (v: any) => {
        const programName =
          typeof v === 'string'
            ? v
            : v?.name || v?.title || v?.code || 'N/A';
        return (
          <span className="font-black text-[10px] text-slate-300 uppercase tracking-widest">
            {programName}
          </span>
        );
      }
    },
    { 
      key: 'semester', 
      label: 'SEM',
      render: (v: any) => <Badge className="bg-slate-900 text-slate-400 border-border rounded-lg font-black text-[10px] uppercase tracking-widest">Sem {v}</Badge>
    },
    { 
      key: 'status', 
      label: 'STATUS',
      render: (v: any) => (
        (() => {
          const normalized = String(v || '').toLowerCase();
          return (
            <Badge
              className={cn(
                "rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border",
                normalized === 'active'
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
              )}
            >
              {v}
            </Badge>
          );
        })()
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-500/10">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], []);

  const studentList = useMemo(() => extractList<Record<string, any>>(studentsData), [studentsData]);
  const statsData = useMemo(() => {
    const base = extractData<Record<string, any>>(statsDataResponse) || {};
    return { ...base, ...overriddenStats };
  }, [statsDataResponse, overriddenStats]);

  const handleUpdateStat = () => {
    if (!editingStat) return;
    setOverriddenStats(prev => ({
      ...prev,
      [editingStat.key]: editingStat.key === 'pendingFees' ? parseFloat(tempStatValue) || 0 : parseInt(tempStatValue) || 0
    }));
    setIsEditStatsOpen(false);
    toast.success(`${editingStat.label} updated successfully`);
  };

  const openEditStat = (label: string, key: string, value: any) => {
    setEditingStat({ label, key, value });
    setTempStatValue(String(value).replace('₹', ''));
    setIsEditStatsOpen(true);
  };

  const filteredStudents = useMemo(() => {
    return studentList.filter((s: any) => 
      String(s.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(s.rollNo || s.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentList, searchQuery]);

  return (
    <RoleGuard allowedRoles={['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff']}>
      <div className="space-y-8 pb-10 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
            <GraduationCap className="h-10 w-10 text-blue-500" />
            Student Registry
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Database Management & Academic Records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-border bg-card text-white hover:bg-accent font-black text-xs h-12 px-6 uppercase tracking-widest">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
            onClick={() => setIsAdmissionModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Admission
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-8 shadow-xl">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-10 w-24" />
            </Card>
          ))
        ) : (
          [
            { label: "TOTAL ENROLLMENTS", value: statsData?.totalStudents || 0, trend: statsData?.studentTrend || "0%", color: "text-blue-500", bg: "bg-blue-500/10", key: "totalStudents" },
            { label: "NEW ADMISSIONS", value: statsData?.newAdmissions || 0, trend: "Current", color: "text-purple-500", bg: "bg-purple-500/10", key: "newAdmissions" },
            { label: "OUTSTANDING DUES", value: "₹" + (statsData?.pendingFees || 0), trend: "Alert", color: "text-amber-500", bg: "bg-amber-500/10", key: "pendingFees" },
          ].map((stat, i) => (
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-8 shadow-xl group relative overflow-hidden">
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
                  {i > 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900"
                      onClick={() => openEditStat(stat.label, stat.key, stat.value)}
                    >
                      <Edit className="h-3 w-3 text-slate-500" />
                    </Button>
                  )}
                </div>
                <div className="flex items-end gap-3">
                  <p className={cn("text-4xl font-black", i === 2 ? "text-amber-500" : "text-white")}>{stat.value}</p>
                  <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg mb-1.5", stat.bg, stat.color)}>{stat.trend}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-border bg-slate-900/30 px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Active Student Directory</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Live data synchronization with registrar</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="SEARCH REGISTRY..." 
                  className="pl-12 pr-6 py-3 bg-slate-950 border border-border rounded-2xl text-xs font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 w-80 shadow-inner transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border bg-slate-950">
                <Filter className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<Record<string, any>>
            data={filteredStudents}
            isLoading={isLoading}
            columns={columns}
          />
        </CardContent>
      </Card>

      <Dialog open={isAdmissionModalOpen} onOpenChange={setIsAdmissionModalOpen}>
        <DialogContent className="max-w-3xl bg-card border-border shadow-2xl rounded-[2.5rem] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-8 pt-8 pb-4 border-b border-border/50 bg-slate-900/20">
            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-blue-500" />
              </div>
              Student Admission
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 ml-1">
              Register a new student into the institutional database
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <StudentForm 
              onSubmit={handleAdmissionSubmit} 
              onCancel={() => setIsAdmissionModalOpen(false)} 
              courses={courses}
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditStatsOpen} onOpenChange={setIsEditStatsOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit Statistics</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              Manually override {editingStat?.label} value
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{editingStat?.label}</Label>
              <div className="relative">
                {editingStat?.key === 'pendingFees' && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                )}
                <Input 
                  type="number"
                  value={tempStatValue}
                  onChange={(e) => setTempStatValue(e.target.value)}
                  className={cn(
                    "bg-slate-950 border-border rounded-xl font-black text-white",
                    editingStat?.key === 'pendingFees' ? "pl-8" : "pl-4"
                  )}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStatsOpen(false)} className="rounded-xl border-border uppercase font-black text-[10px] tracking-widest">
              Cancel
            </Button>
            <Button onClick={handleUpdateStat} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl uppercase font-black text-[10px] tracking-widest">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
