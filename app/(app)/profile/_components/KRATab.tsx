
"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Edit, Save, Trash2, Plus, Target, Phone, Clock, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface KRALimit {
  calls: number;
  talktime: number; // in minutes
  sales: number;
}

const KRATab = () => {
  const { user, updateUser } = useAuth();
  
  const initialKRA: KRALimit = user?.kraLimits || {
    calls: 250,
    talktime: 150,
    sales: 1
  };

  const [isEditing, setIsEditing] = useState(false);
  const [tempKRA, setTempKRA] = useState<KRALimit>(initialKRA);
  const [isSaving, setIsSaving] = useState(false);

  const hasKRA = !!user?.kraLimits;

  const handleSave = async () => {
    if (tempKRA.calls < 0 || tempKRA.talktime < 0 || tempKRA.sales < 0) {
      toast.error("Valid positive metrics required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put("/users/profile/update", {
        kraLimits: tempKRA
      });

      if (response.data.success) {
        updateUser({ ...user, kraLimits: tempKRA } as any);
        setIsEditing(false);
        toast.success("Objective parameters updated");
      } else {
        toast.error(response.data.message || "Protocol update failed");
      }
    } catch (err) {
      toast.error("Transmission error during update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      const response = await api.put("/users/profile/update", {
        kraLimits: null
      });

      if (response.data.success) {
        updateUser({ ...user, kraLimits: undefined } as any);
        setTempKRA({ calls: 250, talktime: 150, sales: 1 });
        setIsEditing(false);
        toast.success("Objectives reset to factory defaults");
      }
    } catch (err) {
      toast.error("Purge protocol failed");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}H ${m}M`;
  };

  const GoalCard = ({ icon: Icon, label, value, subValue, accentColor }: any) => (
    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 relative group overflow-hidden">
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50", accentColor)} />
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <span className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
            {subValue && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subValue}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 bg-slate-900/20 px-8 py-6">
        <div>
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Objective Parameters</CardTitle>
          <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">Key Responsibility Areas and daily targets</CardDescription>
        </div>
        {!isEditing && hasKRA && (
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="outline" 
              className="border-slate-800 hover:bg-blue-600 hover:text-white transition-all h-10 w-10 rounded-lg"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="border-slate-800 hover:bg-red-600 hover:text-white transition-all h-10 w-10 rounded-lg"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-8">
        {isEditing ? (
          <div className="max-w-md mx-auto space-y-8 py-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Connection Target</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Input
                    type="number"
                    value={tempKRA.calls}
                    onChange={(e) => setTempKRA({ ...tempKRA, calls: parseInt(e.target.value) || 0 })}
                    className="bg-slate-950 border-slate-800 pl-12 h-12 uppercase text-xs tracking-widest font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment Duration (Minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    type="number"
                    value={tempKRA.talktime}
                    onChange={(e) => setTempKRA({ ...tempKRA, talktime: parseInt(e.target.value) || 0 })}
                    className="bg-slate-950 border-slate-800 pl-12 h-12 uppercase text-xs tracking-widest font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversion Units</Label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  <Input
                    type="number"
                    value={tempKRA.sales}
                    onChange={(e) => setTempKRA({ ...tempKRA, sales: parseInt(e.target.value) || 0 })}
                    className="bg-slate-950 border-slate-800 pl-12 h-12 uppercase text-xs tracking-widest font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-xs h-12 px-8 flex-1 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Confirm Parameters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTempKRA(initialKRA);
                  setIsEditing(false);
                }}
                className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] h-12 px-6 hover:bg-slate-800 transition-all"
              >
                Abort
              </Button>
            </div>
          </div>
        ) : hasKRA ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GoalCard 
              icon={Phone} 
              label="Connection Target" 
              value={user?.kraLimits?.calls || 0} 
              subValue="UNITS / DAY"
              accentColor="bg-blue-600"
            />
            <GoalCard 
              icon={Clock} 
              label="Deployment Time" 
              value={formatTime(user?.kraLimits?.talktime || 0)} 
              subValue="ACTIVE / DAY"
              accentColor="bg-emerald-600"
            />
            <GoalCard 
              icon={TrendingUp} 
              label="Conversion Objective" 
              value={user?.kraLimits?.sales || 0} 
              subValue="UNITS / DAY"
              accentColor="bg-amber-600"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
            <div className="h-20 w-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
              <Target className="h-10 w-10 text-slate-700" />
              <div className="absolute inset-0 blur-xl bg-blue-600/5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Objectives Not Defined</h3>
              <p className="text-xs font-bold uppercase tracking-tighter text-slate-600 max-w-xs mx-auto leading-relaxed">
                Initialize Key Responsibility Areas to track operational performance
              </p>
            </div>
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600/10 border border-blue-500/30 text-blue-500 hover:bg-blue-600 hover:text-white uppercase font-black text-[10px] tracking-[0.2em] px-8 h-11"
            >
              <Plus className="mr-2 h-4 w-4" /> Initialize Protocol
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KRATab;
