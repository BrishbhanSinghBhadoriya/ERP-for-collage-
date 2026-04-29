import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import React from 'react'
import { useAuth } from '@/lib/auth-context'
import { Edit2, User, Calendar, Droplets, UserCheck, MapPin, Globe, Shield, Activity } from 'lucide-react'
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const Personal_Info = () => {
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
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Core Identity Data</CardTitle>
          <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">Personnel biological and legal parameters</CardDescription>
        </div>
        <Button 
          size="icon" 
          variant="outline" 
          className="border-slate-800 hover:bg-blue-600 hover:text-white transition-all h-10 w-10 rounded-lg"
          onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'personal' }))}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Tile
            icon={User}
            label="Full Designation"
            value={get(user?.name)}
            accentColor="bg-blue-600"
          />
          <Tile
            icon={Calendar}
            label="Origin Date"
            value={
              (user as any)?.dob || (user as any)?.dateOfBirth
                ? dayjs((user as any)?.dob || (user as any)?.dateOfBirth).format("DD MMM YYYY")
                : "-"
            }
            accentColor="bg-emerald-600"
          />
          <Tile
            icon={UserCheck}
            label="Guardian/Spouse"
            value={get(user?.fatherName)}
            accentColor="bg-purple-600"
          />
          <Tile
            icon={Droplets}
            label="Biological Type"
            value={get(user?.bloodGroup)}
            accentColor="bg-red-600"
          />
          <Tile
            icon={Shield}
            label="Gender Profile"
            value={get(user?.gender)}
            accentColor="bg-amber-600"
          />
          <Tile
            icon={Activity}
            label="Marital Status"
            value={get(user?.maritalStatus)}
            accentColor="bg-cyan-600"
          />
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <MapPin className="h-3 w-3 text-blue-500" /> Current Sector
            </h4>
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 min-h-[100px]">
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider leading-relaxed">
                {typeof user?.address === 'object' 
                  ? `${(user as any)?.address?.street || ''} ${(user as any)?.address?.city || ''} ${(user as any)?.address?.state || ''}`
                  : user?.address || 'UNSPECIFIED'}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Globe className="h-3 w-3 text-blue-500" /> Permanent Sector
            </h4>
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 min-h-[100px]">
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider leading-relaxed">
                {typeof user?.permanentAddress === 'object' 
                  ? `${(user as any)?.permanentAddress?.street || ''} ${(user as any)?.permanentAddress?.city || ''} ${(user as any)?.permanentAddress?.state || ''}`
                  : user?.permanentAddress || 'MATCHES CURRENT SECTOR'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Personal_Info;