"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Plus, 
  Download, 
  Search, 
  Calendar,
  Clock,
  MapPin,
  FileText,
  Filter,
  CheckCircle2,
  Edit,
  Trash2,
} from 'lucide-react';
import { examApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import dayjs from 'dayjs';
import { cn, extractList, extractData } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const STATIC_EXAM_DATE_SHEET: Record<string, any>[] = [
  {
    id: 'static-1',
    date: dayjs().add(7, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString(),
    course: { name: 'B.Tech CSE' },
    subject: { name: 'Data Structures', code: 'CSE-201' },
    name: 'Mid-Semester',
    semester: 3,
    maxMarks: 50,
  },
  {
    id: 'static-2',
    date: dayjs().add(9, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString(),
    course: { name: 'B.Tech CSE' },
    subject: { name: 'DBMS', code: 'CSE-203' },
    name: 'Mid-Semester',
    semester: 3,
    maxMarks: 50,
  },
  {
    id: 'static-3',
    date: dayjs().add(8, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString(),
    course: { name: 'BBA' },
    subject: { name: 'Financial Accounting', code: 'BBA-102' },
    name: 'Internal',
    semester: 1,
    maxMarks: 30,
  },
  {
    id: 'static-4',
    date: dayjs().add(11, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString(),
    course: { name: 'MBA' },
    subject: { name: 'Organizational Behaviour', code: 'MBA-105' },
    name: 'Mid-Term',
    semester: 1,
    maxMarks: 50,
  },
  {
    id: 'static-5',
    date: dayjs().add(12, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString(),
    course: { name: 'B.Com' },
    subject: { name: 'Business Law', code: 'BCOM-204' },
    name: 'Semester Exam',
    semester: 2,
    maxMarks: 100,
  },
];

export default function ExamsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [examList, setExamList] = useState<any[]>([]);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    course: '',
    subjectName: '',
    subjectCode: '',
    examName: '',
    semester: 1,
    maxMarks: 100
  });

  const { data: dateSheet, loading: dateSheetLoading, execute: refetchDateSheet } = useFetch<any[]>(examApi.getDateSheet);
  const { data: stats, loading: statsLoading, execute: refetchStats } = useFetch<any>(examApi.getStats);

  useEffect(() => {
    const list = extractList<Record<string, any>>(dateSheet);
    setExamList(list.length ? list : []);
  }, [dateSheet]);

  const isAdminOrHODOrHR = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'hr';

  const statsData = useMemo(() => extractData<Record<string, any>>(stats), [stats]);

  const handleSaveExam = async () => {
    try {
      const payload = {
        date: dayjs(formData.date).toISOString(),
        course: formData.course, // Assuming backend handles course ID or Name
        subject: formData.subjectName, // Assuming backend handles subject ID or Name
        name: formData.examName,
        semester: Number(formData.semester),
        maxMarks: Number(formData.maxMarks),
      };

      if (editingExam) {
        await examApi.update(editingExam._id || editingExam.id, payload);
        toast.success('Exam details updated successfully');
      } else {
        await examApi.create(payload);
        toast.success('New exam deployed successfully');
      }
      refetchDateSheet();
      setIsExamModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error saving exam');
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await examApi.delete(id);
      toast.success('Exam record deleted');
      refetchDateSheet();
    } catch (err: any) {
      toast.error('Error deleting exam');
    }
  };

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      date: dayjs().format('YYYY-MM-DD'),
      course: '',
      subjectName: '',
      subjectCode: '',
      examName: '',
      semester: 1,
      maxMarks: 100
    });
    setIsExamModalOpen(true);
  };

  const openEditModal = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      date: dayjs(exam.date).format('YYYY-MM-DD'),
      course: exam.course?.name || '',
      subjectName: exam.subject?.name || '',
      subjectCode: exam.subject?.code || '',
      examName: exam.name || '',
      semester: exam.semester || 1,
      maxMarks: exam.maxMarks || 100
    });
    setIsExamModalOpen(true);
  };

  const filteredDateSheet = useMemo(() => {
    return examList.filter((exam: any) => 
      [
        exam?.course?.name,
        exam?.subject?.name,
        exam?.subject?.code,
        exam?.name,
      ]
        .filter(Boolean)
        .some((v: any) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [examList, searchQuery]);

  return (
    <RoleGuard allowedRoles={['admin', 'hod', 'professor', 'assistant_professor', 'staff', 'student', 'hr']}>
      <div className="space-y-8 pb-10 bg-background">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
              <ClipboardList className="h-10 w-10 text-blue-500" />
              Command Center
            </h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Examination Logistics & Protocol Control</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl border-border bg-card text-white hover:bg-accent font-black text-xs h-12 px-6 uppercase tracking-widest">
              <Download className="mr-2 h-4 w-4" /> Download Manifest
            </Button>
            {isAdminOrHODOrHR && (
              <Button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" /> Deploy Exam
              </Button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-[2rem] bg-card" />
            ))
          ) : (
            [
              { label: "NEXT DEPLOYMENT", value: statsData?.nextExamDate ? dayjs(statsData.nextExamDate).format('DD MMM YYYY') : 'N/A', icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "ACTIVE MODULES", value: statsData?.activeExamsCount || 0, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "MISSION STATUS", value: statsData?.currentStatus || "NO ACTIVE EXAMS", icon: CheckCircle2, color: "text-white", bg: "bg-slate-900" },
            ].map((stat, i) => (
              <Card key={i} className={cn("rounded-[2rem] border border-border p-8 shadow-xl", i === 2 ? "bg-slate-900" : "bg-card")}>
                <div className="flex items-center gap-6">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                    <stat.icon className={cn("h-7 w-7", stat.color)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <p className={cn("text-xl font-black uppercase tracking-tight", stat.color === 'text-white' ? 'text-white' : 'text-white')}>{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Date Sheet Table */}
        <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-border bg-slate-900/30 px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Deployment Schedule</CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Synchronized Examination Timeline</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="FILTER SCHEDULE..." 
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
              data={filteredDateSheet}
              isLoading={dateSheetLoading}
              columns={[
                { 
                  key: 'date', 
                  label: 'TIMELINE', 
                  render: (v) => (
                    <div className="flex items-center gap-4 py-1">
                      <div className="bg-slate-950 border border-slate-900 px-3 py-2 rounded-xl text-center min-w-[70px] shadow-inner">
                        <span className="block text-[10px] font-black text-blue-500 uppercase tracking-tighter">
                          {dayjs(v).format('MMM')}
                        </span>
                        <span className="block text-xl font-black text-white leading-none">
                          {dayjs(v).format('DD')}
                        </span>
                      </div>
                      <span className="font-black text-[10px] text-slate-500 uppercase tracking-widest">{dayjs(v).format('dddd')}</span>
                    </div>
                  )
                },
                { 
                      key: 'course',
                      label: 'COURSE',
                      render: (v) => <span className="font-black text-white text-xs tracking-tight uppercase">{v?.name || 'N/A'}</span>,
                },
                { 
                      key: 'subject',
                      label: 'SUBJECT',
                      render: (v) => (
                        <div className="flex flex-col py-2">
                          <span className="font-black text-white text-xs tracking-tight uppercase">{v?.name || 'N/A'}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{v?.code || ''}</span>
                        </div>
                      ),
                },
                { 
                      key: 'name',
                      label: 'EXAM',
                      render: (v) => <span className="font-black text-white text-xs tracking-tight uppercase">{v || 'N/A'}</span>,
                },
                { 
                      key: 'semester',
                      label: 'SEM',
                      render: (v) => <Badge className="bg-slate-950 text-slate-400 border border-border rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest">Sem {v}</Badge>,
                    },
                    { 
                      key: 'maxMarks',
                      label: 'MAX MARKS',
                      render: (v) => <span className="font-black text-blue-400 text-xs uppercase tracking-widest">{v ?? 'N/A'}</span>,
                },
                {
                  key: 'actions',
                  label: 'ACTIONS',
                  render: (_, row) => (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900"
                        onClick={() => openEditModal(row)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
                        onClick={() => handleDeleteExam(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </CardContent>
        </Card>

        {/* Important Instructions for Students & Faculty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-blue-600 text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Student Protocol</h3>
              <ul className="space-y-4 font-bold text-blue-50 text-sm uppercase tracking-wide">
                {[
                  "CARRY VALID HALL TICKET & BIOMETRIC ID.",
                  "REPORT TO SECTOR 30 MINS BEFORE DEPLOYMENT.",
                  "ELECTRONIC GADGETS ARE STRICTLY PROHIBITED."
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 text-[10px] font-black tracking-tighter">{i+1}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border border-border bg-card text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 bg-blue-600/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Faculty Guidelines</h3>
              <ul className="space-y-4 font-bold text-slate-400 text-sm uppercase tracking-wide">
                {[
                  "COLLECT ASSETS 45 MINS BEFORE SESSION.",
                  "VERIFY IDENTITY & BIOMETRICS AT GATE.",
                  "SUBMIT SEALED BUNDLES TO COMMAND POST."
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-start group-hover:text-slate-200 transition-colors">
                    <span className="h-6 w-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-[10px] font-black tracking-tighter text-blue-500 shadow-inner">{i+1}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Exam Add/Edit Modal */}
      <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              {editingExam ? 'Edit Exam Details' : 'Deploy New Exam'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              Configure examination logistics and timeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exam Date</Label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Semester</Label>
                <Input 
                  type="number"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Course Name</Label>
              <Input 
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                placeholder="E.G. B.TECH CSE"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Name</Label>
                <Input 
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                  placeholder="E.G. DBMS"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Code</Label>
                <Input 
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                  placeholder="E.G. CSE-203"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exam Name</Label>
                <Input 
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                  placeholder="E.G. MID-SEMESTER"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Marks</Label>
                <Input 
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                  className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExamModalOpen(false)} className="rounded-xl border-border uppercase font-black text-[10px] tracking-widest">Cancel</Button>
            <Button onClick={handleSaveExam} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl uppercase font-black text-[10px] tracking-widest">
              {editingExam ? 'Save Changes' : 'Deploy Exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
