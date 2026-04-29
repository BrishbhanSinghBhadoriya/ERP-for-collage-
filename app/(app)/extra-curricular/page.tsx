"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Plus, 
  Search, 
  Users, 
  Star,
  Calendar,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { activityApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';

export default function ExtraCurricularPage() {
  const { user } = useAuth();
  const isAdminOrStaffOrHR = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'staff' || user?.role === 'hr';

  const { data: activities, loading: isLoading, execute: refetchActivities } = useFetch<any[]>(activityApi.getAll);
  const { data: stats } = useFetch<any>(activityApi.getStats);
  const { data: leaderboard } = useFetch<any[]>(activityApi.getLeaderboard);

  const activityStats = useMemo(() => [
    { label: "TOTAL EVENTS", value: stats?.totalEvents || activities?.length || 0, trend: stats?.thisSemester || "This semester", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Star },
    { label: "PARTICIPANTS", value: stats?.totalParticipants || 0, trend: (stats?.newParticipants || 0) + " new", color: "text-blue-500", bg: "bg-blue-500/10", icon: Users },
    { label: "UPCOMING", value: stats?.upcomingEvents || 0, trend: "Next 30 days", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: Calendar },
    { label: "CLUBS ACTIVE", value: stats?.activeClubs || 0, trend: "Across campus", color: "text-purple-500", bg: "bg-purple-500/10", icon: Trophy },
  ], [stats, activities]);

  const joinActivity = async (activityId: string) => {
    try {
      await activityApi.trackParticipation({ activityId, studentId: user?.id });
      toast.success('Joined event successfully!');
      refetchActivities();
    } catch (error) {
      toast.error('Failed to join event');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'hod', 'professor', 'assistant_professor', 'staff', 'student', 'hr']}>
      <div className="space-y-8 pb-10 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Nexus Activities
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Extra-Curricular & Student Engagement</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdminOrStaffOrHR && (
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Create Activity
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {activityStats.map((stat, i) => (
          <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
              <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
              <div className="flex items-center gap-2">
                <stat.icon className={cn("h-3 w-3", stat.color)} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl lg:col-span-2">
          <CardHeader className="border-b border-border bg-slate-900/30 px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Activity Hub</CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Live events & club activities</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="SEARCH ACTIVITIES..." 
                  className="pl-12 pr-6 py-3 bg-slate-950 border border-border rounded-2xl text-xs font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-600 w-80 shadow-inner transition-all"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={activities || []}
              isLoading={isLoading}
              columns={[
                { 
                  key: 'name', 
                  label: 'ACTIVITY NAME', 
                  render: (v, row) => (
                    <div className="flex flex-col">
                      <span className="font-black text-white tracking-tight uppercase">{v}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{row.category || row.type || 'General'}</span>
                    </div>
                  ) 
                },
                { 
                  key: 'date', 
                  label: 'SCHEDULE', 
                  render: (v) => (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {dayjs(v).format('DD MMM YYYY')}
                    </div>
                  ) 
                },
                { 
                  key: 'location', 
                  label: 'VENUE', 
                  render: (v, row) => (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <MapPin className="h-3 w-3" />
                      {v || row.venue || 'TBD'}
                    </div>
                  ) 
                },
                { 
                  key: 'status', 
                  label: 'STATUS', 
                  render: (v) => (
                    <Badge className={cn(
                      "rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border",
                      v === 'upcoming' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                      v === 'ongoing' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}>
                      {v}
                    </Badge>
                  ) 
                },
                {
                  key: 'actions',
                  label: 'ACTION',
                  render: (_, row) => (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => joinActivity(row._id || row.id)}
                      className="h-8 rounded-lg border-border hover:bg-yellow-500/10 hover:text-yellow-500 font-black text-[10px] uppercase tracking-widest"
                    >
                      Join Event
                    </Button>
                  )
                }
              ]}
            />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
            <CardHeader className="bg-slate-900/30 border-b border-border p-8">
              <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Top Performers</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Student of the month leaderboard</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {leaderboard?.map((student, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-yellow-500/30 transition-all cursor-default">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs",
                      i === 0 ? "bg-yellow-500/20 text-yellow-500" : 
                      i === 1 ? "bg-slate-300/20 text-slate-300" : "bg-amber-700/20 text-amber-700"
                    )}>
                      {student.avatar || student.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-black text-white uppercase text-xs tracking-tight">{student.name}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rank #{i + 1}</p>
                    </div>
                  </div>
                  <span className="font-black text-yellow-500 text-xs">{student.points} pts</span>
                </div>
              ))}
              {!leaderboard?.length && (
                <div className="text-center py-8">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No leaderboard data available</p>
                </div>
              )}
              <Button variant="outline" className="w-full mt-2 rounded-xl border-border bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] h-12 hover:text-white transition-all">
                Full Leaderboard
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-yellow-600 to-amber-800 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-3 leading-none">Club Grants</h3>
              <p className="text-yellow-100/70 font-bold text-xs uppercase tracking-widest mb-8 leading-relaxed">Apply for club funding and activity sponsorship.</p>
              <Button className="w-full bg-white text-yellow-900 hover:bg-yellow-50 rounded-2xl font-black uppercase tracking-widest h-14 shadow-2xl transition-all hover:scale-105">
                APPLY FOR GRANT
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </RoleGuard>
  );
}
