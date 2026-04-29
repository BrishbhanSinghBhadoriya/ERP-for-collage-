"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { LeaveRequest } from '@/lib/types';
import { useFiltersStore } from '@/store/filters';
import { Plus, Check, X, FileText, ChevronRight, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import getLeaves from '@/components/functions/getLeaves';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { approveLeave, rejectLeave } from '@/components/functions/updateLeaves';
import { useMutation } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllLeaveBalances, getMyLeaveBalance, UserBalance } from '@/components/functions/getLeaveBalances';
import { fetchAllEmployees, getEmployees } from '@/components/functions/Employee';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';



export default function LeavesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const { leaveFilters, setLeaveFilters } = useFiltersStore();
  const [activeTab, setActiveTab] = useState<'view' | 'mark' | 'balance'>('view');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const userRole = user?.role || 'employee';

  const qc = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: async (leaveId: string) => {
      return await approveLeave(leaveId);
    },
    onSuccess: () => {
      toast.success('Leave request approved successfully');
      qc.invalidateQueries({ queryKey: ['leaves', userRole] });
    },
    onError: (error) => {
    // toast.error('Failed to approve leave request');
    },
  });
  const rejectMutation = useMutation({
    mutationFn: async (leaveId: string) => {
      return await rejectLeave(leaveId);
    },
    onSuccess: () => {
      toast.success('Leave request rejected successfully');
      qc.invalidateQueries({ queryKey: ['leaves', userRole] });
    },
    onError: (error) => {
      toast.error('Failed to reject leave request');
    },
  });
  const { data: employee } = useQuery({
    queryKey: ['employee'],
    queryFn: () => getEmployees(),
  });
  const emp = employee || []
  console.log("emp", emp);
  const { data: leavesData, isLoading } = useQuery({
    queryKey: ['leaves', userRole],
    queryFn: () => getLeaves(userRole),
  });
  const result = leavesData || [];
  const employeeLeaves = (result as any[]).filter((l: any) => l?.employeeRole === 'employee');
  const hrLeaves = (result as any[]).filter((l: any) => l?.employeeRole === 'hr');

  let filteredData = (activeTab === 'mark') ? hrLeaves : employeeLeaves;
  console.log("filteredData", filteredData);

  if (leaveFilters.status && leaveFilters.status !== 'all') {
    filteredData = filteredData.filter((l: any) => l.status === leaveFilters.status);
  }
  if (leaveFilters.type && leaveFilters.type !== 'all') {
    filteredData = filteredData.filter((l: any) => l.leaveType === leaveFilters.type);
  }
  if (leaveFilters.employee && leaveFilters.employee !== 'all') {
    filteredData = filteredData.filter((l: any) => l.employeeId._id === leaveFilters.employee);
  }

  if (rangeStart) {
    filteredData = filteredData.filter((l: any) => dayjs(l.startDate).isAfter(dayjs(rangeStart).subtract(1, 'day')));
  }
  if (rangeEnd) {
    filteredData = filteredData.filter((l: any) => dayjs(l.endDate).isBefore(dayjs(rangeEnd).add(1, 'day')));
  }

  const debouncedSearch = useDebounce(leaveFilters.search, 500);

  if (leaveFilters.search) {
    const query = leaveFilters.search.toLowerCase();
    filteredData = filteredData.filter((l: any) =>
      l.employeeName.toLowerCase().includes(query) ||
      l.leaveType.toLowerCase().includes(query)
    );
  }

  const handleSearch = (query: string) => {
    setLeaveFilters({ search: query });
  };

  const tableData = filteredData;
  console.log('leaves', result);
  // Leave Balances
  const { data: allBalances, isLoading: isLoadingAllBalances } = useQuery<{ balances: UserBalance[] } | UserBalance[] | any>({
    queryKey: ['leave-balances', 'all'],
    queryFn: async () => await getAllLeaveBalances(),
    enabled: activeTab === 'balance' && userRole !== 'employee',
  });
  const { data: myBalance, isLoading: isLoadingMyBalance } = useQuery<UserBalance | null>({
    queryKey: ['leave-balance', 'me'],
    queryFn: async () => await getMyLeaveBalance(),
    enabled: activeTab === 'balance' && userRole === 'employee',
  });

  const balancesArray: UserBalance[] = Array.isArray(allBalances) ? allBalances as UserBalance[] : [];

  const balanceColumns = [
    {
      key: 'user' as any,
      label: 'Employee',
      render: (_: any, b: UserBalance) => (
        <div>
          <div className="font-medium">{b.user.name}</div>
          <div className="text-sm text-muted-foreground">{b.user.department}</div>
        </div>
      ),
    },
    {
      key: 'window' as any,
      label: 'Window',
      render: (_: any, b: UserBalance) => (
        <div className="text-sm">
          {dayjs(b.window.start).format('MMM DD, YYYY')} - {dayjs(b.window.end).format('MMM DD, YYYY')}
        </div>
      ),
    },
    {
      key: 'accrual' as any,
      label: 'Accrual',
      render: (_: any, b: UserBalance) => (
        <div className="flex gap-2 text-sm">
          <Badge variant="secondary">Casual: {b.accrual.casual}</Badge>
          <Badge variant="secondary">Sick: {b.accrual.sick}</Badge>
          <Badge variant="secondary">Earned: {b.accrual.earned}</Badge>
        </div>
      ),
    },
    {
      key: 'used' as any,
      label: 'Used',
      render: (_: any, b: UserBalance) => (
        <div className="flex gap-2 text-sm">
          <Badge variant="outline">Casual: {b.used.casual}</Badge>
          <Badge variant="outline">Sick: {b.used.sick}</Badge>
          <Badge variant="outline">Earned: {b.used.earned}</Badge>
        </div>
      ),
    },
    {
      key: 'remaining' as any,
      label: 'Remaining',
      render: (_: any, b: UserBalance) => (
        <div className="flex gap-2 text-sm">
          <Badge>Casual: {b.remaining.casual}</Badge>
          <Badge>Sick: {b.remaining.sick}</Badge>
          <Badge>Earned: {b.remaining.earned}</Badge>
        </div>
      ),
    },
  ];




  const handleApproveReject = async (leaveId: string, action: 'approve' | 'reject') => {
    console.log('handleApproveReject', leaveId, action);
    try {
      if (action === 'approve') {
        approveMutation.mutate(leaveId);
      } else {
        rejectMutation.mutate(leaveId);
      }

      setSelectedLeave(null);

    } catch (error) {
      toast.error(`Failed to ${action} leave request`);
    }
  };

  const columns = [
    {
      key: 'employeeName' as keyof LeaveRequest,
      label: 'Employee',
      sortable: true,
      render: (_value: any, leave: LeaveRequest) => (
        <div>
          <div className="font-medium">{leave.employeeName}</div>
          <div className="text-sm text-muted-foreground capitalize">{leave.leaveType} leave</div>
        </div>
      ),
    },
    {
      key: 'startDate' as keyof LeaveRequest,
      label: 'Duration',
      render: (_value: any, leave: LeaveRequest) => (
        <div>
          <div className="font-medium">
            {dayjs(leave.startDate).format('MMM DD')} - {dayjs(leave.endDate).format('MMM DD')}
          </div>
          <div className="text-sm text-muted-foreground">{leave.totalDays} days</div>
        </div>
      ),
    },
    {
      key: 'appliedOn' as keyof LeaveRequest,
      label: 'Applied On',
      sortable: true,
      render: (_value: any, leave: LeaveRequest) => dayjs(leave.createdAt).format('MMM DD, YYYY'),
    },
    {
      key:'leaveType' as keyof LeaveRequest,
      label:'Type',
      render:(_value:any,leave:LeaveRequest)=>leave.leaveType
    },
    {
      key: 'status' as keyof LeaveRequest,
      label: 'Status',
      render: (status: string) => (
        <Badge variant={
          status === 'approved' ? 'default' :
            status === 'rejected' ? 'destructive' : 'secondary'
        }>
          {status}
        </Badge>
      ),
    },
    {
      key: 'reason' as keyof LeaveRequest,
      label: 'Reason',
      render: (reason: string) => {
        const display = typeof reason === 'string' && reason.length > 30
          ? `${reason.slice(0, 30)}...`
          : reason;
        return (
          <div className="max-w-48" title={reason}>
            {display}
          </div>
        );
      },
    },
  ];

  const filters = (
    <div className="flex gap-2">
      <Select
        value={leaveFilters.status}
        onValueChange={(value) => setLeaveFilters({ status: value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={leaveFilters.type}
        onValueChange={(value) => setLeaveFilters({ type: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Leave Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="casual">Casual</SelectItem>
          <SelectItem value="sick">Sick</SelectItem>
          <SelectItem value="earned">Earned</SelectItem>
          <SelectItem value="fop">FOP</SelectItem>
          <SelectItem value="lop">LOP</SelectItem>

        </SelectContent>
      </Select>

      {userRole !== 'employee' && (
        <Select
          value={leaveFilters.employee}
          onValueChange={(value) => setLeaveFilters({ employee: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {emp.map((emp) => (
              <SelectItem key={emp._id} value={emp._id || ''}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={rangeStart}
          onChange={(e) => setRangeStart(e.target.value)}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={rangeEnd}
          onChange={(e) => setRangeEnd(e.target.value)}
        />
      </div>
    </div>
  );

  const actions = (leave: LeaveRequest) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setSelectedLeave(leave)}
      >
        View
      </Button>
      {activeTab !== 'mark' && userRole !== 'employee' && leave.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-green-600 hover:text-green-700"
            onClick={() => handleApproveReject(leave._id, 'approve')}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => handleApproveReject(leave._id, 'reject')}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <RoleGuard allowedRoles={['admin', 'hod', 'professor', 'assistant_professor', 'staff', 'student', 'hr']}>
      <div className="space-y-8 pb-10 bg-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
              <FileText className="h-10 w-10 text-blue-500" />
              Leave Registry
            </h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Absence Management & Workforce Availability</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push('/leaves/apply')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Request Leave
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "CASUAL LEAVE", value: userRole === 'employee' ? `${myBalance?.remaining.casual || 0}/${myBalance?.accrual.casual || 0}` : "12 Days", trend: "Available", color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "SICK LEAVE", value: userRole === 'employee' ? `${myBalance?.remaining.sick || 0}/${myBalance?.accrual.sick || 0}` : "10 Days", trend: "Available", color: "text-rose-500", bg: "bg-rose-500/10" },
            { label: "EARNED LEAVE", value: userRole === 'employee' ? `${myBalance?.remaining.earned || 0}/${myBalance?.accrual.earned || 0}` : "15 Days", trend: "Full", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "PENDING REQUESTS", value: tableData.filter(l => l.status === 'pending').length, trend: "In Review", color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
                <p className={cn("text-3xl font-black text-white")}>{stat.value}</p>
                <div className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", stat.color.replace('text', 'bg'))} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-border bg-slate-900/30 px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="bg-slate-950 p-1 rounded-2xl border border-slate-900">
                <TabsList className="bg-transparent border-none h-12">
                  <TabsTrigger value="view" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">MY RECORDS</TabsTrigger>
                  {userRole !== 'employee' && (
                    <TabsTrigger value="mark" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">TEAM APPROVALS</TabsTrigger>
                  )}
                  <TabsTrigger value="balance" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">QUOTA STATUS</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="FILTER ARCHIVE..." 
                    className="pl-12 pr-6 py-3 bg-slate-950 border border-border rounded-2xl text-xs font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 w-64 shadow-inner transition-all"
                    value={leaveFilters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={activeTab === 'balance' ? (userRole === 'employee' ? (myBalance ? [myBalance] : []) : balancesArray) : tableData}
              columns={activeTab === 'balance' ? balanceColumns : [
                { 
                  key: 'employeeName', 
                  label: 'PERSONNEL', 
                  render: (v: any, row: any) => (
                    <div className="flex items-center gap-4 py-1">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 font-black text-xs shadow-inner">
                        {v?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-white tracking-tight uppercase">{v}</span>
                        <span className="text-[9px] font-black text-slate-500 tracking-tighter uppercase">{row.leaveType} DEPLOYMENT</span>
                      </div>
                    </div>
                  )
                },
                { 
                  key: 'startDate', 
                  label: 'TIMELINE', 
                  render: (_: any, row: any) => (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-400 uppercase">{dayjs(row.startDate).format('DD MMM')}</span>
                      <ChevronRight className="h-3 w-3 text-slate-700" />
                      <span className="text-xs font-black text-slate-400 uppercase">{dayjs(row.endDate).format('DD MMM')}</span>
                    </div>
                  )
                },
                { key: 'totalDays', label: 'DURATION', render: (v) => <span className="text-xs font-black text-white uppercase tracking-tighter">{v} DAYS</span> },
                { 
                  key: 'status', 
                  label: 'STATUS', 
                  render: (v) => (
                    <Badge className={cn(
                      "rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest",
                      String(v).toLowerCase() === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                      String(v).toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                    )}>
                      {v}
                    </Badge>
                  )
                },
                {
                  key: 'actions',
                  label: 'COMMANDS',
                  render: (_: any, row: any) => (
                    <div className="flex items-center gap-2">
                      {row.status === 'pending' && userRole !== 'employee' && (
                        <>
                          <Button onClick={() => handleApproveReject(row._id, 'approve')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-emerald-500 hover:bg-emerald-500/10">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleApproveReject(row._id, 'reject')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-500/10">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button onClick={() => setSelectedLeave(row)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-blue-500 hover:bg-blue-500/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </CardContent>
        </Card>

        {/* Leave Details Dialog */}
        <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-[2rem] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-wider">Leave Deployment Details</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                Complete intelligence on absence request
              </DialogDescription>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-8 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {[
                    { label: "PERSONNEL", value: selectedLeave.employeeName },
                    { label: "CLASSIFICATION", value: selectedLeave.leaveType.toUpperCase() },
                    { label: "DURATION", value: `${selectedLeave.totalDays} DAYS` },
                    { label: "INITIATION", value: dayjs(selectedLeave.startDate).format('DD MMM YYYY') },
                    { label: "TERMINATION", value: dayjs(selectedLeave.endDate).format('DD MMM YYYY') },
                    { label: "STATUS", value: selectedLeave.status.toUpperCase(), isBadge: true },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                      {item.isBadge ? (
                        <Badge className={cn(
                          "rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest",
                          selectedLeave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                          selectedLeave.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                        )}>
                          {item.value}
                        </Badge>
                      ) : (
                        <p className="text-sm font-black text-white">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-6 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MISSION OBJECTIVE / REASON</p>
                  <p className="text-sm font-bold text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                    {selectedLeave.reason}
                  </p>
                </div>

                {userRole !== 'employee' && selectedLeave.status === 'pending' && (
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={() => handleApproveReject(selectedLeave._id, 'reject')}
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase tracking-widest hover:bg-rose-500/10"
                    >
                      REJECT ACCESS
                    </Button>
                    <Button
                      onClick={() => handleApproveReject(selectedLeave._id, 'approve')}
                      className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-lg"
                    >
                      APPROVE ACCESS
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}