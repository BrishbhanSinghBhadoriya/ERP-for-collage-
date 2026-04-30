"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, extractList } from '@/lib/utils';
import { 
  BookOpen, 
  Plus, 
  ChevronRight, 
  Users, 
  Clock, 
  Layers,
  GraduationCap
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

import { academicsApi, announcementApi } from '@/services/api';
import api from '@/lib/api';
import { useFetch } from '@/hooks/use-fetch';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/auth/role-guard';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function AcademicsPage() {
  const { user } = useAuth();
  const isAdminOrHODOrHR = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'hr';
  const { data: courses, loading: isLoading } = useFetch<any[]>(academicsApi.getCourseStats);
  const { data: bulletins, loading: bulletinsLoading, execute: refetchBulletins } = useFetch<any[]>(announcementApi.getAll);

  const [bulletinOverrides, setBulletinOverrides] = useState<any[]>([]);
  const [deptOverrides, setDeptOverrides] = useState<any[]>([]);
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [isDeptEditModalOpen, setIsDeptEditModalOpen] = useState(false);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);

  const [newBulletin, setNewBulletin] = useState({ title: '', type: 'Academic' });
  const [editingDept, setEditingDept] = useState<any>(null);
  const [newDept, setNewDept] = useState({ key: '', name: '', about: '', programs: '', keywords: '' });

  const courseList = useMemo(() => extractList<Record<string, any>>(courses), [courses]);
  
  const bulletinList = useMemo(() => {
    const base = extractList<Record<string, any>>(bulletins);
    return [...bulletinOverrides, ...base];
  }, [bulletins, bulletinOverrides]);

  const [selectedDeptKey, setSelectedDeptKey] = useState<string>('');
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);

  const initialDepartments = [
    {
      key: 'cse',
      name: 'Computer Science & Engineering (CSE)',
      about:
        'Software engineering, systems, cloud, and modern computing foundations. Ideal for product, full‑stack, and system roles.',
      programs: ['B.Tech (CSE)', 'BCA', 'MCA'],
      keywords: ['cse', 'computer', 'software', 'programming', 'coding', 'ai', 'ml'],
    },
    {
      key: 'it',
      name: 'Information Technology (IT)',
      about:
        'Enterprise IT, networking, database systems, and infrastructure operations. Focused on deployment, security, and support.',
      programs: ['B.Tech (IT)', 'BSc (IT)'],
      keywords: ['it', 'network', 'database', 'infrastructure', 'security'],
    },
    {
      key: 'aids',
      name: 'Artificial Intelligence & Data Science (AI-DS)',
      about:
        'Data engineering, analytics, ML pipelines, and model deployment. Strong focus on statistics and real‑world datasets.',
      programs: ['B.Tech (AI-DS)', 'MSc (Data Science)'],
      keywords: ['ai', 'aids', 'data', 'datascience', 'ml', 'analytics'],
    },
    {
      key: 'ece',
      name: 'Electronics & Communication Engineering (ECE)',
      about:
        'Electronics, communication systems, embedded fundamentals, and signal processing. Strong base for telecom and embedded roles.',
      programs: ['B.Tech (ECE)'],
      keywords: ['ece', 'electronics', 'communication', 'embedded', 'signal', 'iot'],
    },
    {
      key: 'me',
      name: 'Mechanical Engineering (ME)',
      about:
        'Manufacturing, design, thermodynamics, and industrial engineering. Suitable for production and automotive domains.',
      programs: ['B.Tech (ME)', 'Diploma (ME)'],
      keywords: ['mechanical', 'me', 'manufacturing', 'design', 'automotive'],
    },
    {
      key: 'ce',
      name: 'Civil Engineering (CE)',
      about:
        'Structural design, construction technology, and project planning. Focus on real infrastructure and site practices.',
      programs: ['B.Tech (CE)', 'Diploma (CE)'],
      keywords: ['civil', 'ce', 'construction', 'structure', 'survey'],
    },
    {
      key: 'ee',
      name: 'Electrical Engineering (EE)',
      about:
        'Power systems, machines, and industrial electrical. Strong foundation for utilities and electrical maintenance roles.',
      programs: ['B.Tech (EE)', 'Diploma (EE)'],
      keywords: ['electrical', 'ee', 'power', 'machines', 'grid'],
    },
    {
      key: 'mgmt',
      name: 'Management (BBA/MBA)',
      about:
        'Business operations, finance, marketing, HR, and analytics. Designed for leadership and professional roles.',
      programs: ['BBA', 'MBA'],
      keywords: ['management', 'bba', 'mba', 'marketing', 'finance', 'hr'],
    },
    {
      key: 'commerce',
      name: 'Commerce (B.Com/M.Com)',
      about:
        'Accounting, taxation, auditing, and business studies. Strong career path for corporate finance and accounts.',
      programs: ['B.Com', 'M.Com'],
      keywords: ['commerce', 'bcom', 'mcom', 'account', 'tax', 'audit'],
    },
    {
      key: 'pharmacy',
      name: 'Pharmacy (D.Pharm/B.Pharm)',
      about:
        'Pharmaceutical sciences, dispensing, and clinical basics. Focus on compliance and professional practice.',
      programs: ['D.Pharm', 'B.Pharm'],
      keywords: ['pharmacy', 'pharm', 'drug', 'clinical', 'medicine'],
    },
  ];

  const departments = useMemo(() => {
    const base = [...initialDepartments];
    deptOverrides.forEach(over => {
      const idx = base.findIndex(d => d.key === over.key);
      if (idx > -1) base[idx] = { ...base[idx], ...over };
      else base.push(over);
    });
    return base;
  }, [deptOverrides]);

  const selectedDept = useMemo(
    () => departments.find((d) => d.key === selectedDeptKey) || null,
    [departments, selectedDeptKey]
  );

  const selectedDeptBulletins = useMemo(() => {
    if (!selectedDept) return bulletinList.slice(0, 3);
    const keywords = selectedDept.keywords.map((k) => String(k).toLowerCase());
    const filtered = bulletinList.filter((b: any) => {
      const hay = `${b?.title ?? b?.subject ?? ''} ${b?.type ?? b?.targetAudience?.join(' ') ?? ''} ${b?.body ?? ''}`.toLowerCase();
      return keywords.some((k) => hay.includes(k));
    });
    return (filtered.length ? filtered : bulletinList).slice(0, 5);
  }, [selectedDept, bulletinList]);

  const deptList = useMemo(
    () => departments.map(d => ({ key: d.key, name: d.name })),
    [departments]
  );

  const handleAddBulletin = async () => {
    if (!newBulletin.title) return;
    try {
      await announcementApi.create({
        subject: newBulletin.title,
        body: 'Academic notification',
        targetAudience: ['student', 'faculty'],
        publishedDate: new Date().toISOString(),
        expiryDate: dayjs().add(30, 'day').toISOString(),
        type: newBulletin.type
      });
      toast.success('Bulletin added successfully');
      refetchBulletins();
      setIsBulletinModalOpen(false);
      setNewBulletin({ title: '', type: 'Academic' });
    } catch (err: any) {
      toast.error('Error adding bulletin');
    }
  };

  const handleEditDept = async () => {
    if (!editingDept) return;
    try {
      await api.put(`/api/settings/dept_${editingDept.key}`, { value: editingDept });
      toast.success('Department updated successfully');
      setIsDeptEditModalOpen(false);
    } catch (err: any) {
      toast.error('Error updating department');
    }
  };

  const handleAddDept = async () => {
    if (!newDept.name || !newDept.key) return;
    try {
      const dept = {
        ...newDept,
        programs: newDept.programs.split(',').map(p => p.trim()).filter(Boolean),
        keywords: newDept.keywords.split(',').map(k => k.trim()).filter(Boolean)
      };
      await api.put(`/api/settings/dept_${newDept.key}`, { value: dept });
      toast.success('Department added successfully');
      setIsAddDeptModalOpen(false);
      setNewDept({ key: '', name: '', about: '', programs: '', keywords: '' });
    } catch (err: any) {
      toast.error('Error adding department');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff', 'student']}>
      <div className="space-y-8 pb-10 bg-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
              <BookOpen className="h-10 w-10 text-indigo-500" />
              Curriculum Hub
            </h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Academic Architecture & Program Management</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdminOrHODOrHR && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsAddDeptModalOpen(true)}
                  variant="outline"
                  className="rounded-2xl border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 font-black text-xs h-12 px-6 uppercase tracking-widest"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Dept
                </Button>
               
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-24 w-full" />
              </Card>
            ))
          ) : (
            courseList.map((course: any) => (
              <Card key={course.id} className={cn(
                "rounded-[2.5rem] border-l-[12px] bg-card shadow-2xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-2 overflow-hidden border-y border-r border-border",
                course.color || 'border-l-indigo-500'
              )}>
                <CardHeader className="pb-4 pt-8 px-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-3 uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 border-slate-800">
                        {course.code}
                      </Badge>
                      <CardTitle className="text-2xl font-black text-white tracking-tight">{course.name?.toUpperCase()}</CardTitle>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors shadow-inner">
                      <Layers className="h-7 w-7" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="grid grid-cols-3 gap-6 mt-4">
                    {[
                      { label: "DURATION", value: course.durationYears ?? course.duration ?? 'N/A', icon: Clock },
                      { label: "STUDENTS", value: course.totalStudents || 0, icon: Users },
                      { label: "SUBJECTS", value: course.totalSubjects || 0, icon: BookOpen },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          <item.icon className="h-3 w-3" /> {item.label}
                        </div>
                        <p className="text-sm font-black text-white uppercase">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-slate-900 flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-card bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {i}
                        </div>
                      ))}
                      <div className="h-8 w-8 rounded-full border-2 border-card bg-indigo-500/10 flex items-center justify-center text-[8px] font-black text-indigo-500">
                        +12
                      </div>
                    </div>
                    <Button variant="ghost" className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 group">
                      View Curriculum <ChevronRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="rounded-[2.5rem] border border-border bg-card shadow-2xl lg:col-span-1 overflow-hidden">
          <CardHeader className="bg-slate-900/30 border-b border-border p-8">
            <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Departments</CardTitle>
            <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Institutional Divisions</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {deptList.map((dept, i) => (
              <div
                key={dept.key}
                onClick={() => {
                  setSelectedDeptKey(dept.key);
                  setDeptDialogOpen(true);
                }}
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900 transition-all cursor-pointer group",
                  selectedDeptKey === dept.key && "border-indigo-500/50 bg-slate-900"
                )}
              >
                <span className="font-black text-slate-300 group-hover:text-white uppercase text-xs tracking-widest">{dept.name}</span>
                <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border border-border bg-card shadow-2xl lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-slate-900/30 border-b border-border p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Academic Bulletin</CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Live Updates & Notifications</CardDescription>
              </div>
              {isAdminOrHODOrHR && (
                <Button 
                  onClick={() => setIsBulletinModalOpen(true)}
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 text-indigo-500"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {bulletinsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
            ) : bulletinList.length ? (
              bulletinList.slice(0, 3).map((item: any, i) => (
                <div key={i} className="space-y-2 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.type || item.targetAudience?.[0] || 'Academic'}</span>
                    <span className="text-[10px] font-bold text-slate-500">{dayjs(item.createdAt).fromNow()}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-200 group-hover:text-white transition-colors uppercase leading-tight">{item.title || item.subject}</h4>
                  <div className="h-1 w-0 group-hover:w-full bg-indigo-500/50 transition-all duration-500 rounded-full" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-bold text-center py-4 uppercase">No recent bulletins</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
        <DialogContent className="max-w-3xl bg-card border-border shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="px-8 pt-8 pb-5 border-b border-border/50 bg-slate-900/20">
            <div className="flex justify-between items-center pr-8">
              <div>
                <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                  {selectedDept?.name || 'Department'}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                  Department information & bulletins
                </DialogDescription>
              </div>
              {isAdminOrHODOrHR && (
                <Button 
                  onClick={() => {
                    setEditingDept({
                      ...selectedDept,
                      programs: selectedDept?.programs?.join(', '),
                      keywords: selectedDept?.keywords?.join(', ')
                    });
                    setIsDeptEditModalOpen(true);
                  }}
                  variant="outline" 
                  className="rounded-xl border-border h-10 px-4 font-black text-[10px] uppercase tracking-widest text-indigo-400"
                >
                  Edit Dept
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-[1.5rem] border border-border bg-slate-950/50">
                <CardHeader className="p-5">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">About</CardTitle>
                  <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                    Overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 text-sm text-slate-300 font-bold leading-relaxed">
                  {selectedDept?.about || '—'}
                </CardContent>
              </Card>

              <Card className="rounded-[1.5rem] border border-border bg-slate-950/50 md:col-span-2">
                <CardHeader className="p-5">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Programs</CardTitle>
                  <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                    Professional courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {(selectedDept?.programs || []).map((p: string) => (
                      <Badge key={p} className="bg-slate-900 text-slate-300 border border-border rounded-lg font-black text-[10px] uppercase tracking-widest">
                        {p}
                      </Badge>
                    ))}
                    {!selectedDept?.programs?.length && (
                      <span className="text-xs text-slate-500 font-bold uppercase">No programs</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[2rem] border border-border bg-slate-950/40 overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-slate-900/20 px-6 py-6">
                <CardTitle className="text-base font-black text-white uppercase tracking-wider">
                  Bulletins
                </CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                  {selectedDept ? 'Filtered for department (fallback: recent)' : 'Recent updates'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {bulletinsLoading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                ) : selectedDeptBulletins.length ? (
                  selectedDeptBulletins.map((item: any, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.type || item.targetAudience?.[0] || 'Academic'}</span>
                        <span className="text-[10px] font-bold text-slate-500">{dayjs(item.createdAt).fromNow()}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-200 uppercase leading-tight">{item.title || item.subject}</h4>
                      <div className="h-px w-full bg-border/50" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-bold text-center py-4 uppercase">No bulletins</p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulletin Modal */}
      <Dialog open={isBulletinModalOpen} onOpenChange={setIsBulletinModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Add Bulletin</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">New academic notification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bulletin Title</Label>
              <Input 
                value={newBulletin.title}
                onChange={(e) => setNewBulletin({ ...newBulletin, title: e.target.value })}
                className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                placeholder="E.G. SEMESTER REGISTRATION OPEN"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</Label>
              <Input 
                value={newBulletin.type}
                onChange={(e) => setNewBulletin({ ...newBulletin, type: e.target.value })}
                className="bg-slate-950 border-border rounded-xl font-bold text-white uppercase text-xs"
                placeholder="E.G. ACADEMIC, EXAM, EVENT"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulletinModalOpen(false)} className="rounded-xl border-border uppercase font-black text-[10px] tracking-widest">Cancel</Button>
            <Button onClick={handleAddBulletin} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl uppercase font-black text-[10px] tracking-widest">Add Bulletin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dept Add Modal */}
      <Dialog open={isAddDeptModalOpen} onOpenChange={setIsAddDeptModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Add Department</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Create new academic division</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key (Code)</Label>
                <Input value={newDept.key} onChange={(e) => setNewDept({ ...newDept, key: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs" placeholder="CSE" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</Label>
                <Input value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs" placeholder="COMPUTER SCIENCE..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About</Label>
              <Textarea value={newDept.about} onChange={(e) => setNewDept({ ...newDept, about: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs h-24" placeholder="DESCRIPTION..." />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Programs (Comma Separated)</Label>
              <Input value={newDept.programs} onChange={(e) => setNewDept({ ...newDept, programs: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs" placeholder="B.TECH, BCA, MCA..." />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keywords (Comma Separated)</Label>
              <Input value={newDept.keywords} onChange={(e) => setNewDept({ ...newDept, keywords: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs" placeholder="CSE, SOFTWARE..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDeptModalOpen(false)} className="rounded-xl border-border uppercase font-black text-[10px] tracking-widest">Cancel</Button>
            <Button onClick={handleAddDept} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl uppercase font-black text-[10px] tracking-widest">Create Dept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dept Edit Modal */}
      <Dialog open={isDeptEditModalOpen} onOpenChange={setIsDeptEditModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit Department</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Update division details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</Label>
              <Input value={editingDept?.name} onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About</Label>
              <Textarea value={editingDept?.about} onChange={(e) => setEditingDept({ ...editingDept, about: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs h-24" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Programs (Comma Separated)</Label>
              <Input value={editingDept?.programs} onChange={(e) => setEditingDept({ ...editingDept, programs: e.target.value })} className="bg-slate-950 border-border rounded-xl text-white uppercase text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeptEditModalOpen(false)} className="rounded-xl border-border uppercase font-black text-[10px] tracking-widest">Cancel</Button>
            <Button onClick={handleEditDept} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl uppercase font-black text-[10px] tracking-widest">Update Dept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </RoleGuard>
);
}
