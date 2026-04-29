import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import { FileText, Download, Upload, Eye, X, Check, Copy, CreditCard, User, Edit3, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from "@/lib/utils";

const DocumentTab = () => {
  const { user, updateUser } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [editingNumbers, setEditingNumbers] = useState<Set<string>>(new Set());
  const [numberValues, setNumberValues] = useState<{ [key: string]: string }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const documents = (user as any)?.documents || {};
  
  const documentFields = [
    {
      key: 'adharImage',
      numberKey: 'adharNumber',
      label: 'Identification Protocol',
      description: 'Primary government identity vector',
      icon: User,
      showNumber: true,
      numberLabel: 'Aadhar Identifier'
    },
    {
      key: 'panImage', 
      numberKey: 'panNumber',
      label: 'Financial Identifier',
      description: 'Taxation and fiscal parameter card',
      icon: CreditCard,
      showNumber: true,
      numberLabel: 'PAN Identifier'
    },
    {
      key: 'experienceLetterImage',
      label: 'Deployment Log',
      description: 'Previous assignment validation certificate',
      icon: FileText,
      showNumber: false
    },
    {
      key: 'MarksheetImage_10',
      label: 'Level 10 Intel',
      description: 'Secondary academic validation',
      icon: ShieldCheck,
      showNumber: false
    },
    {
      key: 'MarksheetImage_12',
      label: 'Level 12 Intel', 
      description: 'Senior secondary academic validation',
      icon: ShieldCheck,
      showNumber: false
    },
    {
      key: 'MarksheetImage_Graduation',
      label: 'Graduate Protocol',
      description: 'Degree level academic validation',
      icon: ShieldCheck,
      showNumber: false
    },
    {
      key: 'MarksheetImage_PostGraduationImage',
      label: 'Advanced Protocol',
      description: 'Post-graduate level academic validation',
      icon: ShieldCheck,
      showNumber: false
    }
  ];

  const handleDownloadDocument = async (documentUrl: string, filename: string) => {
    if (!documentUrl) {
      toast.error('Document source not found');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Archive download initiated');
    } catch (error) {
      toast.error('Archive retrieval failed');
    }
  };

  const handleUploadFile = async (fieldKey: string, file: File) => {
    if (!file) return;

    setUploadingFiles(prev => new Set(prev).add(fieldKey));
    try {
      const res = await authService.uploadDocument(((user as any)?._id || user?.id) as string, fieldKey, file);
      if (res.success) {
        const updatedDocuments = {
          ...documents,
          [fieldKey]: res.data?.url || res.data?.documentUrl || res.data
        };
        updateUser({
          documents: updatedDocuments
        } as any);
        toast.success(`${fieldKey} uploaded to secure storage`);
      } else {
        toast.error(res.message || 'Upload protocol failed');
      }
    } catch (error) {
      toast.error('Transmission error during upload');
    } finally {
      setUploadingFiles(prev => {
        const next = new Set(prev);
        next.delete(fieldKey);
        return next;
      });
    }
  };

  const handleSaveNumber = async (numberKey: string) => {
    const value = numberValues[numberKey]?.trim();
    if (!value) return;

    try {
      const updatedDocuments = { ...documents, [numberKey]: value };
      const res = await authService.updateEmployeeProfile(((user as any)?._id || (user as any)?.id) as string, {
        documents: updatedDocuments
      });
      
      if (res.success) {
        updateUser({ documents: updatedDocuments } as any);
        setEditingNumbers(prev => {
          const next = new Set(prev);
          next.delete(numberKey);
          return next;
        });
        toast.success('Identifier registry updated');
      } else {
        toast.error(res.message || 'Registry update failed');
      }
    } catch (error) {
      toast.error('Connection error during registry update');
    }
  };

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-8 py-6">
        <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Secure Archives</CardTitle>
        <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">Personnel verification and credential logs</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentFields.map((field) => {
            const hasDocument = !!documents[field.key];
            const isUploading = uploadingFiles.has(field.key);
            const isEditingNumber = field.numberKey && editingNumbers.has(field.numberKey);
            const displayValue = field.numberKey ? (numberValues[field.numberKey] ?? documents[field.numberKey] ?? '') : '';

            return (
              <div key={field.key} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 relative group transition-all hover:border-blue-500/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    <field.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white leading-tight">{field.label}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">{field.description}</p>
                    </div>

                    {field.showNumber && field.numberKey && (
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                        <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{field.numberLabel}</span>
                        {isEditingNumber ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="bg-slate-950 border border-blue-500/50 rounded px-2 py-1 text-xs font-mono text-blue-400 w-full focus:outline-none"
                              value={displayValue}
                              onChange={(e) => setNumberValues({ ...numberValues, [field.numberKey!]: e.target.value })}
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500" onClick={() => handleSaveNumber(field.numberKey!)}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => setEditingNumbers(prev => { const n = new Set(prev); n.delete(field.numberKey!); return n; })}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group/number">
                            <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">
                              {displayValue || 'NOT REGISTERED'}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/number:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-blue-500" onClick={() => setEditingNumbers(prev => new Set(prev).add(field.numberKey!))}>
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-blue-500" onClick={() => { navigator.clipboard.writeText(displayValue); toast.success('Identifier copied'); }}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {hasDocument ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white h-8 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setPreviewUrl(documents[field.key])}
                          >
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            Preview
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-slate-800 text-slate-400 hover:bg-slate-800 h-8 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => handleDownloadDocument(documents[field.key], `${field.label.replace(/\s+/g, '_')}_Archive`)}
                          >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <div className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest italic">
                          Archive Missing
                        </div>
                      )}
                      
                      <div className="ml-auto">
                        <input
                          type="file"
                          ref={el => { fileInputRefs.current[field.key] = el }}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadFile(field.key, file);
                          }}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "h-8 w-8 transition-all",
                            hasDocument ? "text-slate-600 hover:text-blue-500" : "bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white"
                          )}
                          disabled={isUploading}
                          onClick={() => fileInputRefs.current[field.key]?.click()}
                        >
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl bg-slate-900 border-slate-800 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950/50">
            <DialogTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Archive Preview • Command Central</DialogTitle>
          </DialogHeader>
          <div className="relative bg-slate-950 p-2 flex items-center justify-center min-h-[50vh]">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Archive Preview" 
                className="max-h-[80vh] w-auto object-contain rounded shadow-2xl" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default DocumentTab
