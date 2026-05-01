import api from '@/lib/api';

export const createHostelLeave = async (data: any) => {
    const response = await api.post('hostel-leaves', data);
    return response.data;
};

export const getHostelLeaves = async () => {
    const response = await api.get('hostel-leaves');
    return response.data.data;
};

export const approveByWarden = async (leaveId: string, status: string, remarks: string) => {
    const response = await api.put('hostel-leaves/approve-warden', { leaveId, status, remarks });
    return response.data;
};

export const approveByHOD = async (leaveId: string, status: string, remarks: string) => {
    const response = await api.put('hostel-leaves/approve-hod', { leaveId, status, remarks });
    return response.data;
};

export const finalForwardByWarden = async (leaveId: string) => {
    const response = await api.put('hostel-leaves/final-forward', { leaveId });
    return response.data;
};
