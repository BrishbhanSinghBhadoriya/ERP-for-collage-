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
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
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
              <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-2xl px-8 py-7 h-auto font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
                TIMETABLE
              </Button>
              <Button variant="outline" className="border-2 border-border bg-transparent text-white hover:bg-accent rounded-2xl px-8 py-7 h-auto font-black text-lg transition-all hover:scale-105">
                EXAM CENTER
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
                      render: (v, row) => (
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="h-10 w-10 border-2 border-slate-100">
                            <AvatarFallback className="bg-slate-100 text-slate-800 font-bold text-xs">
                              {v?.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-black">{v}</span>
                        </div>
                      )
                    },
                    { key: 'course', label: 'Course' },
                    { key: 'date', label: 'Admission Date', render: (v) => dayjs(v).format('DD MMM YYYY') },
                    { 
                      key: 'status', 
                      label: 'Status', 
                      render: (v) => (
                        <Badge className={v === 'Confirmed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                          {v}
                        </Badge>
                      )
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
                { label: 'Admission', icon: Plus, color: 'bg-blue-600', href: '/students/new', roles: ['admin', 'hr', 'hod'] },
                { label: 'Attendance', icon: Calendar, color: 'bg-emerald-600', href: '/attendance', roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor'] },
                { label: 'Fee Receipt', icon: CreditCard, color: 'bg-amber-50', href: '/fees/new', roles: ['admin', 'hr', 'staff'] },
                { label: 'Add Exam', icon: ClipboardList, color: 'bg-purple-600', href: '/exams/new', roles: ['admin', 'hr', 'hod'] },
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
                announcementsList.slice(0, 3).map((item: any, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                    <div>
                      <h4 className="font-bold text-black group-hover:text-blue-600 transition-colors">{item.title || item.subject || 'Announcement'}</h4>
                      <p className="text-sm text-slate-500 font-medium">{dayjs(item.createdAt).fromNow()}</p>
                      <Badge variant="outline" className="mt-2 text-[10px] py-0 px-2 uppercase tracking-wider font-bold text-slate-600 border-slate-300">{item.type || item.targetAudience?.[0] || 'Update'}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 font-medium text-center py-4">No recent announcements</p>
              )}
              <Button variant="outline" className="w-full mt-4 rounded-xl font-bold border-2 border-slate-200 hover:bg-slate-50 text-black">
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
                examsList.map((exam: any, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-default group">
                    <div className="flex flex-col">
                      <span className="font-bold text-black group-hover:text-blue-700 transition-colors">{exam.subject}</span>
                      <span className="text-xs text-slate-500 font-medium">{exam.time}</span>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-200 text-center min-w-[60px]">
                      <span className="block text-xs font-bold text-blue-600 uppercase tracking-tighter">
                        {dayjs(exam.date).format('MMM')}
                      </span>
                      <span className="block text-lg font-extrabold text-black leading-none">
                        {dayjs(exam.date).format('DD')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 font-medium text-center py-4">No upcoming exams</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
