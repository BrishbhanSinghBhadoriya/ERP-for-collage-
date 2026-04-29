import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'
import { Plus, Trash2, Building2, Calendar, Briefcase, History } from 'lucide-react'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ExperienceTab = () => {
  const { user, updateUser } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingExperience, setDeletingExperience] = useState<any>(null);

  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (args: { id?: string; index?: number }) => {
      const currentExperience = Array.isArray((user as any)?.experience) ? [...(user as any).experience] : [];
      const updatedExperience = currentExperience.filter((item: any, index: number) => {
        if (args?.id) return String(item?._id) !== String(args.id);
        if (typeof args?.index === 'number') return index !== args.index;
        return true;
      });
      
      const result = await authService.updateEmployeeProfile(user?._id as string, {
        experience: updatedExperience
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      return { result, updatedExperience };
    },
    onSuccess: (data) => {
      // Update local user state immediately
      updateUser({
        experience: data.updatedExperience
      } as any);
      
      toast.success('Experience record purged');
      qc.invalidateQueries({ queryKey: ['employee', (user as any)?._id || user?.id] });
    },
    onError: (error) => {
      console.error('Delete experience error:', error);
      toast.error('Failed to purge experience record');
    },
  });

  const handleDeleteClick = (idx: number) => {
    const experience = (user as any).experience[idx];
    setDeletingExperience({ ...experience, index: idx, id: experience?._id });
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingExperience) {
      deleteMutation.mutate({ id: deletingExperience?.id, index: deletingExperience?.index });
      setDeleteOpen(false);
      setDeletingExperience(null);
    }
  };

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 bg-slate-900/20 px-8 py-6">
        <div>
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Historical Archives</CardTitle>
          <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">Previous deployment logs and intelligence</CardDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-slate-800 hover:bg-blue-600 hover:text-white transition-all h-9 px-4 font-black uppercase text-[10px] tracking-widest"
          onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'experience' }))}
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Initialize Log
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        {Array.isArray((user as any).experience) && (user as any).experience.length > 0 ? (
          <div className="space-y-4">
            {(user as any).experience.map((exp: any, idx: number) => (
              <div key={exp?._id || idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 relative group transition-all hover:border-blue-500/30">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-tight text-white">{exp.companyName || exp.company}</h4>
                      <div className="flex flex-wrap gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                          <Briefcase className="h-3 w-3 text-blue-500" />
                          {exp.designation}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                          <Calendar className="h-3 w-3 text-blue-500" />
                          {exp.joiningDate || exp.startDate ? dayjs(exp.joiningDate || exp.startDate).format("MMM YYYY") : "N/A"} - {exp.exitDate || exp.endDate ? dayjs(exp.exitDate || exp.endDate).format("MMM YYYY") : "Present"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-red-500 transition-colors"
                    onClick={() => handleDeleteClick(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
            <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <History className="h-8 w-8 text-slate-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">No Archives Found</h3>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">Initialize work history for complete personnel profiling</p>
            </div>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase font-black tracking-widest">Purge Protocol</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest leading-relaxed">
              Are you sure you want to permanently erase this historical log? This action is irreversible within current session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 uppercase font-black text-[10px] tracking-widest h-10 px-6">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white uppercase font-black text-[10px] tracking-widest h-10 px-6 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ExperienceTab;