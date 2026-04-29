import { Input } from "@/components/ui/input";
import { EditModal } from "@/components/ui/edit-modal";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { authService } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";


export const EditModalSection = ({ targetUserId, initialUser }: { targetUserId?: string; initialUser?: any }) => {
const [modalOpen, setModalOpen] = useState<null | 'personal' | 'contact' | 'job' | 'experience' | 'education' | 'bank' | 'skills' | 'address' | 'documents'>(null);
const openEdit = (key: 'personal' | 'contact' | 'job' | 'experience' | 'education' | 'bank' | 'skills' | 'address' | 'documents') => setModalOpen(key);
const [isSavingModal, setIsSavingModal] = useState(false);
const { user, updateUser } = useAuth();
const currentUser = authService.getCurrentUser();
const activeUser = (initialUser as any) ?? (user as any);
const updateTargetId = targetUserId ?? (user as any)?.id;

const isHRorAdmin = currentUser?.role === 'hr' || currentUser?.role === 'admin';

// New: edit indices
const [expEditIndex, setExpEditIndex] = useState<number | null>(null);
const [eduEditIndex, setEduEditIndex] = useState<number | null>(null);
const [bankEditIndex, setBankEditIndex] = useState<number | null>(null);

const closeEdit = () => {
  setModalOpen(null);
  // Ensure indices are cleared when closing to avoid accidental edits on next add
  setExpEditIndex(null);
  // Reset experience form so a fresh add doesn't carry previous values
  experienceForm.reset({ company: '', designation: '', startDate: '', endDate: '', description: '' });
};
const personalInfoSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    fatherName: z.string().optional(),
    dob: z.string().optional(),
    bloodGroup: z.string().optional(),
    address: z.string().optional(),
    gender: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(['active', 'inactive', 'terminated']).optional(),
  });
const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.coerce.number().min(10, 'Phone must be at least 10 characters'),
  professionalEmailId: z.string().email('Invalid email address'),
  emergencyContactNo: z.coerce.number().min(10, 'Phone must be at least 10 characters'),
});
const jobInfoSchema = z.object({
  employeeId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  workMode: z.string().optional(),
  jobType: z.string().optional(),
  reportingTo: z.string().optional(),
  joiningDate: z.coerce.string().min(1, 'Joining date is required'),
});
const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  designation: z.string().min(1, 'Designation is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().refine((val) => !val || val.trim() !== '', {
    message: "End date cannot be empty string"
  }),
  description: z.string().optional(),
});
const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  grade: z.string().optional(),
});
const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  bankAccountNumber: z.string().min(1, 'Account number is required'),
  bankAccountType: z.string().optional(),
  bankIFSC: z.string().min(1, 'IFSC is required'),
  bankAccountHolderName: z.string().min(1, 'Account holder name is required'),
  bankMICR: z.string().optional(),
});
const skillsSchema = z.object({ skills: z.string().optional() });
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
    country: z.string().optional(),
    bankMICR: z.string().optional(),
  });

const documentsSchema = z.object({
  adharImage: z.string().optional(),
  adharNumber: z.string().optional(),
  panImage: z.string().optional(),
  panNumber: z.string().optional(),
  experienceLetterImage: z.string().optional(),
  MarksheetImage_10: z.string().optional(),
  MarksheetImage_12: z.string().optional(),
  MarksheetImage_Graduation: z.string().optional(),
  MarksheetImage_PostGraduationImage: z.string().optional(),
  bankMICR: z.string().optional(),
});
  const toYMD = (d?: string) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${m}-${day}`;

  };

const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: activeUser?.name || '',
      fatherName: (activeUser as any)?.fatherName || '',

      dob: toYMD((activeUser as any)?.dob || (activeUser as any)?.dob), 
      bloodGroup:(activeUser as any)?.bloodGroup || '',
     address: typeof (activeUser as any)?.address === 'string' ? (activeUser as any).address : '',
     gender: activeUser?.gender || '',
     country: activeUser?.country || 'India',
     status: (activeUser as any)?.status || 'active',
    },
  });

const contactForm = useForm({
  resolver: zodResolver(contactInfoSchema),
  defaultValues: {
    email: activeUser?.email || '',
    phone: (activeUser as any)?.phone ? Number((activeUser as any)?.phone) : '',
    professionalEmailId: (activeUser as any)?.professionalEmailId || '',
    emergencyContactNo: (activeUser as any)?.emergencyContactNo ? Number((activeUser as any)?.emergencyContactNo) : '',
  },
});
const jobForm = useForm({
  resolver: zodResolver(jobInfoSchema),
  defaultValues: {
    employeeId: (activeUser as any)?.employeeId || '',
    department: (activeUser as any)?.department || '',
    designation: (activeUser as any)?.designation || '',
    workMode: (activeUser as any)?.workMode || '',
    jobType: (activeUser as any)?.jobType || '',
    reportingTo: (activeUser as any)?.reportingTo || '',
    joiningDate: toYMD((activeUser as any)?.joiningDate) || undefined,
  },
});
const experienceForm = useForm({
  resolver: zodResolver(experienceSchema),
  defaultValues: { company: '', designation: '', startDate: '', endDate: '', description: '' },
});
const educationForm = useForm({
  resolver: zodResolver(educationSchema),
  defaultValues: { degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' },
});
const bankForm = useForm({
  resolver: zodResolver(bankSchema),
  defaultValues: { bankName: '', bankAccountNumber: '', bankAccountType: 'savings', bankIFSC: '', bankAccountHolderName: '', bankMICR: '' },
});
const skillsForm = useForm({
  resolver: zodResolver(skillsSchema),
  defaultValues: { skills: Array.isArray((activeUser as any)?.skills) ? (activeUser as any).skills.join(', ') : '' },
  });
const addressForm = useForm({
  resolver: zodResolver(addressSchema),
  defaultValues: {
    street: (activeUser as any)?.address?.street || '',
    city: (activeUser as any)?.address?.city || '',
    state: (activeUser as any)?.address?.state || '',
    zip: (activeUser as any)?.address?.zip || '',
    country: (activeUser as any)?.address?.country || 'India',
    },
  });

const documentsForm = useForm({
  resolver: zodResolver(documentsSchema),
  defaultValues: {
    adharImage: (activeUser as any)?.documents?.adharImage || '',
    adharNumber: (activeUser as any)?.documents?.adharNumber || '',
    panImage: (activeUser as any)?.documents?.panImage || '',
    panNumber: (activeUser as any)?.documents?.panNumber || '',
    experienceLetterImage: (activeUser as any)?.documents?.experienceLetterImage || '',
    MarksheetImage_10: (activeUser as any)?.documents?.MarksheetImage_10 || '',
    MarksheetImage_12: (activeUser as any)?.documents?.MarksheetImage_12 || '',
    MarksheetImage_Graduation: (activeUser as any)?.documents?.MarksheetImage_Graduation || '',
    MarksheetImage_PostGraduationImage: (activeUser as any)?.documents?.MarksheetImage_PostGraduationImage || '',
  },
});


const savePersonal = async () => {
    setIsSavingModal(true);
    try {
      const valid = await personalForm.trigger();
      if (!valid) return;
      const payload = {
        name: personalForm.getValues('name'),
        fatherName: personalForm.getValues('fatherName') || undefined,
        dob: personalForm.getValues('dob') || undefined,
        bloodGroup: personalForm.getValues('bloodGroup') || undefined,
        address: personalForm.getValues('address') || undefined,
        gender: personalForm.getValues('gender') || undefined,
        country: personalForm.getValues('country') || undefined,
        status: personalForm.getValues('status') || undefined,
      };
      const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
      if (res.success) {
        const returned = res.data?.user || res.data;
        updateUser({
          name: returned?.name ?? payload.name,
          fatherName: returned?.fatherName ?? payload.fatherName,
          dob: (returned as any)?.dob ?? payload.dob,
          bloodGroup: returned?.bloodGroup ?? payload.bloodGroup,
          address: returned?.address ?? payload.address,
          gender: returned?.gender ?? payload.gender,
          status: (returned as any)?.status ?? payload.status,
        } as any);
        toast.success('Personal information saved');
        closeEdit();
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } finally {
      setIsSavingModal(false);
    }
  };

const saveContact = async () => {
  setIsSavingModal(true);
  try {
    const valid = await contactForm.trigger();
    console.log('Form validation result:', valid);
    if (!valid) {
      console.log('Form validation failed');
      console.log('Form errors:', contactForm.formState.errors);
      console.log('Form values:', contactForm.getValues());
      return;
    }
    const payload: any = {
      email: contactForm.getValues('email'),
      phone: contactForm.getValues('phone') ? Number(contactForm.getValues('phone')) : undefined,
      professionalEmailId: contactForm.getValues('professionalEmailId') || undefined,
      emergencyContactNo: contactForm.getValues('emergencyContactNo') ? Number(contactForm.getValues('emergencyContactNo')) : undefined,
    };
    console.log('Contact payload:', payload);
    console.log('Update target ID:', updateTargetId);
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    console.log('API response:', res);
    if (res.success) {
      const returned = res.data?.user || res.data;
      console.log('Returned data:', returned);
      updateUser({
        email: returned?.email ?? payload.email,
        phone: returned?.phone ?? payload.phone,
        professionalEmailId: (returned as any)?.professionalEmailId ?? payload.professionalEmailId,
        emergencyContactNo: (returned as any)?.emergencyContactNo ?? payload.emergencyContactNo,
      } as any);
      toast.success('Contact information saved');
      setModalOpen(null);
    } else {
      console.error('Save failed:', res.message);
      toast.error(res.message || 'Failed to save');
    }
  } catch (error) {
    console.error('Contact save error:', error);
    toast.error('An error occurred while saving');
  } finally { 
    setIsSavingModal(false); 
  }
};

const saveJob = async () => {
  setIsSavingModal(true);
  try {
    const valid = await jobForm.trigger();
    if (!valid) return;
    const payload = jobForm.getValues();
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({
        employeeId: returned?.employeeId ?? payload.employeeId,
        department: returned?.department ?? payload.department,
        designation: returned?.designation ?? payload.designation,
        workMode: returned?.workMode ?? payload.workMode,
        jobType: returned?.jobType ?? payload.jobType,
        reportingTo: returned?.reportingTo ?? payload.reportingTo,
        joiningDate: returned?.joiningDate ?? payload.joiningDate,
      } as any);
      toast.success('Job information saved');
      setModalOpen(null);
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveExperience = async () => {
  setIsSavingModal(true);
  try {
    const valid = await experienceForm.trigger();
    if (!valid) return;
    const newItem = {
      company: experienceForm.getValues('company'),
      designation: experienceForm.getValues('designation'),
      startDate: experienceForm.getValues('startDate') || ' ',
      endDate: experienceForm.getValues('endDate') || ' ',
      description: experienceForm.getValues('description') || '',
    };
    const currentList = Array.isArray((activeUser as any)?.experience) ? ([...(activeUser as any).experience]) : [];
    // If no valid edit index, always append; only replace when a valid index is explicitly set
    const nextList = typeof expEditIndex === 'number' && expEditIndex >= 0
      ? currentList.map((it, i) => i === expEditIndex ? { ...it, ...newItem } : it)
      : [...currentList, newItem];
    const payload: any = { experience: nextList };
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), experience: returned?.experience ?? nextList } as any);
      toast.success(expEditIndex !== null ? 'Experience updated' : 'Experience added');
      setExpEditIndex(null);
      setModalOpen(null);
      experienceForm.reset();
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveEducation = async () => {
  setIsSavingModal(true);
  try {
    const valid = await educationForm.trigger();
    if (!valid) return;
    const newItem = {
      degree: educationForm.getValues('degree'),
      institution: educationForm.getValues('institution') || '',
      fieldOfStudy: educationForm.getValues('fieldOfStudy') || '',
      startDate: educationForm.getValues('startDate') || undefined,
      endDate: educationForm.getValues('endDate') || undefined,
      grade: educationForm.getValues('grade') || '',
    };
    const currentList = Array.isArray((activeUser as any)?.education) ? ([...(activeUser as any).education]) : [];
    const nextList = eduEditIndex !== null && eduEditIndex >= 0 ? currentList.map((it, i) => i === eduEditIndex ? newItem : it) : [...currentList, newItem];
    const payload: any = { education: nextList };
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), education: returned?.education ?? nextList } as any);
      toast.success(eduEditIndex !== null ? 'Education updated' : 'Education added');
      setEduEditIndex(null);
      setModalOpen(null);
      educationForm.reset();
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveBank = async () => {
  setIsSavingModal(true);
  try {
    const valid = await bankForm.trigger();
    if (!valid) return;
    const newItem = {
      bankName: bankForm.getValues('bankName'),
      bankAccountNumber: bankForm.getValues('bankAccountNumber'),
      bankAccountType: bankForm.getValues('bankAccountType'),
      bankIFSC: bankForm.getValues('bankIFSC'),
      bankAccountHolderName: bankForm.getValues('bankAccountHolderName'),
    };
    const currentList = Array.isArray((activeUser as any)?.bankDetails) ? ([...(activeUser as any).bankDetails]) : [];
    const nextList = bankEditIndex !== null && bankEditIndex >= 0 ? currentList.map((it, i) => i === bankEditIndex ? newItem : it) : [...currentList, newItem];
    const payload: any = { bankDetails: nextList };
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), bankDetails: returned?.bankDetails ?? nextList } as any);
      toast.success(bankEditIndex !== null ? 'Bank details updated' : 'Bank details added');
      setBankEditIndex(null);
      setModalOpen(null);
      bankForm.reset();
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveSkills = async () => {
  setIsSavingModal(true);
  try {
    const valid = await skillsForm.trigger();
    if (!valid) return;
    const csv = (skillsForm.getValues('skills') || '').trim();
    const skills = csv ? csv.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const payload = { skills } as any;
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ skills: returned?.skills ?? skills } as any);
      toast.success('Skills updated');
      setModalOpen(null);
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveAddress = async () => {
  setIsSavingModal(true);
  try {
    const valid = await addressForm.trigger();
    if (!valid) return;
    const payload = {
      address: {
        street: addressForm.getValues('street') || '',
        city: addressForm.getValues('city') || '',
        state: addressForm.getValues('state') || '',
        zip: addressForm.getValues('zip') || '',
        country: addressForm.getValues('country') || 'India',
      }
    } as any;
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ address: returned?.address ?? payload.address } as any);
      toast.success('Address updated');
      setModalOpen(null);
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveDocuments = async () => {
  setIsSavingModal(true);
  try {
    const valid = await documentsForm.trigger();
    if (!valid) return;
    const payload = {
      documents: {
        adharImage: documentsForm.getValues('adharImage') || undefined,
        adharNumber: documentsForm.getValues('adharNumber') || undefined,
        panImage: documentsForm.getValues('panImage') || undefined,
        panNumber: documentsForm.getValues('panNumber') || undefined,
        experienceLetterImage: documentsForm.getValues('experienceLetterImage') || undefined,
        MarksheetImage_10: documentsForm.getValues('MarksheetImage_10') || undefined,
        MarksheetImage_12: documentsForm.getValues('MarksheetImage_12') || undefined,
        MarksheetImage_Graduation: documentsForm.getValues('MarksheetImage_Graduation') || undefined,
        MarksheetImage_PostGraduationImage: documentsForm.getValues('MarksheetImage_PostGraduationImage') || undefined,
      }
    } as any;
    const res = await authService.updateEmployeeProfile(updateTargetId!, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ documents: returned?.documents ?? payload.documents } as any);
      toast.success('Documents updated');
      setModalOpen(null);
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

useEffect(() => {
  const handler = (e: any) => {
    const detail = e?.detail as any;
    if (typeof detail === 'string') {
      openEdit(detail as 'personal' | 'contact' | 'job' | 'experience' | 'education' | 'bank' | 'skills' | 'address' | 'documents');
      if (detail === 'experience') {
        setExpEditIndex(null);
        experienceForm.reset({ company: '', designation: '', startDate: '', endDate: '', description: '' });
      }
      return;
    }
    if (detail && typeof detail === 'object') {
      const { key, index } = detail || {};
      if (key) openEdit(key as 'personal' | 'contact' | 'job' | 'experience' | 'education' | 'bank' | 'skills' | 'address' | 'documents');
      if (key === 'experience') {
        const hasIndex = typeof index === 'number' && index >= 0;
        setExpEditIndex(hasIndex ? index : null);
        if (hasIndex) {
          const item = Array.isArray((activeUser as any)?.experience) ? (activeUser as any).experience[index] : undefined;
          if (item) {
            experienceForm.setValue('company', item.company || '');
            experienceForm.setValue('designation', item.designation || '');
            experienceForm.setValue('startDate', item.startDate ? toYMD(item.startDate) : '');
            experienceForm.setValue('endDate', item.endDate ? toYMD(item.endDate) : '');
            experienceForm.setValue('description', item.description || '');
          }
        } else {
          experienceForm.reset({ company: '', designation: '', startDate: '', endDate: '', description: '' });
        }
      }
      if (key === 'education') {
        setEduEditIndex(typeof index === 'number' ? index : null);
        const item = Array.isArray((activeUser as any)?.education) ? (activeUser as any).education[index] : undefined;
        if (item) {
          educationForm.setValue('degree', item.degree || '');
          educationForm.setValue('institution', item.institution || '');
          educationForm.setValue('fieldOfStudy', item.fieldOfStudy || '');
          educationForm.setValue('startDate', item.startDate ? toYMD(item.startDate) : '');
          educationForm.setValue('endDate', item.endDate ? toYMD(item.endDate) : '');
          educationForm.setValue('grade', item.grade || '');
        }
      }
      if (key === 'bank') {
        setBankEditIndex(typeof index === 'number' ? index : null);
        const item = Array.isArray((activeUser as any)?.bankDetails) ? (activeUser as any).bankDetails[index] : undefined;
        if (item) {
          bankForm.setValue('bankName', item.bankName || '');
          bankForm.setValue('bankAccountHolderName', item.bankAccountHolderName || '');
          bankForm.setValue('bankAccountNumber', item.bankAccountNumber || '');
          bankForm.setValue('bankAccountType', item.bankAccountType || 'savings');
          bankForm.setValue('bankIFSC', item.bankIFSC || '');
        }
      }
    }
  };
  window.addEventListener('open-edit-modal', handler);
  return () => window.removeEventListener('open-edit-modal', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeUser]);

return (
  <>
<EditModal
        open={modalOpen === 'personal'}
        onOpenChange={(o) => (o ? openEdit('personal') : closeEdit())}
        title="Edit Personal Information"
        description="Update your personal details"
        onSave={savePersonal}
        isSaving={isSavingModal}
      >
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="modal_name">Full Name</Label>
            <Input id="modal_name" {...personalForm.register('name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_fname">Father/Spouse/Guardian Name</Label>
            <Input id="modal_fname" {...personalForm.register('fatherName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_dob">Date of Birth</Label>
            <Input id="modal_dob" type="date" {...personalForm.register('dob')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_dob">Blood Group</Label>
            <Input id="modal_dob" {...personalForm.register('bloodGroup')} />
          </div>

          {isHRorAdmin && (
            <div className="space-y-2">
              <Label htmlFor="modal_status">Employee Status</Label>
              <Controller
                control={personalForm.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="modal_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </form>
      </EditModal>

  <EditModal
    open={modalOpen === 'contact'}
    onOpenChange={(o) => (o ? openEdit('contact') : closeEdit())}
    title="Edit Contact Information"
    description="Update your contact details"
    onSave={saveContact}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="modal_email">Email</Label>
        <Input id="modal_email" type="email" {...contactForm.register('email')} />
        {contactForm.formState.errors.email && (
          <p className="text-xs text-red-500">{String(contactForm.formState.errors.email.message || '')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_phone">Phone</Label>
        <Input type="number" id="modal_phone" {...contactForm.register('phone')} />
        {contactForm.formState.errors.phone && (
          <p className="text-xs text-red-500">{String(contactForm.formState.errors.phone.message || '')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_pro_email">Professional Email</Label>
        <Input id="modal_pro_email" type="email" {...contactForm.register('professionalEmailId')} />
        {contactForm.formState.errors.professionalEmailId && (
          <p className="text-xs text-red-500">{String(contactForm.formState.errors.professionalEmailId.message || '')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_emg_phone">Emergency Phone Number</Label>
        <Input type="number" id="modal_emg_phone" {...contactForm.register('emergencyContactNo')} />
        {contactForm.formState.errors.emergencyContactNo && (
          <p className="text-xs text-red-500">{String(contactForm.formState.errors.emergencyContactNo.message || '')}</p>
        )}
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'address'}
    onOpenChange={(o) => (o ? openEdit('address') : closeEdit())}
    title="Edit Address"
    description="Update your address details"
    onSave={saveAddress}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="addr_street">Street</Label>
        <Input id="addr_street" {...addressForm.register('street')} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="addr_city">City</Label>
          <Input id="addr_city" {...addressForm.register('city')} />
        </div>
        <div>
          <Label htmlFor="addr_state">State</Label>
          <Input id="addr_state" {...addressForm.register('state')} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="addr_zip">ZIP</Label>
          <Input id="addr_zip" {...addressForm.register('zip')} />
        </div>
        <div>
          <Label htmlFor="addr_country">Country</Label>
          <Input id="addr_country" {...addressForm.register('country')} />
        </div>
      </div>
    </form>
  </EditModal>
  <EditModal
    open={modalOpen === 'job'}
    onOpenChange={(o) => (o ? openEdit('job') : closeEdit())}
    title="Edit Job Information"
    description="Update job and payroll details"
    onSave={saveJob}
    isSaving={isSavingModal}
  >
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="modal_empid">Employee ID</Label>
          <Input id="modal_empid" disabled {...jobForm.register('employeeId')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modal_dept">Department</Label>
          <Input id="modal_dept" disabled={!targetUserId && (user as any)?.role === 'employee'} {...jobForm.register('department')} />
        {jobForm.formState.errors.department && (
          <p className="text-xs text-red-500">{String(jobForm.formState.errors.department.message || '')}</p>
        )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="modal_desig">Designation</Label>
        <Input id="modal_desig"  {...jobForm.register('designation')} />
        {jobForm.formState.errors.designation && (
          <p className="text-xs text-red-500">{String(jobForm.formState.errors.designation.message || '')}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="modal_joiningDate">Joining Date</Label>
        <Input id="modal_joiningDate" disabled={!targetUserId && (user as any)?.role === 'employee'} type="date" {...jobForm.register('joiningDate')} />
        {jobForm.formState.errors.joiningDate && (
          <p className="text-xs text-red-500">{String(jobForm.formState.errors.joiningDate.message || '')}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="modal_workmode">Work Mode</Label>
          <Controller
            control={jobForm.control}
            name="workMode"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="modal_workmode">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="modal_jobtype">Job Type</Label>
          <Controller
            control={jobForm.control}
            name="jobType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="modal_jobtype">
                  <SelectValue placeholder="Select Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL TIME">Full Time</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="modal_reporting">Reporting Manager</Label>
          <Controller
            control={jobForm.control}
            name="reportingTo"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="modal_reporting">
                  <SelectValue placeholder="Select Reporting Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atul">Atul</SelectItem>
                  <SelectItem value="shivam">Shivam</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'experience'}
    onOpenChange={(o) => {
      if (o) {
        // Opening: rely on the event detail to decide add vs edit; do not reset here
        openEdit('experience');
      } else {
        // Closing: clear state and reset
        closeEdit();
      }
    }}
    title={expEditIndex !== null && expEditIndex >= 0 ? 'Edit Experience' : 'Add Experience'}
    description={expEditIndex !== null && expEditIndex >= 0 ? 'Update this work experience' : 'Add a new work experience'}
    onSave={saveExperience}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="exp_company">Company *</Label>
        <Input id="exp_company" {...experienceForm.register('company')} />
        {experienceForm.formState.errors.company && (
          <p className="text-xs text-red-500">{String(experienceForm.formState.errors.company.message || '')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp_designation">Designation *</Label>
        <Input id="exp_designation" {...experienceForm.register('designation')} />
        {experienceForm.formState.errors.designation && (
          <p className="text-xs text-red-500">{String(experienceForm.formState.errors.designation.message || '')}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="exp_start">Start Date *</Label>
          <Input id="exp_start" type="date" {...experienceForm.register('startDate')} />
          {experienceForm.formState.errors.startDate && (
            <p className="text-xs text-red-500">{String(experienceForm.formState.errors.startDate.message || '')}</p>
          )}
        </div>
        <div>
          <Label htmlFor="exp_end">End Date</Label>
          <Input id="exp_end" type="date" {...experienceForm.register('endDate')} />
          {experienceForm.formState.errors.endDate && (
            <p className="text-xs text-red-500">{String((experienceForm.formState.errors as any)?.endDate?.message || '')}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp_desc">Description</Label>
        <Input id="exp_desc" {...experienceForm.register('description')} />
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'education'}
    onOpenChange={(o) => (o ? openEdit('education') : closeEdit())}
    title="Add Education"
    description="Add a new education record"
    onSave={saveEducation}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="edu_degree">Degree *</Label>
        <Input id="edu_degree" {...educationForm.register('degree')} />
        {educationForm.formState.errors.degree && (
          <p className="text-xs text-red-500">{String(educationForm.formState.errors.degree.message || '')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="edu_institution">Institution</Label>
        <Input id="edu_institution" {...educationForm.register('institution')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edu_field">Field of Study</Label>
        <Input id="edu_field" {...educationForm.register('fieldOfStudy')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edu_start">Start Date</Label>
          <Input id="edu_start" type="date" {...educationForm.register('startDate')} />
        </div>
        <div>
          <Label htmlFor="edu_end">End Date</Label>
          <Input id="edu_end" type="date" {...educationForm.register('endDate')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edu_grade">Grade</Label>
        <Input id="edu_grade" {...educationForm.register('grade')} />
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'bank'}
    onOpenChange={(o) => (o ? openEdit('bank') : closeEdit())}
    title="Add Bank Details"
    description="Add a new bank account"
    onSave={saveBank}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="bank_name">Bank Name *</Label>
        <Input id="bank_name" {...bankForm.register('bankName')} />
        {bankForm.formState.errors.bankName && (
          <p className="text-xs text-red-500">{String(bankForm.formState.errors.bankName.message || '')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bank_holder">Account Holder Name *</Label>
        <Input id="bank_holder" {...bankForm.register('bankAccountHolderName')} />
        {bankForm.formState.errors.bankAccountHolderName && (
          <p className="text-xs text-red-500">{String(bankForm.formState.errors.bankAccountHolderName.message || '')}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bank_accno">Account Number *</Label>
          <Input id="bank_accno" {...bankForm.register('bankAccountNumber')} />
          {bankForm.formState.errors.bankAccountNumber && (
            <p className="text-xs text-red-500">{String(bankForm.formState.errors.bankAccountNumber.message || '')}</p>
          )}
        </div>
        <div>
          <Label htmlFor="bank_type">Account Type *</Label>
          <Input id="bank_type" {...bankForm.register('bankAccountType')} />
          {bankForm.formState.errors.bankAccountType && (
            <p className="text-xs text-red-500">{String(bankForm.formState.errors.bankAccountType.message || '')}</p>
          )}
        </div>
          </div>
          <div className="space-y-2">
        <Label htmlFor="bank_ifsc">IFSC *</Label>
        <Input id="bank_ifsc" {...bankForm.register('bankIFSC')} />
        {bankForm.formState.errors.bankIFSC && (
          <p className="text-xs text-red-500">{String(bankForm.formState.errors.bankIFSC.message || '')}</p>
        )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_micr">Bank MICR *</Label>
            <Input id="bank_micr" {...bankForm.register('bankMICR')} />
            {bankForm.formState.errors.bankMICR && (
              <p className="text-xs text-red-500">{String(bankForm.formState.errors.bankMICR.message || '')}</p>
            )}
          </div>
        </form>
      </EditModal>

  <EditModal
    open={modalOpen === 'skills'}
    onOpenChange={(o) => (o ? openEdit('skills') : closeEdit())}
    title="Edit Skills"
    description="Enter comma-separated skills"
    onSave={saveSkills}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="modal_skills">Skills (comma separated)</Label>
        <Input id="modal_skills" placeholder="Node, React" {...skillsForm.register('skills')} />
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'documents'}
    onOpenChange={(o) => (o ? openEdit('documents') : closeEdit())}
    title="Upload Documents"
    description="Upload your personal and professional documents"
    onSave={saveDocuments}
    isSaving={isSavingModal}
  >
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-6">
        {/* Aadhar Card Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Aadhar Card</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc_adhar">Aadhar Card URL</Label>
              <Input id="doc_adhar" placeholder="https://example.com/aadhar.pdf" {...documentsForm.register('adharImage')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_adhar_number">Aadhar Number</Label>
              <Input 
                id="doc_adhar_number" 
                placeholder="1234 5678 9012" 
                {...documentsForm.register('adharNumber')}
                maxLength={12}
              />
            </div>
          </div>
        </div>

        {/* PAN Card Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">PAN Card</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc_pan">PAN Card URL</Label>
              <Input id="doc_pan" placeholder="https://example.com/pan.pdf" {...documentsForm.register('panImage')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_pan_number">PAN Number</Label>
              <Input 
                id="doc_pan_number" 
                placeholder="ABCDE1234F" 
                {...documentsForm.register('panNumber')}
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>

        {/* Other Documents */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Other Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc_experience">Experience Letter URL</Label>
              <Input id="doc_experience" placeholder="https://example.com/experience.pdf" {...documentsForm.register('experienceLetterImage')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_10th">10th Marksheet URL</Label>
              <Input id="doc_10th" placeholder="https://example.com/10th.pdf" {...documentsForm.register('MarksheetImage_10')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_12th">12th Marksheet URL</Label>
              <Input id="doc_12th" placeholder="https://example.com/12th.pdf" {...documentsForm.register('MarksheetImage_12')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_graduation">Graduation Marksheet URL</Label>
              <Input id="doc_graduation" placeholder="https://example.com/graduation.pdf" {...documentsForm.register('MarksheetImage_Graduation')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_postgrad">Post Graduation Marksheet URL</Label>
              <Input id="doc_postgrad" placeholder="https://example.com/postgrad.pdf" {...documentsForm.register('MarksheetImage_PostGraduationImage')} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Note: Please provide direct URLs to your documents. Make sure the URLs are accessible and the documents are in PDF or image format.</p>
      </div>
    </form>
  </EditModal>
  </>
);
};