"use client";

import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { HolidayEvent, indianNationalHolidays, generateIndianHolidays } from '@/lib/indian-holidays';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import { cn, extractList } from '@/lib/utils';
import { holidayApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';

// Setup moment localizer
moment.locale('en');
const localizer = momentLocalizer(moment);

export default function HolidaysPage() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<HolidayEvent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // API Data fetching
  const { data: apiHolidays, loading: isLoading, execute: refetchHolidays } = useFetch<any[]>(holidayApi.getAll);

  // Combine Indian holidays and API holidays
  const events = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const indianHolidays = generateIndianHolidays(currentYear - 2, currentYear + 2);

    const customHolidays = extractList<Record<string, any>>(apiHolidays).map((h: any) => ({
      ...h,
      id: String(h.id || h._id || h.start || h.startDate || Math.random()),
      start: new Date(h.start || h.startDate),
      end: new Date(h.end || h.endDate || h.start || h.startDate),
      isIndianHoliday: false
    }));
    
    return [...indianHolidays, ...customHolidays];
  }, [apiHolidays, currentDate]);

  // Form state for adding/editing holidays
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    type: 'national' as 'national' | 'regional' | 'optional',
    description: '',
  });

  const handleAddHoliday = async () => {
    if (!formData.title || !formData.startDate) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await holidayApi.create({
        title: formData.title,
        start: formData.startDate,
        end: formData.endDate || formData.startDate,
        type: formData.type,
        description: formData.description,
      });
      
      await refetchHolidays();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Holiday added successfully');
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };

  const handleEditHoliday = async () => {
    if (!selectedEvent || !formData.title || !formData.startDate) {
      toast.error('Please fill in required fields');
      return;
    }

    // Don't allow editing Indian holidays
    if (selectedEvent.isIndianHoliday) {
      toast.error('Cannot edit Indian national holidays');
      return;
    }

    try {
      await holidayApi.update(selectedEvent.id, {
        title: formData.title,
        start: formData.startDate,
        end: formData.endDate || formData.startDate,
        type: formData.type,
        description: formData.description,
      });
      
      await refetchHolidays();
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
      toast.success('Holiday updated successfully');
    } catch (error) {
      toast.error('Failed to update holiday');
    }
  };

  const handleDeleteHoliday = async (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    // Don't allow deleting Indian holidays
    if (eventToDelete.isIndianHoliday) {
      toast.error('Cannot delete Indian national holidays');
      return;
    }

    try {
      await holidayApi.delete(eventId);
      await refetchHolidays();
      toast.success('Holiday deleted successfully');
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      startDate: '',
      endDate: '',
      type: 'national',
      description: '',
    });
  };

  const openEditDialog = (event: HolidayEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      startDate: moment(event.start).format('YYYY-MM-DD'),
      endDate: moment(event.end).format('YYYY-MM-DD'),
      type: event.type,
      description: event.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const eventStyleGetter = (event: HolidayEvent) => {
    let backgroundColor = '#3174ad';
    
    if (event.type === 'national') {
      backgroundColor = event.isIndianHoliday ? '#dc2626' : '#059669';
    } else if (event.type === 'regional') {
      backgroundColor = '#7c3aed';
    } else if (event.type === 'optional') {
      backgroundColor = '#ea580c';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const onSelectEvent = (event: HolidayEvent) => {
    setSelectedEvent(event);
    if (!event.isIndianHoliday && (user?.role === 'hr' || user?.role === 'admin')) {
      openEditDialog(event);
    } else {
      setIsEditDialogOpen(true); // Open in view-only mode for Indian holidays or other roles
    }
  };

  const onSelectSlot = (slotInfo: any) => {
    if (user?.role === 'hr' || user?.role === 'admin') {
      setFormData({
        title: '',
        startDate: moment(slotInfo.start).format('YYYY-MM-DD'),
        endDate: moment(slotInfo.end).subtract(1, 'day').format('YYYY-MM-DD'),
        type: 'national',
        description: '',
      });
      setIsAddDialogOpen(true);
    }
  };

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  );

  return (
    <RoleGuard allowedRoles={['admin', 'hod', 'professor', 'assistant_professor', 'staff', 'student', 'hr']}>
      <div className="space-y-8 pb-10 bg-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
              <CalendarDays className="h-10 w-10 text-blue-500" />
              Holiday Matrix
            </h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Institutional Break Schedule & Event Calendar</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={currentView} onValueChange={(value) => setCurrentView(value as View)}>
              <SelectTrigger className="w-32 rounded-2xl border-border bg-card text-white font-black text-[10px] uppercase tracking-widest h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                <SelectItem value={Views.MONTH}>MONTH</SelectItem>
                <SelectItem value={Views.WEEK}>WEEK</SelectItem>
                <SelectItem value={Views.DAY}>DAY</SelectItem>
                <SelectItem value={Views.AGENDA}>AGENDA</SelectItem>
              </SelectContent>
            </Select>
            
            {(user?.role === 'hr' || user?.role === 'admin') && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-wider">Configure New Event</DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                      System synchronization for institutional breaks
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="title">Event Designation</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="ENTER HOLIDAY NAME"
                        className="rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 h-12"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="startDate">Initiation Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="rounded-xl bg-slate-950 border-slate-800 text-white h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="endDate">Termination Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="rounded-xl bg-slate-950 border-slate-800 text-white h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Classification</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger className="rounded-xl bg-slate-950 border-slate-800 text-white h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="national">NATIONAL</SelectItem>
                          <SelectItem value="regional">REGIONAL</SelectItem>
                          <SelectItem value="optional">OPTIONAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="description">Detailed Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="ENTER EVENT DETAILS"
                        className="rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 min-h-[100px]"
                      />
                    </div>
                    <Button onClick={handleAddHoliday} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg">
                      INITIATE DEPLOYMENT
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Edit/View Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-wider">
                {selectedEvent?.isIndianHoliday ? 'Institutional Event Details' : 'Modify Event Configuration'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                {selectedEvent?.isIndianHoliday ? 'Standard National Calendar Protocol' : 'Dynamic institutional break synchronization'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Event Designation</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={selectedEvent?.isIndianHoliday || !(user?.role === 'hr' || user?.role === 'admin')}
                  className="rounded-xl bg-slate-950 border-slate-800 text-white h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initiation Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    disabled={selectedEvent?.isIndianHoliday || !(user?.role === 'hr' || user?.role === 'admin')}
                    className="rounded-xl bg-slate-950 border-slate-800 text-white h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Termination Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={selectedEvent?.isIndianHoliday || !(user?.role === 'hr' || user?.role === 'admin')}
                    className="rounded-xl bg-slate-950 border-slate-800 text-white h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Classification</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  disabled={selectedEvent?.isIndianHoliday || !(user?.role === 'hr' || user?.role === 'admin')}
                >
                  <SelectTrigger className="rounded-xl bg-slate-950 border-slate-800 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="national">NATIONAL</SelectItem>
                    <SelectItem value="regional">REGIONAL</SelectItem>
                    <SelectItem value="optional">OPTIONAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Detailed Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={selectedEvent?.isIndianHoliday || !(user?.role === 'hr' || user?.role === 'admin')}
                  className="rounded-xl bg-slate-950 border-slate-800 text-white min-h-[100px]"
                />
              </div>
              
              {!selectedEvent?.isIndianHoliday && (user?.role === 'hr' || user?.role === 'admin') && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (selectedEvent?.id) {
                        handleDeleteHoliday(selectedEvent.id);
                        setIsEditDialogOpen(false);
                      }
                    }}
                    className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> TERMINATE
                  </Button>
                  <Button 
                    onClick={handleEditHoliday}
                    className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" /> UPDATE
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
          
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="rounded-[2.5rem] border border-border bg-card shadow-2xl lg:col-span-3 overflow-hidden p-6">
            <div className="modern-calendar text-slate-300 font-bold uppercase text-[10px]">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={onSelectEvent}
                selectable
                onSelectSlot={onSelectSlot}
              />
            </div>
          </Card>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border border-border bg-card shadow-2xl overflow-hidden">
              <CardHeader className="bg-slate-900/30 border-b border-border p-8">
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" /> Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {[
                  { label: "NATIONAL HOLIDAY", color: "bg-red-600" },
                  { label: "REGIONAL HOLIDAY", color: "bg-purple-600" },
                  { label: "OPTIONAL HOLIDAY", color: "bg-orange-600" },
                  { label: "COMPANY HOLIDAY", color: "bg-emerald-600" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={cn("h-4 w-4 rounded-lg shadow-inner", item.color)} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Sync Schedule</h3>
                <p className="text-blue-100/70 font-bold text-xs uppercase tracking-widest mb-8 leading-relaxed">Update local nodes with global institutional events.</p>
                <Button 
                  onClick={() => refetchHolidays()}
                  disabled={isLoading}
                  className="w-full bg-white text-blue-900 hover:bg-blue-50 rounded-2xl font-black uppercase tracking-widest h-14 shadow-2xl transition-all hover:scale-105"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  REFRESH MATRIX
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <style jsx global>{`
          .rbc-calendar { background: transparent; }
          .rbc-header { border-bottom: 2px solid hsl(var(--border)) !important; padding: 15px !important; font-weight: 900 !important; color: #64748b !important; }
          .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: none !important; }
          .rbc-day-bg + .rbc-day-bg { border-left: 1px solid hsl(var(--border)) !important; }
          .rbc-month-row + .rbc-month-row { border-top: 1px solid hsl(var(--border)) !important; }
          .rbc-today { background: hsl(var(--primary) / 0.05) !important; }
          .rbc-off-range-bg { background: transparent !important; }
          .rbc-event { padding: 5px 10px !important; font-weight: 900 !important; text-transform: uppercase !important; }
          .rbc-show-more { color: hsl(var(--primary)) !important; font-weight: 900 !important; }
        `}</style>
      </div>
    </RoleGuard>
  );
}
