 "use client";
 
 import React, { useState, useEffect } from "react";
 import { useAuth } from "@/lib/auth-context";
import { RoleGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import SalarySlipManager from "@/components/Salaryslipmanager";
 import ManagerKRAPanel from "@/components/salary/Managerkrapanel";
 import Cookies from "js-cookie";
 import axios from "axios";
 import api from "@/lib/api";
 
 const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/+$/, '');
const API_URL = `${NEXT_PUBLIC_API_URL}/`;
 
 export default function SalaryManagerPage() {
   const { user } = useAuth();
   const role = user?.role;
   const [employees, setEmployees] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
 
   const allowed = role === "hr" || role === "manager" || role === "admin";
   const token = Cookies.get("token") || "";
 
   useEffect(() => {
     if (allowed) {
       fetchEmployees();
     }
   }, [allowed]);
 
   const fetchEmployees = async () => {
     try {
       setLoading(true);
       let res;
       try {
         res = await api.get("/api/hr/getEmployees");
       } catch (err) {
         res = await api.get("/hr/getEmployees");
       }
       
       const employeesData = res.data.employees || res.data.data;
       if (employeesData && Array.isArray(employeesData)) {
         setEmployees(employeesData);
       }
     } catch (err) {
       console.error("Error fetching employees in page:", err);
     } finally {
       setLoading(false);
     }
   };
 
  return (
    <RoleGuard allowedRoles={['admin', 'hr', 'manager']}>
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
              <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
              Payroll Terminal
            </h1>
            <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
              Fiscal Management • Admin Control Center
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Salary Manager */}
          <div className="lg:col-span-8">
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden group min-h-[600px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
              <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
                <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Salary Dispatcher</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {allowed ? (
                  <SalarySlipManager />
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <div className="text-red-500/50 uppercase text-xs font-black tracking-widest italic">
                      Access Restricted: Insufficient Clearance
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side: KRA Panel */}
          <div className="lg:col-span-4">
            {allowed && (
              <div className="space-y-6">
                <ManagerKRAPanel token={token} employees={employees} />
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
 }
