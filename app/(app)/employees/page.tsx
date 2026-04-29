"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeForm } from '@/components/forms/employee-form';
import { Employee } from '@/lib/types';
import { UserPlus, Eye, Trash2, Clock, Users, Download } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { deleteEmployee, fetchEmployees, importEmployees, PaginationParams, fetchAllEmployees } from '@/components/functions/Employee';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
// @ts-ignore - file-saver doesn't have types
import { saveAs } from 'file-saver';

import { useFiltersStore } from '@/store/filters';
import { useDebounce } from '@/hooks/use-debounce';
import { RoleGuard } from '@/components/auth/role-guard';
import { courseApi, dashboardApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import { extractList, extractData } from '@/lib/utils';
import { useMemo } from 'react';

export default function EmployeesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { employeeFilters, setEmployeeFilters } = useFiltersStore();

  // Fetch departments dynamically
  const { data: departmentsData } = useFetch<any[]>(courseApi.getDepartments);
  const departments = useMemo(() => extractList<Record<string, any>>(departmentsData), [departmentsData]);

  // Fetch overall stats for employee-related numbers
  const { data: dashboardStats } = useFetch<any>(dashboardApi.getStats);
  const statsData = useMemo(() => extractData<Record<string, any>>(dashboardStats), [dashboardStats]);

  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: employeeFilters.search?.trim() || undefined
  });

  const debouncedSearch = useDebounce(employeeFilters.search, 500);

  useEffect(() => {
    setPaginationParams(prev => ({
      ...prev,
      search: debouncedSearch?.trim() || undefined,
      page: 1
    }));
  }, [debouncedSearch]);

  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const payload = {
        employeeId: employeeData.employeeId || "",
        username: employeeData.username || "",
        password: employeeData.password || "",
        name: employeeData.name || "",
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        emergencyContactNo: employeeData.emergencyContactNo || "",
        department: employeeData.department || "",
        role: employeeData.role || "",
        designation: employeeData.designation || "",
        joiningDate: employeeData.joiningDate || "",
        dob: employeeData.dob || "",
        status: employeeData.status || "active",
        gender: employeeData.gender || "",
        isActive: employeeData.status === "active",
      };

      const response = await api.post('/users/register', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Employee added successfully');
      setShowAddDialog(false);
      refetch();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to add employee';
      toast.error(message);
    },
  });

  const importMutation = useMutation({
    mutationFn: importEmployees,
    onSuccess: (res) => {
      toast.success('Employees imported successfully');
      refetch();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Import failed';
      toast.error(message);
    }
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', paginationParams],
    queryFn: () => fetchEmployees(paginationParams),
  });

  const employeeList = useMemo(() => extractList<Employee>(data), [data]);

  const deleteEmployeeMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: (res) => {
      if (res?.success) {
        toast.success('Employee deleted successfully');
        refetch();
      } else {
        toast.error(res?.message || 'Failed to delete employee');
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'An error occurred while deleting the employee');
    },
  });

  const handleAddEmployee = async (data: any) => {
    addEmployeeMutation.mutate(data);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!employeeId) return;
    deleteEmployeeMutation.mutate(employeeId);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      e.target.value = '';
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...');
      // Pass the current filters to fetchAllEmployees to export filtered data
      const allData = await fetchAllEmployees({ 
        limit: 5000,
        status: paginationParams.status,
        department: paginationParams.department,
        search: paginationParams.search
      });
      
      if (!allData || allData.length === 0) {
        toast.dismiss();
        toast.error('No employee data to export');
        return;
      }

      const excelData = allData.map((emp: any) => ({
        'Employee ID': emp.employeeId || emp.empCode || '',
        'Name': emp.name || '',
        'Username': emp.username || '',
        'Email': emp.email || '',
        'Phone': emp.phone || '',
        'Department': emp.department || '',
        'Designation': emp.designation || '',
        'Role': emp.role || '',
        'Joining Date': emp.joiningDate ? dayjs(emp.joiningDate).format('DD-MM-YYYY') : '',
        'DOB': emp.dob ? dayjs(emp.dob).format('DD-MM-YYYY') : '',
        'Status': emp.status || (emp.isActive ? 'active' : 'inactive'),
        'Gender': emp.gender || '',
        'Emergency Contact': emp.emergencyContactNo || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Filename includes status if filtered
      const statusSuffix = paginationParams.status ? `_${paginationParams.status}` : '';
      saveAs(blob, `employees_export${statusSuffix}_${dayjs().format('DD_MM_YYYY')}.xlsx`);
      
      toast.dismiss();
      toast.success('Employees data exported successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Export error:', error);
      toast.error('Failed to export employees data');
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPaginationParams(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleDepartmentFilter = (department: string) => {
    setPaginationParams(prev => ({
      ...prev,
      department: department === 'all' ? undefined : department,
      page: 1
    }));
  };

  const handleStatusFilter = (status: string) => {
    setPaginationParams(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1
    }));
  };

  const handleSearch = (query: string) => {
    setEmployeeFilters({ search: query });
  };

  const columns: Column<Employee>[] = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      sortType: 'string' as const,
      sortAccessor: (row: any) => {
        const v: any = row.employeeId;
        if (typeof v === 'string' || typeof v === 'number') return String(v);
        if (v && typeof v === 'object') return String(v.employeeId || v.empCode || v._id || v.id || '');
        return '';
      },
      render: (_: any, row: any) => {
        const v: any = row.employeeId;
        const display = typeof v === 'string' || typeof v === 'number'
          ? String(v)
          : String(v?.employeeId || v?.empCode || v?._id || v?.id || '');
        return <span>{display || '—'}</span>;
      }
    },
    {
      key: 'name',
      label: 'Employee',
      render: (_value: unknown, employee: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={employee.profilePicture} />
            <AvatarFallback>
              {(employee.name || 'NA').split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{employee.name || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">{employee.empCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'designation',
      label: 'Designation',
      sortable: true,
    },
    {
      key: 'joiningDate',
      label: 'Joined',
      sortable: true,
      render: (value: any, record: Employee) => {
        if (!record?.joiningDate) return "-";
        const joiningDate = dayjs(record.joiningDate);
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{joiningDate.format('DD-MM-YYYY')}</span>
          </div>
        );
      }
    }
  ];

  const filters = (
    <div className="flex gap-2">
      <Select
        value={paginationParams.department || 'all'}
        onValueChange={handleDepartmentFilter}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept: any) => (
            <SelectItem key={dept.id || dept._id} value={dept.name}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={paginationParams.status || 'all'}
        onValueChange={handleStatusFilter}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="terminated">Terminated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const actions = (employee: Employee) => {
    const empId = employee._id || (employee as any).id;
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/employees/${empId}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this employee? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteEmployee(empId)}>
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  const paginationInfo = data?.pagination;
  const currentPage = paginationInfo?.currentPage ?? paginationParams.page ?? 1;
  const totalEmployees = paginationInfo?.totalEmployees ?? data?.data?.length ?? 0;
  const pageLimit = paginationInfo?.limit ?? paginationParams.limit ?? 10;

  return (
    <RoleGuard allowedRoles={['admin', 'hr', 'hod']}>
      <div className="space-y-8 pb-10 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
            <Users className="h-10 w-10 text-blue-500" />
            Faculty & Staff
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Human Capital & Institutional Personnel</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="rounded-2xl border-border bg-card text-white hover:bg-accent font-black text-xs h-12 px-6 uppercase tracking-widest">
            <Download className="mr-2 h-4 w-4" /> Export DB
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
            <UserPlus className="mr-2 h-4 w-4" /> Onboard Staff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "TOTAL PERSONNEL", value: statsData?.totalFaculty || 0, trend: "Active", color: "text-blue-500", bg: "bg-blue-500/10", icon: Users },
          { label: "NEW JOINERS", value: statsData?.newJoiners || "05", trend: "This Month", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: Clock },
          { label: "DEPARTMENTS", value: departments.length || "12", trend: "Full Coverage", color: "text-purple-500", bg: "bg-purple-500/10", icon: Users },
          { label: "SYSTEM ADMINS", value: statsData?.systemAdmins || "03", trend: "Tier 1", color: "text-amber-500", bg: "bg-amber-500/10", icon: Users },
        ].map((stat, i) => (
          <div key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl group">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <div className="flex items-center gap-2">
                <stat.icon className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
        <div className="border-b border-border bg-slate-900/30 px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Personnel Directory</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Institutional Workforce Database</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="SEARCH PERSONNEL..." 
                  className="pl-12 pr-6 py-3 bg-slate-950 border border-border rounded-2xl text-xs font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 w-80 shadow-inner transition-all"
                  value={employeeFilters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-0">
          <DataTable<Employee>
            data={employeeList}
            columns={columns}
            searchPlaceholder="Search by name or employee code..."
            defaultSearchValue={employeeFilters.search ?? ''}
            onRowClick={(employee) => {
              const empId = employee._id || (employee as any).id;
              if (empId) router.push(`/employees/${empId}`);
            }}
            onSearch={handleSearch}
            actions={actions}
            filters={filters}
            defaultSortColumn="createdAt"
            defaultSortDirection="desc"
            pagination={{
              manual: Boolean(paginationInfo),
              page: currentPage,
              limit: pageLimit,
              total: totalEmployees,
              onPageChange: handlePageChange,
              onLimitChange: handleLimitChange,
              pageSizeOptions: [5, 10, 20, 50]
            }}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details of the new employee to onboard them to the system.
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            onSubmit={handleAddEmployee}
            isLoading={addEmployeeMutation.isPending}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </RoleGuard>
  );
}
