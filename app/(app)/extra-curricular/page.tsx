"use client";

import { useState, useMemo, useEffect } from 'react';
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
  CheckCircle2,
  Edit,
  Trash2,
  Pencil,
} from 'lucide-react';
import { activityApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import dayjs from 'dayjs';
import { cn, extractList, extractData } from '@/lib/utils';
import { toast } from 'sonner';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExtraCurricularPage() {
  const { user } = useAuth();
  const isAdminOrStaffOrHR = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'staff' || user?.role === 'hr';

  const { data: activitiesData, loading: isLoading, execute: refetchActivities } = useFetch<any[]>(activityApi.getAll);
  const { data: statsData } = useFetch<any>(activityApi.getStats);
  const { data: leaderboardData } = useFetch<any[]>(activityApi.getLeaderboard);

  const [activityOverrides, setActivityOverrides] = useState<any[]>([]);
  const [statsOverrides, setStatsOverrides] = useState<Record<string, any>>({});
  const [leaderboardOverrides, setLeaderboardOverrides] = useState<any[]>([]);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<any>(null);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [editingLeaderboard, setEditingLeaderboard] = useState<any>(null);

  const [tempValue, setTempValue] = useState('');
  const [tempTrend, setTempTrend] = useState('');

  const [activityForm, setActivityForm] = useState({
    name: '',
    category: 'General',
    date: dayjs().format('YYYY-MM-DD'),
    location: '',
    status: 'upcoming'
  });

  const [leaderboardForm, setLeaderboardForm] = useState({
    name: '',
    points: 0,
    rank: 1
  });

  const activities = useMemo(() => {
    const base = extractList<Record<string, any>>(activitiesData);
    const list = [...base];
    activityOverrides.forEach(ov => {
      const idx = list.findIndex(l => (l.id || l._id) === ov.id);
      if (idx > -1) list[idx] = { ...list[idx], ...ov };
      else list.unshift(ov);
    });
    return list;
  }, [activitiesData, activityOverrides]);

  const stats = useMemo(() => {
    const base = extractData<Record<string, any>>(statsData) || {};
    return { ...base, ...statsOverrides };
  }, [statsData, statsOverrides]);

  const leaderboard = useMemo(() => {
    const base = extractList<Record<string, any>>(leaderboardData);
    const list = [...base];
    leaderboardOverrides.forEach(ov => {
      const idx = list.findIndex(l => (l.id || l._id) === ov.id);
      if (idx > -1) list[idx] = { ...list[idx], ...ov };
      else list.push(ov);
    });
    return list.sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [leaderboardData, leaderboardOverrides]);

  const activityStats = useMemo(() => [
    { label: "TOTAL EVENTS", value: stats?.totalEvents || activities?.length || 0, trend: stats?.totalEventsTrend || "This semester", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Star, key: 'totalEvents' },
    { label: "PARTICIPANTS", value: stats?.totalParticipants || 0, trend: stats?.participantsTrend || "new", color: "text-blue-500", bg: "bg-blue-500/10", icon: Users, key: 'totalParticipants' },
    { label: "UPCOMING", value: stats?.upcomingEvents || 0, trend: stats?.upcomingTrend || "Next 30 days", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: Calendar, key: 'upcomingEvents' },
    { label: "CLUBS ACTIVE", value: stats?.activeClubs || 0, trend: stats?.clubsTrend || "Across campus", color: "text-purple-500", bg: "bg-purple-500/10", icon: Trophy, key: 'activeClubs' },
  ], [stats, activities]);

  const handleSaveActivity = () => {
    const activity = {
      id: editingActivity?.id || editingActivity?._id || `act-${Date.now()}`,
      ...activityForm,
      date: dayjs(activityForm.date).toISOString()
    };

    setActivityOverrides(prev => {
      const existing = prev.filter(p => p.id !== activity.id);
      return [activity, ...existing];
    });
    setIsActivityModalOpen(false);
    toast.success(editingActivity ? 'Activity updated' : 'Activity created');
  };

  const handleDeleteActivity = (id: string) => {
    setActivityOverrides(prev => prev.filter(p => (p.id || p._id) !== id));
    toast.success('Activity removed');
  };

  const handleSaveStats = () => {
    if (!editingStat) return;
    setStatsOverrides(prev => ({
      ...prev,
      [editingStat.key]: tempValue,
      [`${editingStat.key}Trend`]: tempTrend
    }));
    setIsStatsModalOpen(false);
    toast.success('Stats updated');
  };

  const handleSaveLeaderboard = () => {
    const item = {
      id: editingLeaderboard?.id || editingLeaderboard?._id || `lb-${Date.now()}`,
      ...leaderboardForm
    };

    setLeaderboardOverrides(prev => {
      const existing = prev.filter(p => p.id !== item.id);
      return [item, ...existing];
    });
    setIsLeaderboardModalOpen(false);
    toast.success(editingLeaderboard ? 'Leaderboard updated' : 'Entry added');
  };

  const handleDeleteLeaderboard = (id: string) => {
    setLeaderboardOverrides(prev => prev.filter(p => (p.id || p._id) !== id));
    toast.success('Entry removed');
  };

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
            <Button 
              onClick={() => {
                setEditingActivity(null);
                setActivityForm({
                  name: '',
                  category: 'General',
                  date: dayjs().format('YYYY-MM-DD'),
                  location: '',
                  status: 'upcoming'
                });
                setIsActivityModalOpen(true);
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Activity
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {activityStats.map((stat, i) => (
          <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl group relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
                {isAdminOrStaffOrHR && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setEditingStat(stat);
                      setTempValue(String(stat.value));
                      setTempTrend(stat.trend);
                      setIsStatsModalOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3 text-slate-500" />
                  </Button>
                )}
              </div>
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
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => joinActivity(row._id || row.id)}
                        className="h-8 rounded-lg border-border hover:bg-yellow-500/10 hover:text-yellow-500 font-black text-[10px] uppercase tracking-widest"
                      >
                        Join Event
                      </Button>
                      {isAdminOrStaffOrHR && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-white"
                            onClick={() => {
                              setEditingActivity(row);
                              setActivityForm({
                                name: row.name,
                                category: row.category || row.type || 'General',
                                date: dayjs(row.date).format('YYYY-MM-DD'),
                                location: row.location || row.venue || '',
                                status: row.status
                              });
                              setIsActivityModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-500"
                            onClick={() => handleDeleteActivity(row._id || row.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
            <CardHeader className="bg-slate-900/30 border-b border-border p-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Top Performers</CardTitle>
                  <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Student of the month leaderboard</CardDescription>
                </div>
                {isAdminOrStaffOrHR && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-10 w-10 rounded-xl hover:bg-yellow-500/10 text-yellow-500"
                    onClick={() => {
                      setEditingLeaderboard(null);
                      setLeaderboardForm({ name: '', points: 0, rank: leaderboard.length + 1 });
                      setIsLeaderboardModalOpen(true);
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {leaderboard?.map((student, i) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-yellow-500/30 transition-all cursor-default relative">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs",
                      i === 0 ? "bg-yellow-500/20 text-yellow-500" : 
                      i === 1 ? "bg-slate-300/20 text-slate-300" : "bg-amber-700/20 text-amber-700"
                    )}>
                      {student.avatar || (student.name || '').split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-black text-white uppercase text-xs tracking-tight">{student.name}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rank #{i + 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-yellow-500 text-xs">{student.points} pts</span>
                    {isAdminOrStaffOrHR && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-white"
                          onClick={() => {
                            setEditingLeaderboard(student);
                            setLeaderboardForm({ name: student.name, points: student.points, rank: i + 1 });
                            setIsLeaderboardModalOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-500"
                          onClick={() => handleDeleteLeaderboard(student._id || student.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
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

      {/* Activity Add/Edit Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              {editingActivity ? 'Edit Activity' : 'Create New Activity'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Activity Name</Label>
              <Input 
                value={activityForm.name}
                onChange={(e) => setActivityForm({...activityForm, name: e.target.value})}
                className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
                placeholder="E.G. ANNUAL SPORTS MEET"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</Label>
                <Input 
                  value={activityForm.category}
                  onChange={(e) => setActivityForm({...activityForm, category: e.target.value})}
                  className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
                  placeholder="E.G. SPORTS"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</Label>
                <Input 
                  type="date"
                  value={activityForm.date}
                  onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                  className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location / Venue</Label>
              <Input 
                value={activityForm.location}
                onChange={(e) => setActivityForm({...activityForm, location: e.target.value})}
                className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
                placeholder="E.G. MAIN GROUND"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</Label>
              <Select 
                value={activityForm.status} 
                onValueChange={(v) => setActivityForm({...activityForm, status: v})}
              >
                <SelectTrigger className="bg-slate-950 border-border rounded-xl text-xs font-black uppercase tracking-widest">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-border text-white">
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivityModalOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveActivity} className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Edit Modal */}
      <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit {editingStat?.label}</DialogTitle>
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
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trend Text</Label>
              <Input 
                value={tempTrend}
                onChange={(e) => setTempTrend(e.target.value)}
                className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatsModalOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveStats} className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leaderboard Modal */}
      <Dialog open={isLeaderboardModalOpen} onOpenChange={setIsLeaderboardModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              {editingLeaderboard ? 'Edit Performer' : 'Add Performer'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student Name</Label>
              <Input 
                value={leaderboardForm.name}
                onChange={(e) => setLeaderboardForm({...leaderboardForm, name: e.target.value})}
                className="bg-slate-950 border-border rounded-xl font-black text-white uppercase text-xs"
                placeholder="E.G. RAHUL SHARMA"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Points</Label>
              <Input 
                type="number"
                value={leaderboardForm.points}
                onChange={(e) => setLeaderboardForm({...leaderboardForm, points: Number(e.target.value)})}
                className="bg-slate-950 border-border rounded-xl font-black text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaderboardModalOpen(false)} className="rounded-xl border-border font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveLeaderboard} className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
