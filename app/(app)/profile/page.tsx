"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditModalSection } from './_components/EditModal';

import { Mail, Phone, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Personal_Info from './_components/Personal_Info';
import Contact_Info from './_components/Contact_Info';
import JobTab from './_components/JobTab';
import ExperienceTab from './_components/ExperienceTab';
import EductionTab from './_components/EductionTab';
import BankdetailsTab from './_components/BankdetailsTab';
import DocumentTab from './_components/DocumentTab';
import KRATab from './_components/KRATab';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 blur-xl bg-blue-600/20 animate-pulse" />
        </div>
        <p className="uppercase text-[10px] font-black tracking-[0.3em] animate-pulse">Syncing Personnel Identity...</p>
      </div>
    );
  }

  
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await authService.uploadProfilePicture(file);
      if (result.success && result.profilePicture) {
        updateUser({ profilePicture: result.profilePicture });
        toast.success('Profile picture updated successfully');
      } else {
        toast.error(result.message || 'Failed to update profile picture');
      }
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // const openEdit = (key: 'contact' | 'emergency' | 'password') => setModalOpen(key);


  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            Personnel Identity
          </h1>
          <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
            Digital Profile • Command Center Protocol
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative group/avatar">
              <div className="absolute -inset-1 bg-blue-600 rounded-full blur opacity-20 group-hover/avatar:opacity-40 transition-opacity" />
              <Avatar className="h-32 w-32 border-2 border-slate-800 relative z-10 shadow-2xl bg-slate-950">
                <AvatarImage src={(user.profilePicture ? `${user.profilePicture}?cb=${Date.now()}` : '')} alt={user.name} />
                <AvatarFallback className="text-4xl font-black bg-slate-950 text-blue-500">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full border border-slate-800 bg-slate-900 hover:bg-blue-600 hover:text-white transition-all z-20 shadow-xl"
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 space-y-6 text-center md:text-left pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white">{user.name}</h2>
                  <div className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/30 rounded text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Verified
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 text-slate-400 uppercase text-xs font-bold tracking-widest">
                  <span className="text-blue-500">{user.designation || 'Specialist'}</span>
                  <span className="hidden md:inline text-slate-700">•</span>
                  <span>{user.department}</span>
                  <span className="hidden md:inline text-slate-700">•</span>
                  <span className="text-slate-500">ID: {user.id}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4 border-t border-slate-800/50">
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Contact Channel</span>
                  <div className="flex items-center gap-2 text-slate-300 font-mono text-sm uppercase">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    {user.email}
                  </div>
                </div>
                {user.phone && (
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Secure Line</span>
                    <div className="flex items-center gap-2 text-slate-300 font-mono text-sm uppercase">
                      <Phone className="h-3.5 w-3.5 text-blue-500" />
                      {user.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
       <Tabs defaultValue="personal" className="w-full space-y-8">
         <TabsList className="bg-slate-900/80 border border-slate-800 p-1 h-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
           <TabsTrigger value="personal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Personal</TabsTrigger>
           <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Contact</TabsTrigger>
           <TabsTrigger value="job" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Duty</TabsTrigger>
           <TabsTrigger value="experience" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Intel</TabsTrigger>
           <TabsTrigger value="education" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Training</TabsTrigger>
           <TabsTrigger value="bank" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Financial</TabsTrigger>
           <TabsTrigger value="document" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Archives</TabsTrigger>
           <TabsTrigger value="kra" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.15em] py-3 transition-all">Targets</TabsTrigger>
         </TabsList>
 
         <TabsContent value="personal" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Personal_Info/>  
         </TabsContent>
 
         <TabsContent value="contact" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Contact_Info/>
         </TabsContent>
 
         <TabsContent value="job" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <JobTab/>
         </TabsContent>
 
         <TabsContent value="experience" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <ExperienceTab/>
         </TabsContent>
 
         <TabsContent value="education" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <EductionTab/>
         </TabsContent>

         <TabsContent value="bank" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <BankdetailsTab/>
         </TabsContent>
 
         <TabsContent value="document" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <DocumentTab/>
         </TabsContent>
 
         <TabsContent value="kra" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
           <KRATab/>
         </TabsContent>
       </Tabs>

      {/* Modals */}
      <EditModalSection />
    </div>
  );
}