"use client";

import { useState, useRef, useEffect } from "react";
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
import { Loader2, Camera, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal";
import type { AxiosError } from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const router = useRouter();
  const { login } = useAuth();

  const startCamera = async () => {
    try {
      setCapturedImage(null);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  // Use effect to handle camera stream when isCameraActive changes
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const initCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera init error:", err);
          toast.error("Could not access camera.");
          setIsCameraActive(false);
        }
      }
    };
    
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  // Initial camera start
   useEffect(() => {
     startCamera();
   }, []);

   const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast.error("Video stream not ready. Please wait a moment.");
        return;
      }
      
      // Use natural video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image if it's the front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        
        setIsCameraActive(false);
      }
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!capturedImage) {
      toast.error("Please capture your photo for security verification");
      if (!isCameraActive) startCamera();
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(username, password, capturedImage);
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
          <div className="mb-8 flex flex-col items-center">
            <div className="relative w-full max-w-[200px] aspect-square rounded-[2rem] overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-inner group">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
              ) : (
                <div className="text-center p-4">
                  <div className="relative mx-auto h-16 w-16 mb-4">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                    <Camera className="relative h-16 w-16 text-slate-700" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Biometric Photo Required</p>
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanline Effect */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-0.5 bg-blue-500/50 shadow-[0_0_15px_#3b82f6] animate-[scan_2s_linear_infinite]" />
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              {!isCameraActive && !capturedImage && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={startCamera}
                  className="rounded-xl border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  <Camera className="h-4 w-4 mr-2" /> Start Scanner
                </Button>
              )}
              
              {isCameraActive && (
                <Button 
                  type="button" 
                  onClick={captureImage}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  <Camera className="h-4 w-4 mr-2" /> Capture Face
                </Button>
              )}
              
              {capturedImage && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={retakeImage}
                  className="rounded-xl border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Retake Photo
                </Button>
              )}
            </div>
          </div>

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
      
      <style jsx global>{`
        @keyframes scan {
          from { top: 0%; }
          to { top: 100%; }
        }
      `}</style>
    </div>
  );
}
