"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { authService } from "@/lib/auth";
import EmployeeSalaryDashboard from "@/components/salary/Employeesalarydashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalarySlipPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = Cookies.get("token") || authService.getToken() || localStorage.getItem("token");
    setToken(t);
  }, []);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            Financial Archive
          </h1>
          <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
            Personal Remuneration • Command Center
          </p>
        </div>
      </div>

      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400 text-center md:text-left">Remuneration Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {token ? (
            <EmployeeSalaryDashboard token={token} />
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="text-red-500/50 uppercase text-xs font-black tracking-widest italic animate-pulse">
                Authentication Required: Re-Initialize Session
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
