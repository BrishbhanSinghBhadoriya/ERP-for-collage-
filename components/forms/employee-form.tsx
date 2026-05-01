"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee, User } from '@/lib/types';
import { mockDepartments, mockDesignations, mockEmployees } from '@/lib/mock';

const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  name: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  emergencyContactNo: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  role: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  joiningDate: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'terminated']).default('active'),
  gender: z.enum(['male', 'female', 'other']).optional(),
}); 


type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: User;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      employeeId: employee.employeeId,
      username:employee.username,
      password:employee.password,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      emergencyContactNo: employee.emergencyContactNo,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      dob: employee.dob,
      status: (employee as any).status || 'active',
      gender: employee.gender,
    } : {
      department: '',
      role: '',
      joiningDate: '',
      dob: '',
      status: 'active',
    },
  });




  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            {...register('employeeId')}
            placeholder="e.g EMP001"
            className="w-full"
          />
          {errors.employeeId && (
            <p className="text-sm text-red-600">{errors.employeeId.message}</p>
          )}
        </div>
      <div className="space-y-2">
          <Label htmlFor="username">User Name</Label>
          <Input
            id="username"
            {...register('username')}
            placeholder="e.g username"
            className="w-full"
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Enter password"
            className="w-full"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
        
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter full name"
            className="w-full"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="employee@company.com"
            className="w-full"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+919999999999"
            className="w-full"
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContactNo">Emergency Phone Number</Label>
          <Input
            id="emergencyContactNo"
            {...register('emergencyContactNo')}
            placeholder="+919999999999"
            className="w-full"
          />
          {errors.emergencyContactNo && (
            <p className="text-sm text-red-600">{errors.emergencyContactNo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('designation', ''); 
                }}
              >
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.department && (
            <p className="text-sm text-red-600">{errors.department.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="warden">Warden</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="assistant professor">Assistant Professor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" {...register('designation')} placeholder="Enter designation" className="w-full" />
          {errors.designation && (
            <p className="text-sm text-red-600">{errors.designation.message}</p>
          )}
        </div>

        

        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input
            id="joiningDate"
            type="date"
            {...register('joiningDate')}
            className="w-full"
          />
          {errors.joiningDate && (
            <p className="text-sm text-red-600">{errors.joiningDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            {...register('dob')}
            className="w-full"
          />
          {errors.dob && (
            <p className="text-sm text-red-600">{errors.dob.message}</p>
          )}
          
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || 'active'}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {employee ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            employee ? 'Update Employee' : 'Add Employee'
          )}
        </Button>
      </div>
    </form>
  );
}