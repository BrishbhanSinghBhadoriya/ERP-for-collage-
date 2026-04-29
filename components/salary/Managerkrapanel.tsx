"use client";

import React, { useState } from "react";
import { IKRA, ApiResponse } from "@/types/Hrms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Save, Loader2, Target, Calendar, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/+$/, '');
const API_URL = `${NEXT_PUBLIC_API_URL}/`;

interface Employee { _id: string; name: string; employeeId: string; }

interface Props {
  token:     string;
  employees: Employee[];
}

const ManagerKRAPanel: React.FC<Props> = ({ token, employees }) => {
  const [empId,   setEmpId]   = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    if (!empId || !rating) {
      toast.error("Personnel and rating parameters required");
      return;
    }
    setSaving(true);
    try {
      const payload = { employeeId: empId, date, rating, comment };
      let res;
      try {
        res = await fetch(`${API_URL}kra/mark`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("API call failed");
      } catch (err) {
        res = await fetch(`${API_URL}kra/markDailyKRA`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
      
      const json: ApiResponse<IKRA> = await res.json();

      if (json.success || (json as any).status === "success") {
        toast.success("Operational rating logged");
        setRating(0);
        setComment("");
      } else {
        toast.error(json.message || "Rating protocol failed");
      }
    } catch {
      toast.error("Transmission error during rating log");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-2xl p-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
        <Target className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-black uppercase tracking-widest text-white">Objective Analysis</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <User className="h-3 w-3" /> Target Personnel
          </Label>
          <select 
            value={empId} 
            onChange={e => setEmpId(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-xs uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- SELECT PERSONNEL --</option>
            {employees.map(e => <option key={e._id} value={e._id}>{e.employeeId} • {e.name}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="h-3 w-3" /> Assessment Date
          </Label>
          <Input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setDate(e.target.value)}
            className="bg-slate-950 border-slate-800 h-12 uppercase text-xs tracking-widest font-mono text-slate-300"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency Rating</Label>
          <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-all hover:scale-110"
                >
                  <Star 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      star <= (hovered || rating) ? "fill-amber-500 text-amber-500" : "text-slate-800"
                    )} 
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-l border-slate-800 pl-3 ml-2">
                {["","POOR","BELOW AVG","AVERAGE","GOOD","EXCELLENT"][rating]}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="h-3 w-3" /> Qualitative Intel
          </Label>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="ENCODE OBSERVATIONS..."
            className="bg-slate-950 border-slate-800 uppercase text-[10px] tracking-widest font-mono p-4 min-h-[100px]"
          />
        </div>

        <Button
          onClick={() => void handleSave()}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-xs h-12 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Initialize Log Protocol
        </Button>
      </div>
    </div>
  );
};

export default ManagerKRAPanel;