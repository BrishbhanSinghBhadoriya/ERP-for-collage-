 "use client";
 
 import React, { useState, useEffect, useMemo } from "react";
 import { useAuth } from "@/lib/auth-context";
import { RoleGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import SalarySlipManager from "@/components/Salaryslipmanager";
 import ManagerKRAPanel from "@/components/salary/Managerkrapanel";
 import Cookies from "js-cookie";
 import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
 import axios from "axios";
 import api from "@/lib/api";
 import { extractList, extractData } from "@/lib/utils";
 
 const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/+$/, '');
const API_URL = `${NEXT_PUBLIC_API_URL}/`;
 
 export default function SalaryManagerPage() {
   const { user } = useAuth();
   const role = user?.role;
   const [employeesData, setEmployeesData] = useState<any[]>([]);
   const [employeeOverrides, setEmployeeOverrides] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);

   const [headerData, setHeaderData] = useState({
     title: "Payroll Terminal",
     subtitle: "Fiscal Management • Admin Control Center",
     kraTitle: "Objective Analysis"
   });
   const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
   const [tempHeader, setTempHeader] = useState({ title: "", subtitle: "", kraTitle: "" });

   const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
   const [editingPersonnel, setEditingPersonnel] = useState<any>(null);
   const [personnelForm, setPersonnelForm] = useState({
     name: "",
     employeeId: "",
     department: "",
     designation: "",
     email: ""
   });
 
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
       
       const data = res.data.employees || res.data.data;
       if (data && Array.isArray(data)) {
         setEmployeesData(data);
       }
     } catch (err) {
       console.error("Error fetching employees in page:", err);
     } finally {
       setLoading(false);
     }
   };

   const employees = useMemo(() => {
     const list = [...employeesData];
     employeeOverrides.forEach(ov => {
       const idx = list.findIndex(e => (e.id || e._id || e.employeeId) === (ov.id || ov._id || ov.employeeId));
       if (idx > -1) list[idx] = { ...list[idx], ...ov };
       else list.unshift(ov);
     });
     return list;
   }, [employeesData, employeeOverrides]);

   const handleSaveHeader = () => {
     setHeaderData(tempHeader);
     setIsHeaderModalOpen(false);
     toast.success("Header updated");
   };

   const handleSavePersonnel = () => {
     const personnel = {
       id: editingPersonnel?.id || editingPersonnel?._id || `emp-${Date.now()}`,
       _id: editingPersonnel?.id || editingPersonnel?._id || `emp-${Date.now()}`,
       ...personnelForm
     };

     setEmployeeOverrides(prev => {
       const existing = prev.filter(p => (p.id || p._id || p.employeeId) !== (personnel.id || personnel._id || personnel.employeeId));
       return [personnel, ...existing];
     });
     setIsPersonnelModalOpen(false);
     toast.success(editingPersonnel ? "Personnel record updated" : "Personnel record added");
   };

   const openAddPersonnel = () => {
     setEditingPersonnel(null);
     setPersonnelForm({ name: "", employeeId: `EMP-${Date.now().toString().slice(-4)}`, department: "", designation: "", email: "" });
     setIsPersonnelModalOpen(true);
   };
 
  return (
    <RoleGuard allowedRoles={['admin', 'hr', 'manager']}>
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 group">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
              <h1 className="text-4xl font-black tracking-tighter uppercase text-white">{headerData.title}</h1>
              {allowed && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setTempHeader(headerData);
                    setIsHeaderModalOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 text-slate-500" />
                </Button>
              )}
            </div>
            <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
              {headerData.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {allowed && (
              <Button 
                onClick={openAddPersonnel}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Personnel
              </Button>
            )}
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
                  <SalarySlipManager employees={employees} />
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
                <ManagerKRAPanel token={token} employees={employees} title={headerData.kraTitle} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header Edit Modal */}
      <Dialog open={isHeaderModalOpen} onOpenChange={setIsHeaderModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Edit Terminal Headers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal Title</Label>
              <Input 
                value={tempHeader.title}
                onChange={(e) => setTempHeader({...tempHeader, title: e.target.value})}
                className="bg-slate-950 border-slate-800 rounded-xl font-black text-white uppercase text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subtitle / Status</Label>
              <Input 
                value={tempHeader.subtitle}
                onChange={(e) => setTempHeader({...tempHeader, subtitle: e.target.value})}
                className="bg-slate-950 border-slate-800 rounded-xl font-black text-white uppercase text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KRA Section Title</Label>
              <Input 
                value={tempHeader.kraTitle}
                onChange={(e) => setTempHeader({...tempHeader, kraTitle: e.target.value})}
                className="bg-slate-950 border-slate-800 rounded-xl font-black text-white uppercase text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHeaderModalOpen(false)} className="rounded-xl border-slate-800 font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSaveHeader} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Personnel Add/Edit Modal */}
      <Dialog open={isPersonnelModalOpen} onOpenChange={setIsPersonnelModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              {editingPersonnel ? 'Edit Personnel' : 'Add New Personnel'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Name</Label>
                <Input 
                  value={personnelForm.name}
                  onChange={(e) => setPersonnelForm({...personnelForm, name: e.target.value})}
                  className="bg-slate-950 border-slate-800 rounded-xl font-black text-white uppercase text-xs"
                  placeholder="E.G. RAHUL SHARMA"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Employee ID</Label>
                <Input 
                  value={personnelForm.employeeId}
                  onChange={(e) => setPersonnelForm({...personnelForm, employeeId: e.target.value})}
                  className="bg-slate-950 border-slate-800 rounded-xl font-black text-white uppercase text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</Label>
                <Input 
                  value={personnelForm.department}
                  onChange={(e) => setPersonnelForm({...personnelForm, department: e.target.value})}
                  className="bg-slate-950 border-slate-800 rounded-xl font-black text-white uppercase text-xs"
                  placeholder="E.G. ENGINEERING"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Designation</Label>
                <Input 
                  value={personnelForm.designation}
                  onChange={(e) => setPersonnelForm({...personnelForm, designation: e.target.value})}
                  className="bg-slate-950 border-slate-800 rounded-xl font-black text-white uppercase text-xs"
                  placeholder="E.G. SDE-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</Label>
              <Input 
                value={personnelForm.email}
                onChange={(e) => setPersonnelForm({...personnelForm, email: e.target.value})}
                className="bg-slate-950 border-slate-800 rounded-xl font-black text-white text-xs"
                placeholder="E.G. rahul@nexus.edu"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPersonnelModalOpen(false)} className="rounded-xl border-slate-800 font-black text-[10px] tracking-widest uppercase">Cancel</Button>
            <Button onClick={handleSavePersonnel} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
 }
