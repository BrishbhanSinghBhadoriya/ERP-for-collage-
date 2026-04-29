import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Landmark, CreditCard, Hash, ShieldCheck, Wallet } from 'lucide-react'
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function capitalizeFirst(s?: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const BankdetailsTab = () => {
  const { user, updateUser } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingBank, setDeletingBank] = useState<{ index: number; item: any } | null>(null);

  const handleDeleteClick = (idx: number) => {
    const list = Array.isArray((user as any)?.bankDetails) ? ([...(user as any).bankDetails]) : [];
    const item = list[idx];
    setDeletingBank({ index: idx, item });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBank) return;
    const current = Array.isArray((user as any)?.bankDetails) ? ([...(user as any).bankDetails]) : [];
    const next = current.filter((_: any, i: number) => i !== deletingBank.index);
    const res = await authService.updateEmployeeProfile(((user as any)?._id || (user as any)?.id) as string, { bankDetails: next });
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), bankDetails: returned?.bankDetails ?? next } as any);
      toast.success('Financial record purged');
      setDeleteOpen(false);
      setDeletingBank(null);
    } else {
      toast.error(res.message || 'Purge protocol failed');
    }
  };

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 bg-slate-900/20 px-8 py-6">
        <div>
          <CardTitle className="text-lg font-black uppercase tracking-widest text-blue-400">Financial Nodes</CardTitle>
          <CardDescription className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">Registered accounts for transaction protocols</CardDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-slate-800 hover:bg-blue-600 hover:text-white transition-all h-9 px-4 font-black uppercase text-[10px] tracking-widest"
          onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'bank' }))}
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Initialize Node
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        {Array.isArray((user as any).bankDetails) && (user as any).bankDetails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(user as any).bankDetails.map((bd: any, idx: number) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 relative group transition-all hover:border-blue-500/30">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Landmark className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black uppercase tracking-tight text-white">{bd.bankName}</h4>
                        <span className="inline-block px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-500 uppercase tracking-widest">
                          {bd.bankAccountType || 'Standard'} Account
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-slate-500 hover:text-blue-500 transition-colors"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: { key: 'bank', index: idx } }))}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-slate-500 hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteClick(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                    <div className="space-y-1">
                      <span className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">Account Number</span>
                      <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold tracking-wider">
                        <CreditCard className="h-3 w-3 text-blue-500" />
                        {bd.bankAccountNumber}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">IFSC Protocol</span>
                      <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold tracking-wider">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        {bd.bankIFSC}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">Authorized Signatory</span>
                    <div className="flex items-center gap-2 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <Hash className="h-3 w-3 text-slate-700" />
                      {bd.bankAccountHolderName}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
            <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-slate-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Financial Grid Offline</h3>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">Initialize bank account details for payroll processing</p>
            </div>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase font-black tracking-widest">Decommission Node</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest leading-relaxed">
              Are you sure you want to permanently erase this financial node? This action will impact automated credit protocols.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 uppercase font-black text-[10px] tracking-widest h-10 px-6">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white uppercase font-black text-[10px] tracking-widest h-10 px-6 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              Confirm Decommission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default BankdetailsTab