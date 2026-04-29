"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Key, Eye, EyeOff, RefreshCw, AlertCircle, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface ForgotPasswordRequest {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  status: string;
  createdAt: string;
}

export default function ResetEmpPasswordPage() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ForgotPasswordRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{ exists: boolean; user?: any; message?: string } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Check for email parameter in URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setSearchEmail(emailParam);
      checkEmailExists(emailParam);
    }
  }, [searchParams]);

  // Email checking function
  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 3) {
      setEmailCheckResult(null);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const result = await authService.checkEmailExists(email);
      setEmailCheckResult(result);
    } catch (error) {
      console.error('Email check error:', error);
      setEmailCheckResult({ exists: false, message: 'Failed to check email' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounced email checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkEmailExists(searchEmail);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchEmail]);

  // Fetch forgot password requests
  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['forgotPasswordRequests'],
    queryFn: async () => {
      const result = await authService.getForgotPasswordRequests();
      if (result.success) {
        return result.data || [];
      }
      throw new Error(result.message || 'Failed to fetch requests');
    },
  });

  // Delete request mutation
  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const result = await authService.deleteForgotPasswordRequest(requestId);
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete request');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Request deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['forgotPasswordRequests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete request');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({email,newPassword}: { email: string,newPassword:string}) => {
      const result = await authService.resetEmployeePassword(email,newPassword);
      if (!result.success) {
        throw new Error(result.message || 'Failed to reset password');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
      setIsResetDialogOpen(false);
      setSelectedRequest(null);
      setNewPassword('');
      queryClient.invalidateQueries({ queryKey: ['forgotPasswordRequests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const generatePassword = () => {
    setIsGeneratingPassword(true);
    // Generate a random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setIsGeneratingPassword(false);
  };

  const handleResetPassword = () => {
    if (!selectedRequest || !newPassword) {
      toast.error('Please enter a password');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    resetPasswordMutation.mutate({
      email:selectedRequest.email,
      newPassword
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      deleteMutation.mutate(requestId);
    }
  };

  const columns = [
    {
      key: 'name' as keyof ForgotPasswordRequest,
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email' as keyof ForgotPasswordRequest,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role' as keyof ForgotPasswordRequest,
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'department' as keyof ForgotPasswordRequest,
      label: 'Department',
      sortable: true,
    },
    {
      key: 'designation' as keyof ForgotPasswordRequest,
      label: 'Designation',
      sortable: true,
    },
    {
      key: 'status' as keyof ForgotPasswordRequest,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'pending' ? 'default' : value === 'approved' ? 'secondary' : 'destructive'}
          className="capitalize"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt' as keyof ForgotPasswordRequest,
      label: 'Requested Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: ForgotPasswordRequest) => (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setSelectedRequest(row);
          setIsResetDialogOpen(true);
        }}
        disabled={resetPasswordMutation.isPending}
      >
        <Key className="h-4 w-4 mr-1" />
        Reset
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDeleteRequest(row.email)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 blur-xl bg-blue-600/20 animate-pulse" />
        </div>
        <p className="uppercase text-[10px] font-black tracking-[0.3em] animate-pulse">Syncing Security Grid...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Security Sync Failed</h3>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-widest max-w-xs">Unable to retrieve password reset requests from central database</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] px-8 hover:bg-slate-800 transition-all">
          Retry Handshake
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            Security Terminal
          </h1>
          <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
            Credential Management • Command Central
          </p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline"
          className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 hover:text-white transition-all h-10 px-6"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Refresh Sync
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Email Search Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-400">Personnel Lookup</CardTitle>
              <CardDescription className="text-slate-500 uppercase text-[9px] font-black tracking-[0.2em]">
                Query central registry for specific personnel credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="search-email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Address (Email)</Label>
                  <div className="relative group/input">
                    <Input
                      id="search-email"
                      type="email"
                      placeholder="ENTER PERSONNEL EMAIL..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className={cn(
                        "bg-slate-950 border-slate-800 h-12 uppercase text-xs tracking-widest font-mono transition-all pr-10",
                        emailCheckResult?.exists ? 'border-emerald-500/50 focus:border-emerald-500' : emailCheckResult?.exists === false ? 'border-red-500/50 focus:border-red-500' : 'focus:border-blue-500'
                      )}
                    />
                    {isCheckingEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                  {emailCheckResult && (
                    <div className="pt-2">
                      {emailCheckResult.exists ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Personnel Found in Registry
                          </div>
                          {emailCheckResult.user && (
                            <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-5 space-y-4 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-2 opacity-10">
                                <ShieldCheck className="h-12 w-12 text-emerald-500" />
                              </div>
                              <div className="space-y-2 relative z-10">
                                <p className="text-lg font-black text-white uppercase tracking-tight">{emailCheckResult.user.name}</p>
                                <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                                  <span>ID: {emailCheckResult.user.id}</span>
                                  <span className="truncate">{emailCheckResult.user.email}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[0.2em] h-10 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                onClick={() => {
                                  setSelectedRequest({
                                    _id: emailCheckResult.user.id,
                                    name: emailCheckResult.user.name,
                                    email: emailCheckResult.user.email,
                                    role: '',
                                    department: '',
                                    designation: '',
                                    status: 'pending',
                                    createdAt: new Date().toISOString(),
                                  });
                                  setIsResetDialogOpen(true);
                                }}
                              >
                                <Key className="h-3.5 w-3.5 mr-2" />
                                Re-Initialize Security
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                          <XCircle className="h-3.5 w-3.5" />
                          {emailCheckResult.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Password Reset Requests Section */}
        <div className="lg:col-span-7">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-400">Security Requests</CardTitle>
                  <CardDescription className="text-slate-500 uppercase text-[9px] font-black tracking-[0.2em]">
                    Incoming credential reset protocols
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Monitoring Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={requests || []}
                columns={columns as any}
                actions={actions}
                searchPlaceholder="FILTER LOGS..."
                initialPageSize={10}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 shadow-2xl overflow-hidden p-0">
          <div className="h-1 w-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          <div className="p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">Security Override</DialogTitle>
              <DialogDescription className="text-slate-500 uppercase text-[10px] font-black tracking-widest">
                Deploying new security parameters for <span className="text-blue-500">{selectedRequest?.name}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="newPassword" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Security Sequence</Label>
                <div className="relative group">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ENTER NEW SEQUENCE..."
                    className="bg-slate-950 border-slate-800 h-12 uppercase text-xs tracking-widest font-mono pr-12 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-600 hover:text-blue-500 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePassword}
                  disabled={isGeneratingPassword}
                  className="w-full border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-widest text-[9px] h-10 hover:bg-slate-800 hover:text-white transition-all"
                >
                  {isGeneratingPassword ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-2" />
                  )}
                  Auto-Generate Secure Sequence
                </Button>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResetDialogOpen(false);
                    setSelectedRequest(null);
                    setNewPassword('');
                  }}
                  className="flex-1 border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] h-12 hover:bg-slate-800 transition-all"
                >
                  Abort
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending || !newPassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                  {resetPasswordMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Deploy Override
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
