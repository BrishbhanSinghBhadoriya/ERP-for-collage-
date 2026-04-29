import api from "@/lib/api";
import Cookies from "js-cookie";

const token = Cookies.get('token');

const approveLeave = async (leaveId: string) => {
    const response = await api.put(`/leaves/approveLeave/${leaveId}`, {
        status: 'approved'
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
const rejectLeave = async (leaveId: string) => {
    const response = await api.put(`/leaves/rejectLeave/${leaveId}`, {
        status: 'rejected'
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export { approveLeave, rejectLeave };


