"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import dayjs from "dayjs";
import { z } from "zod";
import api from "@/lib/api";
import { cn, extractList } from "@/lib/utils";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { RoleGuard } from "@/components/auth/role-guard";

export type AnnouncementFormValues = {
  _id:string,
  subject: string;
  body: string;
  targetAudience: ("all" | "employee" | "manager" | "hr")[];
  role?: string;
  publishedDate?: Date;
  expiryDate?: Date;
  image?: string[];
  document?: string[];
};

const announcementSchema = z
  .object({
    subject: z.string().min(3, "Subject is required"),
    body: z.string().min(5, "Body is required"),
    targetAudience: z
      .array(z.enum(["all", "employee", "manager", "hr"]))
      .nonempty("Select at least one audience"),
    role: z.string().optional(),
    publishedDate: z
      .string()
      .refine(
        (date) => dayjs(date, "YYYY-MM-DD", true).isValid(),
        "Invalid published date"
      )
      .transform((val) => new Date(val))
      .optional(),
    expiryDate: z
      .string()
      .refine(
        (date) => dayjs(date, "YYYY-MM-DD", true).isValid(),
        "Invalid expiry date"
      )
      .transform((val) => new Date(val))
      .optional(),
    image: z.array(z.string()).optional(),
    document: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.publishedDate && data.expiryDate) {
        return (
          dayjs(data.expiryDate).isAfter(dayjs(data.publishedDate)) ||
          dayjs(data.expiryDate).isSame(dayjs(data.publishedDate))
        );
      }
      return true;
    },
    {
      message: "Expiry date must be same or after published date",
      path: ["expiryDate"],
    }
  );

