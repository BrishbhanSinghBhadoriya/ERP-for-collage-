"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Download,
  Filter,
  Users,
  BookOpen
} from 'lucide-react';
import { attendanceApi, courseApi, studentApi, academicsApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import dayjs from 'dayjs';
import { cn, extractList, extractData } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { RoleGuard } from '@/components/auth/role-guard';

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const userRole = user?.role;

  const isFacultyOrHR = useMemo(() => {
    if (!userRole) return false;
    const normalizedRole = userRole.toLowerCase().replace(/_/g, ' ').trim();
    return [
      'admin', 
      'hod', 
      'professor', 
      'assistant professor', 
      'faculty', 
      'staff', 
      'hr', 
      'registrar',
      'manager'
    ].includes(normalizedRole);
  }, [userRole]);

  const isStudent = userRole === 'student';
  
  const [activeTab, setActiveTab] = useState<'view' | 'mark'>('view');

  // Set default tab once auth loads
  useEffect(() => {
    if (!authLoading && user) {
      setActiveTab(isFacultyOrHR ? 'mark' : 'view');
    }
  }, [authLoading, user, isFacultyOrHR]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // Fetch data
  const { data: rawCourses, loading: coursesLoading, execute: refetchCourses } = useFetch<any[]>(courseApi.getAll, {
    onError: (err) => toast.error('Failed to load courses')
  });
  const courses = useMemo(() => extractList(rawCourses), [rawCourses]);

  const { data: studentsData, loading: studentsLoading, execute: refetchStudents } = useFetch<any[]>(
    () => (selectedCourseId ? studentApi.getAll({ page: 1, limit: 1000, course: selectedCourseId }) : Promise.resolve({ data: [] })),
    { 
      immediate: false,
      onError: (err) => toast.error('Failed to load students')
    }
  );
  const studentsInSelectedCourse = useMemo(() => extractList<Record<string, any>>(studentsData), [studentsData]);

  const { data: subjectsData, loading: subjectsLoading, execute: refetchSubjects } = useFetch<any[]>(
    () => (selectedCourseId ? academicsApi.getSubjectsByCourse(selectedCourseId) : Promise.resolve({ data: [] })),
    { 
      immediate: false,
      onError: (err) => toast.error('Failed to load subjects')
    }
  );

  const subjects = useMemo(() => {
    return extractList<Record<string, any>>(subjectsData);
  }, [subjectsData]);

  useEffect(() => {
    if (isFacultyOrHR && selectedCourseId) refetchSubjects();
  }, [isFacultyOrHR, selectedCourseId, refetchSubjects]);

  useEffect(() => {
    if (!isFacultyOrHR) return;
    if (!selectedCourseId) return;
    refetchStudents();
  }, [isFacultyOrHR, selectedCourseId, refetchStudents]);

  const selectedSubject = useMemo(() => {
    const sid = selectedSubjectId;
    return subjects.find((s: any) => String(s.id || s._id) === String(sid)) || null;
  }, [subjects, selectedSubjectId]);

  const fetchClassAttendance = useCallback(() => {
    if (!selectedSubjectId) return Promise.resolve({ data: [] });
    return attendanceApi.getAttendance({ date: selectedDate, subjectId: selectedSubjectId });
  }, [selectedDate, selectedSubjectId]);

  const { data: attendanceData, loading: isLoading, execute: refetchAttendance } = useFetch<any[]>(
    fetchClassAttendance,
    { 
      immediate: false,
      onError: (err) => toast.error('Failed to load attendance records')
    }
  );

  useEffect(() => {
    if (isFacultyOrHR && selectedSubjectId) refetchAttendance();
  }, [isFacultyOrHR, selectedSubjectId, selectedDate, refetchAttendance]);

  const attendanceList = useMemo(() => extractList<Record<string, any>>(attendanceData), [attendanceData]);

  const { data: myAttendanceData, loading: myAttendanceLoading } = useFetch<any[]>(
    () => (user?.id ? attendanceApi.getStudentAttendance(String(user.id)) : Promise.resolve({ data: [] })),
    { 
      immediate: isStudent,
      onError: (err) => toast.error('Failed to load your attendance')
    }
  );
  const myAttendanceList = useMemo(() => extractList<Record<string, any>>(myAttendanceData), [myAttendanceData]);

  // Auto-select first course/subject for faculty/HR to reduce empty-state.
  useEffect(() => {
    if (!isFacultyOrHR) return;
    if (selectedCourseId) return;
    const first = (courses || [])[0];
    if (first) setSelectedCourseId(String(first.id || first._id));
  }, [isFacultyOrHR, courses, selectedCourseId]);

  useEffect(() => {
    if (!isFacultyOrHR) return;
    if (!selectedCourseId) return;
    if (selectedSubjectId) return;
    if (subjectsLoading) return;
    const first = (subjects || [])[0] as any;
    if (first) setSelectedSubjectId(String(first.id || first._id));
  }, [isFacultyOrHR, selectedCourseId, subjects, selectedSubjectId, subjectsLoading]);

  const statusToEnum = (status: 'present' | 'absent' | 'late') => {
    if (status === 'present') return 'Present';
    if (status === 'absent') return 'Absent';
    return 'Late';
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    try {
      if (!selectedSubjectId) {
        toast.error('Please select subject first');
        return;
      }

      if (!selectedSubject) {
        toast.error('Subject not found');
        return;
      }

      await attendanceApi.markAttendance({
        student: studentId,
        subject: selectedSubjectId,
        date: selectedDate,
        status: statusToEnum(status),
        semester: selectedSubject.semester,
      });

      toast.success('Attendance updated');
      refetchAttendance();
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const attendanceStats = useMemo(() => {
    const list = isStudent ? myAttendanceList : attendanceList;
    if (!list.length) return { present: 0, absent: 0, rate: 0 };
    const present = list.filter((r: any) => String(r.status).toLowerCase() === 'present').length;
    const total = list.length;
    return {
      present,
      absent: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [attendanceList, isStudent, myAttendanceList]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedSubjectId(''); // Reset subject when course changes
  };

  return (
    <RoleGuard allowedRoles={[
      'admin', 'hod', 'professor', 'assistant_professor', 'assistant professor', 
      'staff', 'student', 'hr', 'faculty', 'registrar', 'manager'
    ]}>
      <div className="space-y-8 pb-10 bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
            <Calendar className="h-10 w-10 text-indigo-500" />
            Attendance System
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Lecture-wise Tracking & Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {isFacultyOrHR && (
            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-border">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('mark')}
                className={cn(
                  "rounded-xl px-6 font-black text-xs uppercase tracking-widest h-10 transition-all",
                  activeTab === 'mark' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                Mark
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('view')}
                className={cn(
                  "rounded-xl px-6 font-black text-xs uppercase tracking-widest h-10 transition-all",
                  activeTab === 'view' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                Reports
              </Button>
            </div>
          )}
          <Button variant="outline" className="rounded-2xl border-border bg-card text-white hover:bg-accent font-black text-xs h-12 px-6 uppercase tracking-widest">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">PRESENT TODAY</p>
              <h3 className="text-2xl font-black text-white">{attendanceStats.present} Students</h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">ABSENT TODAY</p>
              <h3 className="text-2xl font-black text-white">{attendanceStats.absent} Students</h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">AVG ATTENDANCE</p>
              <h3 className="text-2xl font-black text-white">{attendanceStats.rate}% Rate</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-border bg-slate-900/30 px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">
                  {activeTab === 'mark' ? 'Subject Attendance Registry' : 'Attendance Analytics'}
                </CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                  {activeTab === 'mark' ? 'Mark attendance for selected subject' : 'View attendance records'}
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {!isStudent && (
                  <>
                    <Select value={selectedCourseId} onValueChange={handleCourseChange}>
                      <SelectTrigger className="w-52 bg-slate-900 border-border rounded-xl text-xs font-black h-11 uppercase tracking-widest text-white">
                        <SelectValue placeholder={coursesLoading ? "LOADING..." : "SELECT COURSE"} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-border z-[100]">
                        {coursesLoading ? (
                          <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Loading courses...
                          </div>
                        ) : courses.length > 0 ? (
                          courses.map((course: any) => (
                            <SelectItem
                              key={course.id || course._id}
                              value={String(course.id || course._id)}
                              className="text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800"
                            >
                              {course.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            No courses found
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedCourseId || subjectsLoading}>
                      <SelectTrigger className="w-56 bg-slate-900 border-border rounded-xl text-xs font-black h-11 uppercase tracking-widest text-white disabled:opacity-50">
                        <SelectValue placeholder={subjectsLoading ? "LOADING..." : "SELECT SUBJECT"} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-border z-[100]">
                        {subjectsLoading ? (
                          <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Loading subjects...
                          </div>
                        ) : subjects.length > 0 ? (
                          subjects.map((subject: any) => (
                            <SelectItem
                              key={subject.id || subject._id}
                              value={String(subject.id || subject._id)}
                              className="text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800"
                            >
                              {subject.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            No subjects found
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    {selectedSubject?.faculty?.name && (
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        Professor: {selectedSubject.faculty.name}
                      </span>
                    )}
                  </>
                )}

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-xs font-black text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {activeTab === 'mark' ? (
              !selectedSubjectId ? (
                <div className="p-20 text-center">
                  <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select a subject to mark attendance</p>
                </div>
              ) : (
                <DataTable<Record<string, any>>
                  data={studentsInSelectedCourse}
                  isLoading={studentsLoading || isLoading}
                  columns={[
                  { 
                    key: 'user', 
                    label: 'STUDENT', 
                    render: (v, row) => (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-[10px]">
                          {(v?.name || row?.user?.name || '').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-white tracking-tight uppercase">{v?.name || 'N/A'}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{row._id || row.id}</span>
                        </div>
                      </div>
                    )
                  },
                  { 
                    key: '_id', 
                    label: 'ATTENDANCE STATUS', 
                    render: (_, row) => {
                      const studentId = row._id || row.id;
                      const record = attendanceList.find(
                        (r) => String(r?.student?._id || r?.student?.id || r?.student) === String(studentId)
                      );
                      const status = record?.status ? String(record.status).toLowerCase() : '';
                      
                      return (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAttendance(studentId, 'present')}
                            className={cn(
                              "h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                              status === 'present'
                                ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50"
                                : "text-slate-500 border-border hover:bg-emerald-500/10 hover:text-emerald-500"
                            )}
                          >
                            Present
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAttendance(studentId, 'absent')}
                            className={cn(
                              "h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                              status === 'absent'
                                ? "bg-rose-500/20 text-rose-500 border-rose-500/50"
                                : "text-slate-500 border-border hover:bg-rose-500/10 hover:text-rose-500"
                            )}
                          >
                            Absent
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAttendance(studentId, 'late')}
                            className={cn(
                              "h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                              status === 'late'
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                : "text-slate-500 border-border hover:bg-blue-500/10 hover:text-blue-400"
                            )}
                          >
                            Late
                          </Button>
                        </div>
                      );
                    }
                  }
                ]}
              />
            )
          ) : (
            <DataTable<Record<string, any>>
                data={isStudent ? myAttendanceList : attendanceList}
                isLoading={isStudent ? myAttendanceLoading : isLoading}
                columns={[
                  { 
                    key: 'date', 
                    label: 'DATE', 
                    render: (v) => <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{dayjs(v).format('DD MMM YYYY')}</span> 
                  },
                  { 
                    key: 'student',
                    label: 'STUDENT',
                    render: (v) => (
                      <div className="flex flex-col">
                        <span className="font-black text-white tracking-tight uppercase">{v?.user?.name || v?.user?.rollNumber || v?.user?.email || 'N/A'}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{v?._id || v?.id || ''}</span>
                      </div>
                    )
                  },
                  { 
                    key: 'subject',
                    label: 'SUBJECT',
                    render: (v) => (
                      <div className="flex flex-col">
                        <span className="font-black text-white tracking-tight uppercase">{v?.name || 'N/A'}</span>
                        <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">
                          {v?.faculty?.name ? `Prof. ${v.faculty.name}` : 'Faculty N/A'}
                        </span>
                      </div>
                    )
                  },
                  { 
                    key: 'status', 
                    label: 'STATUS', 
                    render: (v) => {
                      const normalized = String(v || '').toLowerCase();
                      const displayValue = typeof v === 'object' ? (v?.name || v?.title || JSON.stringify(v)) : String(v || 'N/A');
                      return (
                        <Badge
                          className={cn(
                            "rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border",
                            normalized === 'present' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            normalized === 'absent' && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                            normalized === 'late' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            normalized !== 'present' && normalized !== 'absent' && normalized !== 'late' && "bg-slate-900/30 text-slate-300 border-border"
                          )}
                        >
                          {displayValue}
                        </Badge>
                      );
                    }
                  }
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </RoleGuard>
  );
}
