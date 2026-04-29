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

const studentSchema = z.object({
  rollNo: z.string().min(1, 'Roll Number is required'),
  enrollmentNo: z.string().min(1, 'Enrollment Number is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  course: z.string().min(1, 'Course is required'),
  semester: z.string().min(1, 'Semester is required'),
  status: z.enum(['active', 'inactive']).default('active'),
  phone: z.string().optional(),
  admissionDate: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
});

export type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void;
  onCancel: () => void;
  courses: any[];
  isLoading?: boolean;
}

export function StudentForm({ onSubmit, onCancel, courses, isLoading }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      status: 'active',
      semester: '1',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="rollNo" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Roll Number</Label>
          <Input
            id="rollNo"
            {...register('rollNo')}
            placeholder="STU001"
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.rollNo && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.rollNo.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="enrollmentNo" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Enrollment Number</Label>
          <Input
            id="enrollmentNo"
            {...register('enrollmentNo')}
            placeholder="ENR2024001"
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.enrollmentNo && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.enrollmentNo.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admissionDate" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Admission Date</Label>
          <Input
            id="admissionDate"
            type="date"
            {...register('admissionDate')}
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.admissionDate && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.admissionDate.message}</p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter student's full name"
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.name && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+91..."
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.phone && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="student@university.com"
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.email && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Account Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="bg-slate-950 border-border text-white h-11 rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-border text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="course" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Course / Program</Label>
          <Controller
            name="course"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="bg-slate-950 border-border text-white h-11 rounded-xl">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-border text-white">
                  {courses && courses.length > 0 ? (
                    courses.map((course: any) => (
                      <SelectItem key={course.id || course._id} value={course.name}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No courses available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.course && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.course.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="semester" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Semester</Label>
          <Controller
            name="semester"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="bg-slate-950 border-border text-white h-11 rounded-xl">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-border text-white">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.semester && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.semester.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Portal Username</Label>
          <Input
            id="username"
            {...register('username')}
            placeholder="johndoe123"
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.username && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Portal Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Create a strong password"
            className="bg-slate-950 border-border text-white h-11 rounded-xl"
          />
          {errors.password && (
            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1 ml-1">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-2xl border-border hover:bg-slate-900 font-black uppercase text-[10px] tracking-[0.2em] h-12 px-8"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 font-black uppercase text-[10px] tracking-[0.2em] h-12 shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Complete Admission'
          )}
        </Button>
     </div>
    </form>
  );
}