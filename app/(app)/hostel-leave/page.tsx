"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getHostelLeaves, 
    approveByWarden, 
    approveByHOD, 
    finalForwardByWarden,
    createHostelLeave
} from '@/components/functions/hostelLeaveActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription,
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import dayjs from 'dayjs';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Send, 
    User, 
    Calendar, 
    FileText,
    ChevronRight,
    Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleGuard } from '@/components/auth/role-guard';

export default function HostelLeavePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<any>(null);
    const [remarks, setRemarks] = useState('');
    
    // Form state for new leave
    const [newLeave, setNewLeave] = useState({
        reason: '',
        startDate: '',
        endDate: ''
    });

    const userRole = user?.role || 'student';

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['hostelLeaves'],
        queryFn: getHostelLeaves
    });

    const createMutation = useMutation({
        mutationFn: createHostelLeave,
        onSuccess: () => {
            toast.success('Leave applied successfully');
            setIsApplyDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['hostelLeaves'] });
            setNewLeave({ reason: '', startDate: '', endDate: '' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to apply leave');
        }
    });

    const wardenApproveMutation = useMutation({
        mutationFn: ({ id, status, remarks }: any) => approveByWarden(id, status, remarks),
        onSuccess: () => {
            toast.success('Action recorded and forwarded to HOD');
            setIsApproveDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['hostelLeaves'] });
        }
    });

    const hodApproveMutation = useMutation({
        mutationFn: ({ id, status, remarks }: any) => approveByHOD(id, status, remarks),
        onSuccess: () => {
            toast.success('HOD approval recorded');
            setIsApproveDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['hostelLeaves'] });
        }
    });

    const finalForwardMutation = useMutation({
        mutationFn: finalForwardByWarden,
        onSuccess: () => {
            toast.success('Final approval forwarded to student');
            queryClient.invalidateQueries({ queryKey: ['hostelLeaves'] });
        }
    });

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newLeave);
    };

    const handleWardenAction = (status: 'Approved' | 'Rejected') => {
        wardenApproveMutation.mutate({ id: selectedLeave._id, status, remarks });
    };

    const handleHODAction = (status: 'Approved' | 'Rejected') => {
        hodApproveMutation.mutate({ id: selectedLeave._id, status, remarks });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Approved</Badge>;
            case 'Rejected':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
            default:
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
        }
    };

    return (
        <RoleGuard allowedRoles={['admin', 'hr', 'hod', 'student', 'warden']}>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Hostel Leave</h1>
                        <p className="text-muted-foreground">Manage and track your hostel leave requests</p>
                    </div>
                    {userRole === 'student' && (
                        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Send className="mr-2 h-4 w-4" /> Apply for Leave
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Apply for Hostel Leave</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to request a leave from the hostel.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleApply} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Reason for Leave</Label>
                                        <Textarea 
                                            required 
                                            value={newLeave.reason}
                                            onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                                            placeholder="Enter detailed reason..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input 
                                                type="date" 
                                                required 
                                                value={newLeave.startDate}
                                                onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input 
                                                type="date" 
                                                required 
                                                value={newLeave.endDate}
                                                onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Applying..." : "Submit Application"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid gap-6">
                    {isLoading ? (
                        <p>Loading leaves...</p>
                    ) : leaves?.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Clock className="h-12 w-12 mb-4 opacity-20" />
                                <p>No leave requests found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        leaves?.map((leave: any) => (
                            <Card key={leave._id} className="overflow-hidden border-slate-200 dark:border-slate-800">
                                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{leave.studentId?.name || 'Student'}</CardTitle>
                                                <p className="text-xs text-muted-foreground">{leave.studentId?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex gap-2 mb-1 justify-end">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Final Status</span>
                                                    {getStatusBadge(leave.finalStatus)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-2">
                                                <FileText className="h-4 w-4 text-slate-400 mt-1" />
                                                <div>
                                                    <p className="text-sm font-semibold">Reason</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{leave.reason}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400 mt-1" />
                                                <div>
                                                    <p className="text-sm font-semibold">Duration</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {dayjs(leave.startDate).format('MMM D, YYYY')} - {dayjs(leave.endDate).format('MMM D, YYYY')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Approval Workflow</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Warden Approval</span>
                                                    {getStatusBadge(leave.wardenStatus)}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">HOD Approval</span>
                                                    {getStatusBadge(leave.hodStatus)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center gap-2">
                                            {userRole === 'warden' && leave.wardenStatus === 'Pending' && (
                                                <Button 
                                                    onClick={() => { setSelectedLeave(leave); setIsApproveDialogOpen(true); }}
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Warden Review
                                                </Button>
                                            )}
                                            {userRole === 'hod' && leave.forwardedToHOD && leave.hodStatus === 'Pending' && (
                                                <Button 
                                                    onClick={() => { setSelectedLeave(leave); setIsApproveDialogOpen(true); }}
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                >
                                                    HOD Review
                                                </Button>
                                            )}
                                            {userRole === 'warden' && leave.hodStatus === 'Approved' && !leave.forwardedToStudent && (
                                                <Button 
                                                    onClick={() => finalForwardMutation.mutate(leave._id)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                                    disabled={finalForwardMutation.isPending}
                                                >
                                                    {finalForwardMutation.isPending ? "Forwarding..." : "Forward Final Approval"}
                                                </Button>
                                            )}
                                            {leave.forwardedToStudent && (
                                                <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm py-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Forwarded to Student
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Approval Dialog */}
                <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Leave Approval - {userRole.toUpperCase()}</DialogTitle>
                            <DialogDescription>
                                Review the leave request and provide your decision with remarks.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Remarks</Label>
                                <Textarea 
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add any comments..."
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-between">
                            <Button 
                                variant="destructive" 
                                onClick={() => userRole === 'warden' ? handleWardenAction('Rejected') : handleHODAction('Rejected')}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => userRole === 'warden' ? handleWardenAction('Approved') : handleHODAction('Approved')}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </RoleGuard>
    );
}
