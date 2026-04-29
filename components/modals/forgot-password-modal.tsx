"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, User, Building, Briefcase, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/auth';

// Zod validation schema
const forgotPasswordSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
  department: z.string().min(1, 'Please select a department'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const departments = [
  { value: 'IT', label: 'Information Technology' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
 
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' }
];

const roles = [
  { value: 'hr', label: 'HR' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' }
];

interface ForgotPasswordModalProps {
  children: React.ReactNode;
}

export function ForgotPasswordModal({ children }: ForgotPasswordModalProps) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{ exists: boolean; user?: any; message?: string } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      department: '',
      designation: '',
    },
  });

  const watchedEmail = form.watch('email');

  // Debounced email checking
  useEffect(() => {
    if (!watchedEmail || watchedEmail.length < 3) {
      setEmailCheckResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const result = await authService.checkEmailExists(watchedEmail);
        setEmailCheckResult(result);
      } catch (error) {
        console.error('Email check error:', error);
        setEmailCheckResult({ exists: false, message: 'Failed to check email' });
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [watchedEmail]);

  // TanStack mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      return await authService.submitForgotPasswordRequest(data);
    },
    onSuccess: (result) => {
      if (result.success) {
        setIsSuccess(true);
        toast.success('Password reset request submitted successfully');
        // Don't close modal automatically, let user choose
      } else {
        toast.error(result.message || 'Failed to submit request');
      }
    },
    onError: (error: any) => {
      console.error('Forgot password error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to submit password reset request';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  const handleClose = () => {
    setOpen(false);
    setIsSuccess(false);
    form.reset();
  };

  const handleSuccessClose = () => {
    setOpen(false);
    setIsSuccess(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Only allow closing if not in success state or if explicitly closing
      if (!isOpen && isSuccess) {
        return; // Prevent closing when in success state
      }
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Forgot Password
          </DialogTitle>
          <DialogDescription>
            Submit a request to reset your password. Only HR personnel can create reset requests.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Your password reset request has been submitted successfully. You will receive an email with further instructions once approved by the administrator.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button onClick={handleSuccessClose} className="flex-1">
                Close
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSuccess(false);
                  form.reset();
                }}
                className="flex-1"
              >
                Submit Another
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(onSubmit)(e);
          }} className="space-y-6">
            {/* First Row - Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="modal-name"
                    type="text"
                    placeholder="Enter your full name"
                    {...form.register('name')}
                    className="pl-10"
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="modal-email"
                    type="email"
                    placeholder="Enter your email address"
                    {...form.register('email')}
                    className={`pl-10 ${emailCheckResult?.exists ? 'border-green-500' : emailCheckResult?.exists === false ? 'border-red-500' : ''}`}
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
                {emailCheckResult && (
                  <div className={`text-sm ${emailCheckResult.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {emailCheckResult.exists ? (
                      <div>
                        <p className="font-medium">✓ Email found in system</p>
                        {emailCheckResult.user && (
                          <p className="text-xs text-gray-600">
                            User: {emailCheckResult.user.name} ({emailCheckResult.user.email})
                          </p>
                        )}
                      </div>
                    ) : (
                      <p>✗ {emailCheckResult.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Second Row - Role and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-role">Role *</Label>
                <Select value={form.watch('role')} onValueChange={(value) => form.setValue('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-department">Department *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select value={form.watch('department')} onValueChange={(value) => form.setValue('department', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.formState.errors.department && (
                  <p className="text-sm text-red-600">{form.formState.errors.department.message}</p>
                )}
              </div>
            </div>

            {/* Third Row - Designation (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="modal-designation">Designation *</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="modal-designation"
                  type="text"
                  placeholder="Enter your designation"
                  {...form.register('designation')}
                  className="pl-10"
                />
              </div>
              {form.formState.errors.designation && (
                <p className="text-sm text-red-600">{form.formState.errors.designation.message}</p>
              )}
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> Only HR personnel can create password reset requests. Your request will be reviewed by the administrator.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
               disabled={ !emailCheckResult ||forgotPasswordMutation.isPending}
                type="submit" 
                className="flex-1" 
                
              >
                {forgotPasswordMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