export default function AnnouncementPage() {
  const router = useRouter();
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [imageFiles,setimageFiles]=useState<File[]>([])
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docURLs, setDocURLs] = useState<string[]>([]);

  const { user } = useAuth();
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      targetAudience: [],
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (announcement: AnnouncementFormValues) => {
      const response = await api.post(
        "/announcement/createAnnouncement",
        announcement
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Announcement published successfully");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Failed to publish announcement");
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/announcement/deleteAnnouncement/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete announcement");
    },
  });

  const handleFormSubmit = async (values: AnnouncementFormValues) => {
    try {
      const payload = {
        ...values,
        image: imageURLs,
        images: imageURLs,
        document: docURLs,
        documents: docURLs,
      } as any;
      createAnnouncement.mutate(payload);
    } catch (error) {
      toast.error("Failed to add announcement!");
    }
  };

  const handleImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files);
  
    // show preview
    setimageFiles((prev) => [...prev, ...selectedFiles]);
  
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });
  
    try {
      const res = await api.post("/upload/upload-one-multiple-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // robustly extract URLs regardless of response shape
      const body: any = res?.data?.data ?? res?.data ?? {};
      const fromImageUrls = Array.isArray(body?.imageUrls) ? body.imageUrls : [];
      const imagesArray = Array.isArray(body?.images) ? body.images : [];
      const urlsFromImages = imagesArray
        .map((it: any) => it?.url)
        .flat()
        .filter((u: any) => typeof u === "string");
      const urls: string[] = [...fromImageUrls, ...urlsFromImages];
      setImageURLs((prev) => [...prev, ...urls]);
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.error("Error uploading images:", err);
      toast.error("Image upload failed!");
    }
  };
  

  const handleDocs = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
  
    const acceptedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];
  
    const selectedFiles = Array.from(files).filter((f) =>
      acceptedTypes.includes(f.type)
    );
  
    setDocFiles((prev) => [...prev, ...selectedFiles]);
  
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));
  
    try {
      const res = await api.post("/upload/upload-one-multiple-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // robustly extract URLs regardless of response shape
      const body: any = res?.data?.data ?? res?.data ?? {};
      const fromDocUrls = Array.isArray(body?.docUrls) ? body.docUrls : [];
      const documentsArray = Array.isArray(body?.documents) ? body.documents : [];
      const urlsFromDocuments = documentsArray
        .map((it: any) => it?.url)
        .flat()
        .filter((u: any) => typeof u === "string");
      const urls: string[] = [...fromDocUrls, ...urlsFromDocuments];
      setDocURLs((prev) => [...prev, ...urls]);
      toast.success("Documents uploaded successfully!");
    } catch (err) {
      console.error("Error uploading documents:", err);
      toast.error("Document upload failed!");
    }
  };
  
  const removeImage = (index: number) => {
    setimageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDoc = (index: number) => {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { data: announcements} = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await api.get("/announcement/getAnnouncement");
      // Backend may return plain array or wrapped object
      return extractList(res?.data);

    },
  });
  console.log(announcements)
  const announcementColumns = [
    { key: "subject" as keyof AnnouncementFormValues, label: "Subject", sortable: true, sortType: "string" as const },
    {
      key: "targetAudience",
      label: "Audience",
      sortable: true,
      render: (v: any) => Array.isArray(v) ? v.join(", ") : String(v ?? "-"),
      sortAccessor: (row: any) => (Array.isArray(row.targetAudience) ? row.targetAudience.join(",") : String(row.targetAudience || "")),
      sortType: "string" as const,
    },
    {
      key: "publishedDate",
      label: "Published",
      sortable: true,
      render: (v: any) => v ? dayjs(v).format("DD MMM YYYY") : "-",
      sortType: "date" as const,
    },
    {
      key: "expiryDate",
      label: "Expiry",
      sortable: true,
      render: (v: any) => v ? dayjs(v).format("DD MMM YYYY") : "-",
      sortType: "date" as const,
    },
    {
      key:"body",
      label :"description",
      sortable:true,
      render: (body: string) => {
        const display = typeof body === 'string' && body.length > 30
          ? `${body.slice(0, 30)}...`
          : body;
        return (
          <div className="max-w-48" title={body}>
            {display}
          </div>
        );
      }
    },
    
  ];
  const actions = (announcement: AnnouncementFormValues) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500 transition-colors"
        onClick={() => router.push(`/announcements/${announcement._id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {isAdminOrHR && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-900 border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white uppercase tracking-wider">Decommission Broadcast?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest leading-relaxed">
                You are about to permanently delete this transmission from the archives. This action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white uppercase text-[10px] font-black tracking-widest">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteAnnouncement.mutate(announcement._id)}
                className="bg-red-600 hover:bg-red-700 text-white uppercase text-[10px] font-black tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );

  return (
    <RoleGuard allowedRoles={['admin', 'hod', 'professor', 'assistant_professor', 'staff', 'student', 'hr']}>
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
              <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
              Announcement Registry
            </h1>
            <p className="text-slate-400 mt-1 font-medium tracking-wide uppercase text-xs">
              Digital Broadcasting System • Command Center
            </p>
          </div>
          {isAdminOrHR && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase text-slate-300">System Ready</span>
            </div>
          )}
        </div>

        <Tabs defaultValue={isAdminOrHR ? "create" : "view"} className="w-full">
          <TabsList className="bg-slate-900/80 border border-slate-800 p-1 h-auto mb-8">
            {isAdminOrHR && (
              <TabsTrigger 
                value="create" 
                className="px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold uppercase text-xs tracking-widest transition-all"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                New Broadcast
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="view" 
              className="px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold uppercase text-xs tracking-widest transition-all"
            >
              <Eye className="h-3.5 w-3.5 mr-2" />
              Archive
            </TabsTrigger>
          </TabsList>

          {isAdminOrHR && (
            <TabsContent value="create" className="mt-0 outline-none">
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
                  <CardTitle className="text-lg font-bold uppercase tracking-wider text-blue-400">Broadcast Configuration</CardTitle>
                  <CardDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                    Configure announcement parameters and target parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Transmission Subject</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ENTER SUBJECT..."
                                  className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 uppercase text-xs tracking-widest font-mono"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="targetAudience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Audience Protocol</FormLabel>
                              <FormControl>
                                <Select onValueChange={(val) => field.onChange([val])} value={field.value?.[0]}>
                                  <SelectTrigger className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50 h-12 uppercase text-xs tracking-widest font-mono">
                                    <SelectValue placeholder="SELECT TARGET..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                                    <SelectItem value="all" className="uppercase text-[10px] font-bold tracking-widest focus:bg-blue-600 focus:text-white">All Units</SelectItem>
                                    <SelectItem value="employee" className="uppercase text-[10px] font-bold tracking-widest focus:bg-blue-600 focus:text-white">Standard Personnel</SelectItem>
                                    <SelectItem value="manager" className="uppercase text-[10px] font-bold tracking-widest focus:bg-blue-600 focus:text-white">Command Units</SelectItem>
                                    <SelectItem value="hr" className="uppercase text-[10px] font-bold tracking-widest focus:bg-blue-600 focus:text-white">Admin Central</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="publishedDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <CalendarDays className="h-3 w-3 text-blue-500" /> Deployment Date
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50 h-12 uppercase text-xs tracking-widest font-mono"
                                  value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <CalendarDays className="h-3 w-3 text-red-500" /> Termination Date
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50 h-12 uppercase text-xs tracking-widest font-mono"
                                  value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormDescription className="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">
                                System will auto-archive broadcast after this date.
                              </FormDescription>
                              <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Message Content</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={6}
                                placeholder="ENCODE MESSAGE..."
                                className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50 min-h-[200px] uppercase text-xs tracking-widest font-mono p-4"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visual Data</h3>
                          </div>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            className="bg-slate-950/50 border-slate-800 cursor-pointer text-[10px] uppercase font-bold h-10 pt-2"
                            onChange={(e) => handleImages(e.target.files)}
                          />
                          {imageFiles.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 pt-2">
                              {imageFiles.map((file, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-800 shadow-lg aspect-square bg-slate-950">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                  />
                                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all"
                                    onClick={() => removeImage(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Documentation</h3>
                          </div>
                          <Input
                            type="file"
                            multiple
                            className="bg-slate-950/50 border-slate-800 cursor-pointer text-[10px] uppercase font-bold h-10 pt-2"
                            onChange={(e) => handleDocs(e.target.files)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                          />
                          {docFiles.length > 0 && (
                            <div className="space-y-2 pt-2">
                              {docFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg p-3 group">
                                  <div className="flex items-center gap-3 truncate">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">{file.name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-600 hover:text-red-500 transition-colors"
                                    onClick={() => removeDoc(index)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
                        <Button
                          type="submit"
                          disabled={createAnnouncement.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-xs h-12 px-10 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
                        >
                          {createAnnouncement.isPending ? (
                            <>
                              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                              Transmitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-3 h-4 w-4" /> Initialize Broadcast
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.back()}
                          className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] h-12 px-6 hover:bg-slate-800 hover:text-white transition-all"
                        >
                          Abort
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="view" className="mt-0 outline-none">
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
              <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold uppercase tracking-wider text-blue-400">Archived Broadcasts</CardTitle>
                    <CardDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                      System logs of all previous transmissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Sync Active</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full">
                  <DataTable
                    data={(announcements as any[]) || []}
                    columns={announcementColumns as any}
                    searchPlaceholder="FILTER LOGS..."
                    actions={actions}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
