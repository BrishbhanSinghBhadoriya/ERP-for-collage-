import api from "@/lib/api";
import Cookies from "js-cookie";
import { Cookie } from "next/font/google";

const getDashboardData = async () => {
    const token = Cookies.get('token');
    const response = await api.get('hr/getHrDashboardWithAttendance', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export default getDashboardData;

export const getEmployeesDashboardata=async ()=>{
    const token =Cookies.get('token');
    const response=await api.get('/users/getDashboard',{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    return response.data;
}