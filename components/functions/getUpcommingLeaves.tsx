import api from "@/lib/api";
import Cookies from "js-cookie";

export const getUpcommingLeaves=async()=>{
    const token = Cookies.get('token');
    const response = await api.get('hr/getupcomingLeaves', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}