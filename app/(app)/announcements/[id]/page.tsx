"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import api from "@/lib/api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, User, FileText, ImageIcon as ImageIconLucide, Paperclip, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AnnouncementDetail = {
  _id: string;
  subject: string;
  body: string;
  targetAudience: ("all" | "employee" | "manager" | "hr")[] | string[];
  role?: string;
  publishedDate?: string | Date;
  expiryDate?: string | Date;
  images?: string[] | string;
  documents?: string[] | string;
  image?: string; // backend may return single key
  document?: string; // backend may return single key
  createdAt?: string;
  updatedAt?: string;
};

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<{ data: AnnouncementDetail } | AnnouncementDetail>({
    queryKey: ["announcement", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get(`/announcement/getannouncement/${id}`);
      return res.data?.data ?? res.data;
    },
  });

  const announcement: AnnouncementDetail | undefined = useMemo(() => {
    if (!data) return undefined;
    // Support either { data: {...} } or direct object
    return (data as any)?.data ?? (data as any);
  }, [data]);

  const images = useMemo(() => {
    const img = announcement?.images ?? announcement?.image;
    if (!img) return [] as string[];
    const arr = Array.isArray(img) ? img : [img];
    return arr.map((u) => normalizeUrl(u));
  }, [announcement]);

  const documents = useMemo(() => {
    const docs = announcement?.documents ?? announcement?.document;
    if (!docs) return [] as string[];
    const arr = Array.isArray(docs) ? docs : [docs];
    return arr.map((u) => normalizeUrl(u));
  }, [announcement]);

  function normalizeUrl(u?: string): string {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";
    const path = ("/" + String(u)).replace(/\/+/g, "/");
    return `${base}${path}`;
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 blur-xl bg-blue-600/20 animate-pulse" />
        </div>
        <p className="uppercase text-[10px] font-black tracking-[0.3em] animate-pulse">Synchronizing Data...</p>
      </div>
    );
  }

  if (isError || !announcement) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <ShieldCheck className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Access Denied</h3>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Unable to retrieve transmission log</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] px-8 hover:bg-slate-800 transition-all"
        >
          Return to Base
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            Transmission Log
          </h1>
          <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
            ID: {announcement._id.slice(-8).toUpperCase()} • Secure Protocol
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 hover:text-white transition-all h-10 px-6"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-2" />
          Back
        </Button>
      </div>

      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1">
                Official Broadcast
              </Badge>
              <CardTitle className="text-3xl font-black uppercase tracking-tight text-white leading-none">
                {announcement.subject}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {announcement.publishedDate ? dayjs(announcement.publishedDate).format("DD MMM YYYY") : "N/A"}
                  </span>
                </div>
                {announcement.expiryDate && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-red-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Expires: {dayjs(announcement.expiryDate).format("DD MMM YYYY")}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Distribution</span>
              <div className="flex flex-wrap gap-2 justify-end">
                {(Array.isArray(announcement.targetAudience) ? announcement.targetAudience : String(announcement.targetAudience || "").split(",")).filter(Boolean).map((aud) => (
                  <Badge key={aud} className="bg-slate-950 border-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-tighter">
                    {aud}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-12">
          <div className="relative">
            <div className="absolute -left-8 top-0 bottom-0 w-1 bg-blue-600/20" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Message Payload
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium tracking-wide">
              {announcement.body}
            </p>
          </div>

          {images.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-slate-800/50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                <ImageIconLucide className="h-3.5 w-3.5" /> Visual Intelligence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="relative group aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 transition-all hover:border-blue-500/50"
                    onClick={() => setPreviewUrl(src)}
                  >
                    <img
                      src={src}
                      alt={`intel-${idx}`}
                      className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-all scale-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-slate-800/50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5" /> Attached Documentation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((href, idx) => {
                  const isPdf = /\.pdf(\?|#|$)/i.test(href);
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-xl p-4 group hover:border-blue-500/30 transition-all hover:bg-slate-900"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Document {idx + 1}</span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{isPdf ? "Portable Document Format" : "Standard Archive"}</span>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl bg-slate-900 border-slate-800 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950/50">
            <DialogTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Visual Preview • Command Central</DialogTitle>
          </DialogHeader>
          <div className="relative bg-slate-950 p-2 flex items-center justify-center min-h-[50vh]">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Intel Preview" 
                className="max-h-[80vh] w-auto object-contain rounded shadow-2xl" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


