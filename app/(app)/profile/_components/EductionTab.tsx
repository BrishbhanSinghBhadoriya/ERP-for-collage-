import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { GraduationCap, Plus, Calendar, BookOpen, School, Award } from 'lucide-react'
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

const EductionTab = () => {
  const { user } = useAuth();
  
  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 bg-slate-900/20 px-8 py-6">
        <div>
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Academic Training</CardTitle>
          <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">Intellectual development and certification logs</CardDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-slate-800 hover:bg-blue-600 hover:text-white transition-all h-9 px-4 font-black uppercase text-[10px] tracking-widest"
          onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'education' }))}
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Initialize Log
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        {Array.isArray((user as any).education) && (user as any).education.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(user as any).education.map((ed: any, idx: number) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 relative group transition-all hover:border-blue-500/30">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black uppercase tracking-tight text-white leading-tight">{ed.degree}</h4>
                      <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.1em]">
                        <School className="h-3 w-3" />
                        {ed.institution}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/50">
                      <div className="space-y-1">
                        <span className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">Temporal Range</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Calendar className="h-3 w-3 text-blue-500" />
                          {ed.startDate ? dayjs(ed.startDate).format("YYYY") : '-'} - {ed.endDate ? dayjs(ed.endDate).format("YYYY") : 'Present'}
                        </div>
                      </div>
                      {ed.grade && (
                        <div className="space-y-1">
                          <span className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">Performance</span>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <Award className="h-3 w-3" />
                            {ed.grade}
                          </div>
                        </div>
                      )}
                    </div>

                    {ed.fieldOfStudy && (
                      <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800">
                        <BookOpen className="h-3 w-3 text-blue-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ed.fieldOfStudy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
            <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-slate-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Academic Logs Empty</h3>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">Register educational qualifications for personnel validation</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EductionTab;