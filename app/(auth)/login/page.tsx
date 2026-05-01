"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal";
import type { AxiosError } from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      } 
    } catch (error) {
      console.error("💥 Login error:", error);
      const axiosErr = error as AxiosError<{ message?: string }>; 
      toast.error(axiosErr?.response?.data?.message || (error as any)?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse" />
      
      <Card className="w-full max-w-md shadow-2xl rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-slate-800 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-teal-500" />
        
        <CardHeader className="space-y-2 text-center pt-10">
          <div className="mx-auto rounded-3xl overflow-hidden w-24 h-24 mb-6 shadow-2xl border-2 border-slate-800 p-2 bg-slate-950 group transition-transform hover:scale-105 duration-500">
            <img
              src="/gcrg.jpeg"
              alt="Logo"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <CardTitle className="text-3xl font-black tracking-tight text-white uppercase">
            COLLEGE <span className="text-blue-500">ERP</span>
          </CardTitle>
          <CardDescription className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">
            Security Gate & Access Management
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1" htmlFor="username">Terminal ID / Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="ID-000000"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 h-12 focus:ring-blue-600 focus:border-blue-600 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1" htmlFor="password">Access Key</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 h-12 focus:ring-blue-600 focus:border-blue-600 transition-all"
              />
            </div>
            <div className="flex items-center justify-end">
              <ForgotPasswordModal>
                <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors">
                  Recovery Mode
                </Button>
              </ForgotPasswordModal>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02]" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
