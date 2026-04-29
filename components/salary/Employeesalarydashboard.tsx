"use client";

import React, { useState, useEffect } from "react";
import { SalaryResponse, KRARatingCategory, ApiResponse } from "@/types/Hrms";
import SalarySlipModal from "@/components/salary/Salaryslipmodal";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  Star, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Loader2,
  PieChart,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const KRA_COLORS: Record<KRARatingCategory, string> = {
  Excellent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Good:      "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Average:   "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Poor:      "text-red-400 bg-red-400/10 border-red-400/20",
};

interface Props {
  token: string;
  employeeId?: string;
}

const EmployeeSalaryDashboard: React.FC<Props> = ({ token, employeeId }) => {
  const now = new Date();
  const [month,    setMonth]    = useState(now.getMonth() + 1);
  const [year,     setYear]     = useState(now.getFullYear());
  const [data,     setData]     = useState<SalaryResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  const fetchSalary = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = employeeId
        ? `${API_URL}/api/salary/${employeeId}?month=${month}&year=${year}`
        : `${API_URL}/api/salary/my?month=${month}&year=${year}`;

      const res  = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json: ApiResponse<SalaryResponse> = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.message || "Archive data load failed");
      }
    } catch (e) {
      setError("Grid synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchSalary(); }, [month, year, token]);

  return (
    <div className="p-8 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <PieChart className="h-6 w-6 text-blue-500" />
            Remuneration Intelligence
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Attendance Matrix • Objective Performance • Fiscal Summary
          </p>
        </div>
        <div className="flex gap-4">
          <select 
            value={month} 
            onChange={e => setMonth(+e.target.value)} 
            className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 font-mono text-xs uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-500"
          >
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={e => setYear(+e.target.value)} 
            className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 font-mono text-xs uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Synchronizing Remuneration Grid...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest">Access Interrupted</h4>
            <p className="text-red-400/70 text-xs font-bold uppercase tracking-tighter mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* ── Attendance Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={CheckCircle2} label="Operational" value={data.salary.presentDays} color="text-emerald-400" bgColor="bg-emerald-400/5" />
            <StatCard icon={Clock} label="Partial Log" value={data.salary.halfDays} color="text-amber-400" bgColor="bg-amber-400/5" />
            <StatCard icon={XCircle} label="Zero Log" value={data.salary.absentDays} color="text-red-400" bgColor="bg-red-400/5" />
            <StatCard icon={AlertCircle} label="Late Entry" value={data.salary.lateDays} color="text-purple-400" bgColor="bg-purple-400/5" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Salary Breakdown ── */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-emerald-500" /> Fiscal Breakdown — {MONTHS[month]} {year}
              </h3>
              <div className="space-y-4">
                <Row label="Base Remuneration" value={data.salary.basicSalary} />
                <Row label={`Pro-rated (${data.salary.effectiveDays} Cycles)`} value={data.salary.earnedSalary} />
                {data.salary.lateDeduction > 0 && <Row label="Temporal Deduction" value={-data.salary.lateDeduction} isDeduction />}
                {data.salary.kraAmount !== 0 && (
                  <Row label={`Objective ${data.salary.kraAmount >= 0 ? "Bonus" : "Penalty"}`} value={data.salary.kraAmount} isBonus={data.salary.kraAmount >= 0} />
                )}
                <div className="h-px bg-slate-800 my-4" />
                <Row label="Gross Remuneration" value={data.salary.grossSalary} isBold />
                <Row label="Regulatory PF (12%)" value={-data.salary.pf} isDeduction />
                <Row label="Regulatory TDS (10%)" value={-data.salary.tds} isDeduction />
                {data.salary.esic > 0 && <Row label="ESIC Contribution" value={-data.salary.esic} isDeduction />}
              </div>
              
              <div className="mt-8 bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden group/net">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/net:opacity-100 transition-opacity" />
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net Remuneration (Take Home)</span>
                    <div className="text-4xl font-black text-white tracking-tighter">
                      ₹{(data.salary.netSalary ?? 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* ── KRA Card ── */}
              {data.kra && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <Star className="h-12 w-12 text-amber-500/10" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
                    <Star className="h-4 w-4 text-amber-500" /> Objective Analysis
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manager Assessment</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(star => (
                            <Star 
                              key={star} 
                              className={cn(
                                "h-5 w-5",
                                star <= Math.round(data.kra!.average) ? "fill-amber-500 text-amber-500" : "text-slate-800"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-xl font-black text-white font-mono">{data.kra.average}/5</span>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "rounded-xl border p-5 flex flex-col items-center gap-2 min-w-[140px] transition-all group-hover:scale-105",
                      KRA_COLORS[data.kra.category]
                    )}>
                      <span className="text-lg font-black uppercase tracking-widest">{data.kra.category}</span>
                      <div className="h-px w-full bg-current opacity-20" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        {data.kra.bonus > 0 ? `+${data.kra.bonus}%` : `${data.kra.bonus}%`} Impact
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Download Button ── */}
              <Button 
                onClick={() => setShowSlip(true)}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-black uppercase tracking-[0.2em] text-xs h-16 rounded-2xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-600/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                <div className="flex items-center justify-between w-full px-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all">
                      <Download className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="block">Download Remuneration Slip</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{MONTHS[month]} {year} Archive</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSlip && data && (
        <SalarySlipModal data={data} month={month} year={year} onClose={() => setShowSlip(false)} />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bgColor }: any) => (
  <div className={cn("rounded-2xl border border-slate-800 p-6 space-y-4 relative group overflow-hidden transition-all hover:border-slate-700", bgColor)}>
    <div className="flex items-center justify-between">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <span className={cn("text-3xl font-black tracking-tighter", color)}>{value}</span>
    </div>
    <div className="space-y-1">
      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{label} Matrix</span>
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color.replace('text', 'bg'))} style={{ width: `${Math.min((value / 30) * 100, 100)}%` }} />
      </div>
    </div>
  </div>
);

const Row = ({ label, value, isDeduction, isBonus, isBold }: any) => {
  const colorClass = isDeduction ? "text-red-400" : isBonus ? "text-emerald-400" : "text-slate-300";
  return (
    <div className="flex justify-between items-center group/row">
      <span className={cn(
        "text-[11px] font-bold uppercase tracking-widest transition-colors",
        isBold ? "text-white font-black" : "text-slate-500 group-hover/row:text-slate-400"
      )}>
        {label}
      </span>
      <span className={cn(
        "font-mono text-sm font-bold tracking-tight",
        colorClass,
        isBold && "text-lg font-black"
      )}>
        {value < 0 ? "-" : ""}₹{Math.abs(value ?? 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
};

export default EmployeeSalaryDashboard;
