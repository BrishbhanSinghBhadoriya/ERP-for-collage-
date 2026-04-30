import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from "js-cookie";
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  User, 
  Calendar, 
  IndianRupee, 
  Download, 
  Save, 
  Loader2, 
  Briefcase, 
  Building2, 
  Mail,
  ShieldCheck,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types/Interfaces
interface SalaryStructure {
    basic: number;
    hra: number;
    specialAllowance: number;
    pfContribution: number;
    totalMonthly: number;
    totalAnnual: number;
}

interface BankDetail {
    bankName: string;
    bankAccountNumber: string;
    bankAccountType: string;
    bankIFSC: string;
    bankAccountHolderName: string;
}

interface Documents {
    panNumber?: string;
    uanNumber?: string;
}

interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    salary?: SalaryStructure;
    bankDetails?: BankDetail[];
    documents?: Documents;
}

interface SalaryFormData {
    basic: string;
    hra: string;
    specialAllowance: string;
    pfContribution: string;
}

interface ApiResponse<T> {
    success?: boolean;
    status: string;
    message?: string;
    data?: T;
    count?: number;
}

interface Props {
    employees?: Employee[];
}

const SalarySlipManager: React.FC<Props> = ({ employees: initialEmployees }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [salaryData, setSalaryData] = useState<SalaryFormData>({
        basic: '',
        hra: '',
        specialAllowance: '',
        pfContribution: ''
    });
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Fetch all employees on component mount
    useEffect(() => {
        if (initialEmployees && initialEmployees.length > 0) {
            setEmployees(initialEmployees);
        } else {
            fetchEmployees();
        }
    }, [initialEmployees]);

    const fetchEmployees = async (): Promise<void> => {
        try {
            setLoading(true);
            let response;
            try {
                response = await api.get('/api/hr/getEmployees');
            } catch (err) {
                response = await api.get('/hr/getEmployees');
            }

            const employeesData = response.data.employees || response.data.data;
            if (employeesData && Array.isArray(employeesData)) {
                setEmployees(employeesData);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to sync personnel data');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = async (employeeId: string): Promise<void> => {
        if (!employeeId) {
            setSelectedEmployee(null);
            setSalaryData({ basic: '', hra: '', specialAllowance: '', pfContribution: '' });
            return;
        }

        try {
            let response;
            try {
                response = await api.get(`/api/hr/getEmployee/${employeeId}`);
            } catch (err) {
                response = await api.get(`/hr/getEmployee/${employeeId}`);
            }

            const employee = response.data.employee || response.data.data;
            if (employee) {
                setSelectedEmployee(employee);
                if (employee.salary) {
                    setSalaryData({
                        basic: employee.salary.basic?.toString() || '',
                        hra: employee.salary.hra?.toString() || '',
                        specialAllowance: employee.salary.specialAllowance?.toString() || '',
                        pfContribution: employee.salary.pfContribution?.toString() || ''
                    });
                } else {
                    setSalaryData({ basic: '', hra: '', specialAllowance: '', pfContribution: '' });
                }
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            toast.error('Personnel retrieval failed');
        }
    };

    const handleSalaryChange = (field: keyof SalaryFormData, value: string): void => {
        setSalaryData(prev => ({ ...prev, [field]: value }));
    };

    const calculateTotal = (): number => {
        const basic = parseFloat(salaryData.basic) || 0;
        const hra = parseFloat(salaryData.hra) || 0;
        const special = parseFloat(salaryData.specialAllowance) || 0;
        return basic + hra + special;
    };

    const handleSaveSalary = async (): Promise<void> => {
        if (!selectedEmployee) {
            toast.error('No personnel selected');
            return;
        }

        if (!salaryData.basic || parseFloat(salaryData.basic) <= 0) {
            toast.error('Basic remuneration parameter required');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                basic: parseFloat(salaryData.basic),
                hra: parseFloat(salaryData.hra) || 0,
                specialAllowance: parseFloat(salaryData.specialAllowance) || 0,
                pfContribution: parseFloat(salaryData.pfContribution) || 0
            };

            let response;
            try {
                response = await api.put<ApiResponse<Employee>>(
                    `/api/hr/employee-salary/${selectedEmployee.employeeId}`,
                    payload
                );
            } catch (err) {
                response = await api.put<ApiResponse<Employee>>(
                    `/hr/employee-salary/${selectedEmployee.employeeId}`,
                    payload
                );
            }

            if (response.data.success || response.data.status === 'success' || response.data.status === 'OK') {
                toast.success('Fiscal parameters saved successfully');
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error saving salary:', error);
            toast.error('Salary protocol update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSalarySlip = async (): Promise<void> => {
        if (!selectedEmployee) {
            toast.error('No personnel selected');
            return;
        }

        if (!selectedEmployee.salary || !selectedEmployee.salary.basic) {
            toast.error('Fiscal parameters not initialized');
            return;
        }

        try {
            setLoading(true);
            let response;
            try {
                response = await api.get(
                    `/api/salary/slip/${selectedEmployee.employeeId}/${selectedMonth}/${selectedYear}`,
                    { responseType: 'blob' }
                );
            } catch (err) {
                try {
                    response = await api.get(
                        `/api/salary-slip/${selectedEmployee.employeeId}/${selectedMonth}/${selectedYear}`,
                        { responseType: 'blob' }
                    );
                } catch (err2) {
                    response = await api.get(
                        `/salary-slip/${selectedEmployee.employeeId}/${selectedMonth}/${selectedYear}`,
                        { responseType: 'blob' }
                    );
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `intel-remuneration-${selectedEmployee.employeeId}-${selectedMonth}-${selectedYear}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Remuneration slip downloaded');
        } catch (error) {
            console.error('Error downloading salary slip:', error);
            toast.error('Archive retrieval failed');
        } finally {
            setLoading(false);
        }
    };

    const monthNames: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Side - Employee Selection */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel Selection</h3>
                        </div>
                        
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-blue-600 rounded-lg blur opacity-10 group-hover:opacity-20 transition-opacity" />
                            <select
                                value={selectedEmployee?.employeeId || ''}
                                onChange={(e) => handleEmployeeSelect(e.target.value)}
                                className="relative w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-xs uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                <option value="">-- SELECT PERSONNEL --</option>
                                {employees.map(emp => (
                                    <option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.employeeId} • {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedEmployee && (
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 space-y-6 relative overflow-hidden group transition-all hover:border-blue-500/30">
                            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors" />
                            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tight text-white">{selectedEmployee.name}</h4>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active Personnel Profile</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">Sector</span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                        <Building2 className="h-3 w-3 text-slate-700" />
                                        {selectedEmployee.department}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">Designation</span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                        <Briefcase className="h-3 w-3 text-slate-700" />
                                        {selectedEmployee.designation}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">Identifier</span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase font-mono">
                                        <ShieldCheck className="h-3 w-3 text-slate-700" />
                                        {selectedEmployee.employeeId}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">Comm Link</span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 lowercase truncate">
                                        <Mail className="h-3 w-3 text-slate-700" />
                                        {selectedEmployee.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Temporal Parameters</h3>
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-xs uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                {monthNames.map((month, index) => (
                                    <option key={index + 1} value={index + 1}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-xs uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                {Array.from({ length: 5 }, (_, i) => {
                                    const year = new Date().getFullYear() - 2 + i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Side - Salary Structure */}
                <div className="space-y-8">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <IndianRupee className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fiscal Configuration</h3>
                    </div>

                    {selectedEmployee ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        Basic Remuneration <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            value={salaryData.basic}
                                            onChange={(e) => handleSalaryChange('basic', e.target.value)}
                                            className="bg-slate-950 border-slate-800 pl-4 h-11 uppercase text-xs tracking-widest font-mono text-emerald-400"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HRA Protocol</Label>
                                    <Input
                                        type="number"
                                        value={salaryData.hra}
                                        onChange={(e) => handleSalaryChange('hra', e.target.value)}
                                        className="bg-slate-950 border-slate-800 h-11 uppercase text-xs tracking-widest font-mono text-slate-300"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Special Allowance</Label>
                                    <Input
                                        type="number"
                                        value={salaryData.specialAllowance}
                                        onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
                                        className="bg-slate-950 border-slate-800 h-11 uppercase text-xs tracking-widest font-mono text-slate-300"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deduction (PF)</Label>
                                    <Input
                                        type="number"
                                        value={salaryData.pfContribution}
                                        onChange={(e) => handleSalaryChange('pfContribution', e.target.value)}
                                        className="bg-slate-950 border-slate-800 h-11 uppercase text-xs tracking-widest font-mono text-red-400"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2">
                                    <TrendingUp className="h-10 w-10 text-emerald-500/10" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-end border-b border-slate-800/50 pb-4">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Total Monthly Protocol</span>
                                            <div className="text-3xl font-black text-emerald-400 tracking-tighter">
                                                ₹{calculateTotal().toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Annual Aggregate</span>
                                            <div className="text-lg font-black text-white tracking-tight">
                                                ₹{(calculateTotal() * 12).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-3 w-3 text-slate-700" />
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">Calculated based on active parameters</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-800">
                                <Button
                                    onClick={handleSaveSalary}
                                    disabled={loading}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[0.2em] h-12 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Confirm Fiscal Data
                                </Button>

                                <Button
                                    onClick={handleDownloadSalarySlip}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-[0.2em] h-12 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                    Archive Remuneration
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
                            <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <IndianRupee className="h-8 w-8 text-slate-800" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Awaiting Selection</h3>
                                <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-700">Initialize personnel profile to access fiscal grid</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalarySlipManager;