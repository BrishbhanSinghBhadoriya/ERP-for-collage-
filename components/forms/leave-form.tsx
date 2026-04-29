"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import dayjs from 'dayjs';

const leaveSchema = z.object({
  type: z.enum(['casual', 'sick', 'earned', 'fop', 'lop', 'short_leave']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  remarks: z.string().optional(),
}).refine((data) => {
  return dayjs(data.endDate).isAfter(dayjs(data.startDate)) || dayjs(data.endDate).isSame(dayjs(data.startDate));
}, {
  message: "End date must be after or same as start date",
  path: ["endDate"],
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveFormProps {
  onSubmit: (data: LeaveFormData & { days: number }) => void;
  onCancel: () => void;
}

export function LeaveForm({ onSubmit, onCancel }: LeaveFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      return end.diff(start, 'day') + 1;
    }
    return 0;
  };

  const days = calculateDays();

  const handleFormSubmit = (data: LeaveFormData) => {
    onSubmit({ ...data, days });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Leave Type</Label>
          <Select
            value={watch('type')}
            onValueChange={(value: any) => setValue('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual Leave</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="earned">Earned Leave</SelectItem>
              <SelectItem value="fop">FOP</SelectItem>
              <SelectItem value="lop">LOP</SelectItem>
              <SelectItem value="short_leave">Short Leave</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Duration</Label>
          <div className="text-sm text-muted-foreground">
            {watch('type') === 'short_leave' ? '0.25 days (2 hours)' : (days > 0 ? `${days} day${days > 1 ? 's' : ''}` : 'Select dates')}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}

          />
          {errors.startDate && (
            <p className="text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}

          />
          {errors.endDate && (
            <p className="text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          {...register('reason')}
          placeholder="Please provide a reason for your leave request..."
          rows={3}
        />
        {errors.reason && (
          <p className="text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks (Optional)</Label>
        <Input
          id="remarks"
          {...register('remarks')}
          placeholder="Additional remarks..."
        />
        {errors.remarks && (
          <p className="text-sm text-red-600">{errors.remarks.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={days === 0}>
          Submit Leave Request
        </Button>
      </div>
    </form>
  );
}