"use client";

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, extractList, extractData } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Calendar,
  FileText,
  Clock,
  Activity,
  GraduationCap,
  BookOpen,
  CreditCard,
  Bell,
  TrendingUp,
  Search,
  Plus,
  ArrowUpRight,
  Eye,
  ClipboardList,
  BarChart3,
  MapPin,
  Timer,
  Pencil,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { dashboardApi, examApi, announcementApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default function DashboardPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'student';
  const router = useRouter();

  const { data: stats, loading: statsLoading } = useFetch<any>(
    (userRole === 'student') ? () => dashboardApi.getStudentDashboard(user?.id || '') : dashboardApi.getStats,
    { immediate: !!user }
  );
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr';
  const isAdminOrHODOrHR = userRole === 'admin' || userRole === 'hod' || userRole === 'hr';
  const isStaffOrAbove = ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff'].includes(userRole);
  const { data: trends, loading: trendsLoading } = useFetch<any>(dashboardApi.getTrends, { immediate: userRole !== 'student' });
  const { data: recentAdmissions, loading: admissionsLoading } = useFetch<any[]>(dashboardApi.getRecentAdmissions, { immediate: userRole !== 'student' });
  const { data: upcomingExams, loading: examsLoading } = useFetch<any[]>(examApi.getUpcoming, { immediate: true });
  const { data: announcements, loading: announcementsLoading } = useFetch<any[]>(announcementApi.getAll, { immediate: true });

  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<any>(null);

  const [timetable, setTimetable] = useState([
    { id: 1, name: "Lecture 1", time: "10:00 AM - 10:50 AM", subject: "Engineering Mathematics", room: "Room 101", type: "Lecture" },
    { id: 2, name: "Lecture 2", time: "11:00 AM - 11:50 AM", subject: "Data Structures", room: "Lab 2", type: "Practical" },
    { id: 3, name: "Lecture 3", time: "12:00 PM - 12:50 PM", subject: "Computer Networks", room: "Room 203", type: "Lecture" },
    { id: 4, name: "Lecture 4", time: "01:00 PM - 01:50 PM", subject: "Operating Systems", room: "Room 105", type: "Lecture" },
    { id: 5, name: "Lecture 5", time: "02:00 PM - 02:50 PM", subject: "Database Management", room: "Lab 1", type: "Practical" },
    { id: 6, name: "Lecture 6", time: "03:00 PM - 03:50 PM", subject: "Software Engineering", room: "Room 302", type: "Lecture" },
    { id: 7, name: "Lecture 7", time: "04:00 PM - 04:50 PM", subject: "Cyber Security", room: "Room 201", type: "Lecture" },
    { id: 8, name: "Lecture 8", time: "05:00 PM - 05:50 PM", subject: "Artificial Intelligence", room: "Room 404", type: "Lecture" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    time: "",
    room: "",
    type: "Lecture"
  });

  const handleAddEditLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLecture) {
      setTimetable(prev => prev.map(l => l.id === editingLecture.id ? { ...l, ...formData } : l));
      toast.success("Lecture updated successfully");
    } else {
      const newId = timetable.length > 0 ? Math.max(...timetable.map(l => l.id)) + 1 : 1;
      setTimetable(prev => [...prev, { id: newId, ...formData }]);
      toast.success("Lecture added successfully");
    }
    setIsManageModalOpen(false);
    setEditingLecture(null);
    setFormData({ name: "", subject: "", time: "", room: "", type: "Lecture" });
  };

  const deleteLecture = (id: number) => {
    setTimetable(prev => prev.filter(l => l.id !== id));
    toast.success("Lecture deleted successfully");
  };

  const openEditModal = (lecture: any) => {
    setEditingLecture(lecture);
    setFormData({
      name: lecture.name,
      subject: lecture.subject,
      time: lecture.time,
      room: lecture.room,
      type: lecture.type
    });
    setIsManageModalOpen(true);
  };

  const openAddModal = () => {
    setEditingLecture(null);
    setFormData({
      name: `Lecture ${timetable.length + 1}`,
      subject: "",
      time: "09:00 AM - 09:50 AM",
      room: "",
      type: "Lecture"
    });
    setIsManageModalOpen(true);
  };

  const statsData = useMemo(() => extractData<Record<string, any>>(stats), [stats]);
  const trendsData = useMemo(() => extractData<Record<string, any>>(trends), [trends]);
  const admissionsList = useMemo(() => extractList<Record<string, any>>(recentAdmissions), [recentAdmissions]);
  const examsList = useMemo(() => extractList<Record<string, any>>(upcomingExams), [upcomingExams]);
  const announcementsList = useMemo(() => extractList<Record<string, any>>(announcements), [announcements]);
  const safeAdmissionTrends = useMemo(
    () =>
      Array.isArray(trendsData?.admissionTrends) && trendsData.admissionTrends.length
        ? trendsData.admissionTrends
        : [
            { year: "2022", students: 180 },
            { year: "2023", students: 220 },
            { year: "2024", students: 265 },
            { year: "2025", students: 310 },
          ],
    [trendsData]
  );
  const safeFeeCollection = useMemo(
    () =>
      Array.isArray(trendsData?.feeCollection) && trendsData.feeCollection.length
        ? trendsData.feeCollection
        : [
            { month: "Jan", amount: 12 },
            { month: "Feb", amount: 15 },
            { month: "Mar", amount: 18 },
            { month: "Apr", amount: 14 },
          ],
    [trendsData]
  );

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  const chartConfig = {
    admissions: {
      label: "Admissions",
      color: "hsl(var(--primary))",
    },
    attendance: {
      label: "Attendance %",
      color: "#10b981",
    },
    fees: {
      label: "Fees Collected",
      color: "#f59e0b",
    }
  };

  const dashboardStats = useMemo(() => {
    if (userRole === 'student') {
      return [
        { title: "MY ATTENDANCE", value: (statsData?.attendance || 0) + "%", icon: Activity, trend: statsData?.attendanceTrend || "0%", desc: "Lecture presence", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "PENDING FEES", value: "₹" + (statsData?.pendingFees || 0), icon: CreditCard, trend: "Due soon", desc: "Next payment", color: "text-rose-500", bg: "bg-rose-500/10" },
        { title: "BOOKS ISSUED", value: statsData?.issuedBooks || 0, icon: BookOpen, trend: statsData?.overdueBooks ? `${statsData.overdueBooks} Overdue` : "On time", desc: "Library status", color: "text-amber-500", bg: "bg-amber-500/10" },
        { title: "TOTAL CREDITS", value: statsData?.credits || 0, icon: GraduationCap, trend: "This sem", desc: "Academic progress", color: "text-blue-500", bg: "bg-blue-500/10" },
      ];
    }
    return [
      { title: "ENROLLED STUDENTS", value: statsData?.totalStudents || 0, icon: GraduationCap, trend: statsData?.studentTrend || "0%", desc: "Active this session", color: "text-blue-500", bg: "bg-blue-500/10" },
      { title: "ACADEMIC FACULTY", value: statsData?.totalFaculty || 0, icon: Users, trend: statsData?.facultyTrend || "0", desc: "Expert mentors", color: "text-purple-500", bg: "bg-purple-500/10" },
      { title: "ACTIVE COURSES", value: statsData?.totalCourses || 0, icon: BookOpen, trend: "Stable", desc: "Diverse programs", color: "text-amber-500", bg: "bg-amber-500/10" },
      { title: "AVG ATTENDANCE", value: (statsData?.todayAttendance || 0) + "%", icon: Activity, trend: statsData?.attendanceTrend || "0%", desc: "Daily presence", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];
  }, [userRole, statsData]);

  return (
    <div className="space-y-8 pb-10 bg-background">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-card p-8 md:p-12 text-card-foreground shadow-2xl border border-border">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-2xl text-center md:text-left">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                {greeting}, <span className="text-blue-500">{user?.name?.split(' ')[0] || 'Scholar'}!</span> 👋
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium">
                Access your academic universe. System is fully operational and synchronized.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button 
                onClick={() => setIsTimetableOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-2xl px-8 py-7 h-auto font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
              >
                TIMETABLE
              </Button>
              
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-700" />
            <Avatar className="h-40 w-40 md:h-52 md:w-52 border-[6px] border-slate-900 shadow-2xl relative z-10 rounded-[3rem]">
              <AvatarImage src={user?.profilePicture || ''} alt={user?.name} className="object-cover" />
              <AvatarFallback className="text-5xl font-black bg-slate-950 text-blue-500">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* College Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
              <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
          ))
        ) : (
          dashboardStats.map((stat, i) => (
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg tracking-widest uppercase">
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</h3>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{stat.desc}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
          <CardHeader className="px-0 pt-0 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" /> Admission Growth
                </CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Institutional Expansion Metrics</CardDescription>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {trendsLoading ? (
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={safeAdmissionTrends}>
                  <defs>
                    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    xAxisId={0}
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                    dy={10}
                  />
                  <YAxis 
                    yAxisId={0}
                    width={40}
                    orientation="left"
                    type="number"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorAdmissions)" 
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>

        </Card>

        <Card className="rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
          <CardHeader className="px-0 pt-0 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500" /> Revenue Stream
                </CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Monthly Financial Collection</CardDescription>
              </div>
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={safeFeeCollection}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  xAxisId={0}
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                  dy={10}
                />
                <YAxis 
                  yAxisId={0}
                  width={40}
                  orientation="left"
                  type="number"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="amount" 
                  fill="#f59e0b" 
                  radius={[10, 10, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Admissions & Updates */}
        <div className="lg:col-span-2 space-y-8">
          {isStaffOrAbove && (
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 px-8 py-6">
                <div>
                  <CardTitle className="text-2xl font-bold text-black">Recent Admissions</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Latest student registrations</CardDescription>
                </div>
                <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl">
                  View All Students <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 text-black">
                    <DataTable<Record<string, any>>
                      data={admissionsList}
                      isLoading={admissionsLoading}
                      columns={[
                        { 
                          key: 'name', 
                          label: 'Student Name', 
                          render: (v, row) => {
                            const displayName = typeof v === 'object' ? (v?.name || v?.username || 'N/A') : (v || 'N/A');
                            return (
                              <div className="flex items-center gap-3 py-1">
                                <Avatar className="h-10 w-10 border-2 border-slate-100">
                                  <AvatarFallback className="bg-slate-100 text-slate-800 font-bold text-xs">
                                    {String(displayName).substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-black">{String(displayName)}</span>
                              </div>
                            );
                          }
                        },
                        { 
                          key: 'course', 
                          label: 'Course',
                          render: (v) => {
                            const name = typeof v === 'object' ? (v?.name || v?.code || 'N/A') : (v || 'N/A');
                            return <span className="font-bold text-black uppercase text-xs">{String(name)}</span>;
                          }
                        },
                        { 
                          key: 'date', 
                          label: 'Admission Date', 
                          render: (v) => <span className="text-slate-500 font-medium">{dayjs(v).isValid() ? dayjs(v).format('DD MMM YYYY') : 'N/A'}</span> 
                        },
                        { 
                          key: 'status', 
                          label: 'Status', 
                          render: (v) => {
                            const status = String(v || 'Pending');
                            return (
                              <Badge className={status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                                {status}
                              </Badge>
                            );
                          }
                        },
                      ]}
                    />
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Panel */}
          {isStaffOrAbove && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Admission', icon: Plus, color: 'bg-blue-600', href: '/students', roles: ['admin', 'hr', 'hod'] },
                { label: 'Attendance', icon: Calendar, color: 'bg-emerald-600', href: '/attendance', roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor'] },
                { label: 'Fee Receipt', icon: CreditCard, color: 'bg-black', href: '/fees', roles: ['admin', 'hr', 'staff'] },
                { label: 'Add Exam', icon: ClipboardList, color: 'bg-purple-600', href: '/exams', roles: ['admin', 'hr', 'hod'] },
              ].filter(action => action.roles.includes(userRole)).map((action, i) => (
                <Link key={i} href={action.href || '#'}>
                  <div className="group flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-50">
                    <div className={`h-14 w-14 rounded-2xl ${action.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-7 w-7" />
                    </div>
                    <span className="font-bold text-black text-sm">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Calendar & Upcoming Exams */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b px-6 py-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-black">
                <Bell className="h-5 w-5 text-amber-500" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {announcementsLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
              ) : announcementsList.length ? (
                announcementsList.slice(0, 3).map((item: any, i) => {
                  const title = typeof item.title === 'object' ? (item.title?.name || item.title?.text) : (item.title || item.subject || 'Announcement');
                  const type = typeof item.type === 'object' ? (item.type?.name || item.type?.label) : (item.type || item.targetAudience?.[0] || 'Update');
                  return (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                      <div>
                        <h4 className="font-bold text-black group-hover:text-blue-600 transition-colors">{String(title)}</h4>
                        <p className="text-sm text-slate-500 font-medium">{dayjs(item.createdAt).fromNow()}</p>
                        <Badge variant="outline" className="mt-2 text-[10px] py-0 px-2 uppercase tracking-wider font-bold text-slate-600 border-slate-300">{String(type)}</Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 font-medium text-center py-4">No recent announcements</p>
              )}
              <Button variant="outline" className="w-full mt-4 rounded-xl font-bold border-2 border-slate-200 hover:bg-slate-50 text-white">
                View All Announcements
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b px-6 py-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-black">
                <ClipboardList className="h-5 w-5 text-blue-500" /> Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {examsLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
              ) : examsList.length ? (
                examsList.map((exam: any, i) => {
                  const subject = typeof exam.subject === 'object' ? (exam.subject?.name || 'N/A') : (exam.subject || 'N/A');
                  const time = typeof exam.time === 'object' ? (exam.time?.start || 'N/A') : (exam.time || 'N/A');
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-default group">
                      <div className="flex flex-col">
                        <span className="font-bold text-black group-hover:text-blue-700 transition-colors">{String(subject)}</span>
                        <span className="text-xs text-slate-500 font-medium">{String(time)}</span>
                      </div>
                      <div className="bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-200 text-center min-w-[60px]">
                        <span className="block text-xs font-bold text-blue-600 uppercase tracking-tighter">
                          {dayjs(exam.date).isValid() ? dayjs(exam.date).format('MMM') : 'N/A'}
                        </span>
                        <span className="block text-lg font-extrabold text-black leading-none">
                          {dayjs(exam.date).isValid() ? dayjs(exam.date).format('DD') : '??'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 font-medium text-center py-4">No upcoming exams</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timetable Dialog */}
      <Dialog open={isTimetableOpen} onOpenChange={setIsTimetableOpen}>
        <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 p-0 overflow-hidden rounded-[2.5rem]">
          <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Academic Schedule</DialogTitle>
                <DialogDescription className="text-blue-100 font-bold uppercase text-xs tracking-[0.2em] mt-2">
                  Daily Lecture Timeline • 50m Sessions • 10m Intervals
                </DialogDescription>
              </DialogHeader>
              <Button 
                onClick={openAddModal}
                className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-black text-xs uppercase tracking-widest px-6 py-4 h-auto shadow-xl transition-all hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Lecture
              </Button>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                <Timer className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Campus Doors Open</p>
                  <p className="text-sm font-bold text-white uppercase">Reporting Time: 09:30 AM</p>
                </div>
              </div>

              <div className="grid gap-4">
                {timetable.map((lecture, idx) => (
                  <div key={lecture.id}>
                    <div className="group relative flex items-center gap-6 p-5 rounded-[1.5rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-blue-500/50 hover:bg-slate-900">
                      <div className="flex flex-col items-center justify-center min-w-[80px] h-20 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner group-hover:border-blue-500/30 transition-colors">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Start</span>
                        <span className="text-lg font-black text-white">{lecture.time.split(' - ')[0]}</span>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                            lecture.type === 'Practical' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          )}>
                            {lecture.name}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lecture.type}</span>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-tight">{lecture.subject}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lecture.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">50 Minutes</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => openEditModal(lecture)}
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 text-slate-500 transition-all"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => deleteLecture(lecture.id)}
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-col items-center justify-center min-w-[80px] h-20 rounded-2xl bg-slate-950/30 border border-slate-800/50">
                        <span className="text-[10px] font-black text-slate-700 uppercase">End</span>
                        <span className="text-lg font-black text-slate-400">{lecture.time.split(' - ')[1]}</span>
                      </div>
                    </div>

                    {idx < timetable.length - 1 && (
                      <div className="flex items-center gap-4 px-10 py-2">
                        <div className="h-8 w-[2px] bg-gradient-to-b from-blue-500/50 to-transparent ml-10" />
                        <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full">
                          <Timer className="h-3 w-3 text-amber-500" />
                          <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.2em]">10 Min Transition Gap</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {timetable.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No lectures scheduled yet.</p>
                    <Button onClick={openAddModal} variant="link" className="text-blue-500 font-black mt-2">ADD YOUR FIRST LECTURE</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Lecture Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-800 p-0 overflow-hidden rounded-[2.5rem]">
          <div className="bg-slate-900 p-8 border-b border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">
                {editingLecture ? 'Update Lecture' : 'Add New Lecture'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                Configure your academic session details
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleAddEditLecture} className="p-8 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lecture Identity</Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Lecture 1"
                  className="bg-slate-900 border-slate-800 h-12 rounded-xl text-white font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Name</Label>
                <Input 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g., Data Structures"
                  className="bg-slate-900 border-slate-800 h-12 rounded-xl text-white font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time Slot</Label>
                  <Input 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    placeholder="10:00 AM - 10:50 AM"
                    className="bg-slate-900 border-slate-800 h-12 rounded-xl text-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Venue / Room</Label>
                  <Input 
                    value={formData.room}
                    onChange={e => setFormData({...formData, room: e.target.value})}
                    placeholder="Room 101"
                    className="bg-slate-900 border-slate-800 h-12 rounded-xl text-white font-bold"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={v => setFormData({...formData, type: v})}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-800 h-12 rounded-xl text-white font-bold">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="Lecture">Lecture</SelectItem>
                    <SelectItem value="Practical">Practical</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsManageModalOpen(false)}
                className="flex-1 h-12 rounded-xl border-slate-800 font-bold uppercase text-xs tracking-widest text-slate-400"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20"
              >
                {editingLecture ? 'Update Lecture' : 'Save Lecture'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
