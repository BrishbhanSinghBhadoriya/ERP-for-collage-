"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, ShieldCheck, Mail, Phone, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { EditModalSection } from '@/app/(app)/profile/_components/EditModal';
import Personal_Info from '@/app/(app)/profile/_components/Personal_Info';
import Contact_Info from '@/app/(app)/profile/_components/Contact_Info';
import JobTab from '@/app/(app)/profile/_components/JobTab';
import ExperienceTab from '@/app/(app)/profile/_components/ExperienceTab';
import EductionTab from '@/app/(app)/profile/_components/EductionTab';
import BankdetailsTab from '@/app/(app)/profile/_components/BankdetailsTab';
import DocumentTab from '@/app/(app)/profile/_components/DocumentTab';
import KRATab from '@/app/(app)/profile/_components/KRATab';
import { AuthContext } from '@/lib/auth-context';
import { getEmployeeById } from '@/components/functions/Employee';

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [scopedUser, setScopedUser] = useState<any>(null);

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(id),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (employee) setScopedUser(employee);
  }, [employee]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 blur-xl bg-blue-600/20 animate-pulse" />
        </div>
        <p className="uppercase text-[10px] font-black tracking-[0.3em] animate-pulse">Syncing Personnel Data...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <ShieldCheck className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Registry Error</h3>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-widest max-w-xs">
            {error?.message || 'Failed to retrieve personnel profile from central database'}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white uppercase font-black text-[10px] px-8 h-10">
            Retry Sync
          </Button>
          <Button onClick={() => router.back()} variant="outline" className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] px-8 h-10">
            Abort
          </Button>
        </div>
      </div>
    );
  }

  const providerValue = {
    user: scopedUser,
    loading: false,
    login: async () => false,
    logout: () => { },
    isAuthenticated: !!scopedUser,
    updateUser: (partial: any) => {
      setScopedUser((prev: any) => ({ ...(prev || {}), ...(partial || {}) }));
    },
  } as any;

  return (
    <AuthContext.Provider value={providerValue}>
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
              <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
              Personnel Dossier
            </h1>
            <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
              Registry Archive • Command Center
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 hover:text-white transition-all h-10 px-6"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Back to Directory
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative group/avatar">
                <div className="absolute -inset-1 bg-blue-600 rounded-full blur opacity-20 group-hover/avatar:opacity-40 transition-opacity" />
                <Avatar className="h-32 w-32 border-2 border-slate-800 relative z-10 shadow-2xl bg-slate-950">
                  <AvatarImage src={(employee.profilePicture ? `${employee.profilePicture}?cb=${Date.now()}` : '')} alt={employee.name} />
                  <AvatarFallback className="text-4xl font-black bg-slate-950 text-blue-500">
                    {String(employee.name).split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-6 text-center md:text-left pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">{employee.name}</h2>
                    <Badge className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1",
                      employee.isActive ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30" : "bg-red-600/10 text-red-400 border-red-500/30"
                    )}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-3 text-slate-400 uppercase text-xs font-bold tracking-widest">
                    <span className="text-blue-500">{employee.designation || 'Specialist'}</span>
                    <span className="hidden md:inline text-slate-700">•</span>
                    <span>{employee.department}</span>
                    <span className="hidden md:inline text-slate-700">•</span>
                    <span className="text-slate-500 font-mono">ID: {employee.employeeId || employee._id}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4 border-t border-slate-800/50">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Contact Channel</span>
                    <div className="flex items-center gap-2 text-slate-300 font-mono text-sm uppercase">
                      <Mail className="h-3.5 w-3.5 text-blue-500" />
                      {employee.email}
                    </div>
                  </div>
                  {employee.phone && (
                    <div className="space-y-1">
                      <span className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Secure Line</span>
                      <div className="flex items-center gap-2 text-slate-300 font-mono text-sm uppercase">
                        <Phone className="h-3.5 w-3.5 text-blue-500" />
                        {employee.phone}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="w-full space-y-8">
          <TabsList className="bg-slate-900/80 border border-slate-800 p-1 h-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
            <TabsTrigger value="personal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Personal</TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Contact</TabsTrigger>
            <TabsTrigger value="job" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Duty</TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Intel</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Training</TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Financial</TabsTrigger>
            <TabsTrigger value="document" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Archives</TabsTrigger>
            <TabsTrigger value="kra" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Targets</TabsTrigger>
          </TabsList>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <TabsContent value="personal" className="mt-0 outline-none">
              <Personal_Info />
            </TabsContent>
            <TabsContent value="contact" className="mt-0 outline-none">
              <Contact_Info />
            </TabsContent>
            <TabsContent value="job" className="mt-0 outline-none">
              <JobTab />
            </TabsContent>
            <TabsContent value="experience" className="mt-0 outline-none">
              <ExperienceTab />
            </TabsContent>
            <TabsContent value="education" className="mt-0 outline-none">
              <EductionTab />
            </TabsContent>
            <TabsContent value="bank" className="mt-0 outline-none">
              <BankdetailsTab />
            </TabsContent>
            <TabsContent value="document" className="mt-0 outline-none">
              <DocumentTab />
            </TabsContent>
            <TabsContent value="kra" className="mt-0 outline-none">
              <KRATab />
            </TabsContent>
          </div>
        </Tabs>

        {/* Modals: ensure they update target employee */}
        <EditModalSection targetUserId={employee._id || employee.id} initialUser={employee} />
      </div>
    </AuthContext.Provider>
  );
}