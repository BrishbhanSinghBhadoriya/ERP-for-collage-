import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Edit2, Mail, Smartphone, ShieldAlert, Globe } from 'lucide-react'
import { cn } from "@/lib/utils";

const Contact_Info = () => {
  const { user } = useAuth();
  const get = (v: any, fallback: string = '-') => (v ?? v === 0 ? String(v) : fallback);

  const Tile = ({
    icon: Icon,
    label,
    value,
    accentColor,
  }: { icon: any; label: string; value: string; accentColor: string }) => (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 relative group overflow-hidden">
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity", accentColor)} />
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors")}>
          <Icon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
        </div>
        <div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{label}</div>
          <div className="text-sm font-bold text-slate-200 uppercase tracking-wide">{value || '-'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 bg-slate-900/20 px-8 py-6">
        <div> 
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Communication Grid</CardTitle>
          <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
            Digital and analog contact protocols
          </CardDescription>
        </div>
        <Button 
          size="icon" 
          variant="outline" 
          className="border-slate-800 hover:bg-blue-600 hover:text-white transition-all h-10 w-10 rounded-lg"
          onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'contact' }))}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Tile
            icon={Globe}
            label="Professional Domain"
            value={get((user as any)?.professionalEmailId)}
            accentColor="bg-blue-600"
          />
          <Tile
            icon={Mail}
            label="Personal Domain"
            value={get(user?.email)}
            accentColor="bg-emerald-600"
          />
          <Tile
            icon={Smartphone}
            label="Primary Secure Line"
            value={get(user?.phone)}
            accentColor="bg-amber-600"
          />
          <Tile
            icon={ShieldAlert}
            label="Emergency Protocol"
            value={get((user as any)?.emergencyContactNo)}
            accentColor="bg-red-600"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default Contact_Info;