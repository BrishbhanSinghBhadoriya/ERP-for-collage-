"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveForm } from '@/components/forms/leave-form';
import { getLeaveBalance } from '@/lib/mock';

import { FileText, ArrowLeft, ShieldCheck, Calendar, Clock, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function ApplyLeavePage() {
  const router = useRouter();
  const { user } = useAuth();
  const currentEmployeeId = user?.id;
  console.log('currentEmployeeId', currentEmployeeId);
  const leaveBalance = getLeaveBalance(currentEmployeeId || '');

  const handleSubmit = async (data: any) => {
    try {

      const payload = {
        leaveType: data.type,
        reason: data.reason,
        startDate: data.startDate,
        endDate: data.endDate,
        remarks: data.remarks,
        durationType: data.type === 'short_leave' ? 'short_leave' : (data.days && data.days > 1 ? 'multiple_days' : 'single_day'),
      };
      await api.post('/leaves', payload);
      toast.success('Leave request submitted successfully');
      router.push('/leaves');
    } catch (error) {

    }
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            Absence Protocol
          </h1>
          <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
            Leave Application • Command Center
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 hover:text-white transition-all h-10 px-6"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-2" />
          Abort Request
        </Button>
      </div>

      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BalanceCard 
            icon={Sparkles} 
            label="Casual Allowance" 
            remaining={leaveBalance.casual.remaining} 
            total={leaveBalance.casual.total} 
            color="text-blue-400" 
            bgColor="bg-blue-400/5" 
          />
          <BalanceCard 
            icon={Clock} 
            label="Recovery Time" 
            remaining={leaveBalance.sick.remaining} 
            total={leaveBalance.sick.total} 
            color="text-amber-400" 
            bgColor="bg-amber-400/5" 
          />
          <BalanceCard 
            icon={ShieldCheck} 
            label="Earned Credits" 
            remaining={leaveBalance.earned.remaining} 
            total={leaveBalance.earned.total} 
            color="text-emerald-400" 
            bgColor="bg-emerald-400/5" 
          />
        </div>
      )}

      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Request Configuration</CardTitle>
          <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
            Define parameters for temporary deployment withdrawal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <LeaveForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

const BalanceCard = ({ icon: Icon, label, remaining, total, color, bgColor }: any) => (
  <div className={cn("rounded-2xl border border-slate-800 p-6 space-y-4 relative group overflow-hidden transition-all hover:border-slate-700", bgColor)}>
    <div className="flex items-center justify-between">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-right">
        <span className={cn("text-3xl font-black tracking-tighter block", color)}>{remaining}</span>
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Units Available</span>
      </div>
    </div>
    <div className="space-y-2">
      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color.replace('text', 'bg'))} style={{ width: `${(remaining / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase">
        <span>Active Grid</span>
        <span>Registry Max: {total}</span>
      </div>
    </div>
  </div>
);