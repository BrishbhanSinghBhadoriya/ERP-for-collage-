import api from "@/lib/api";
import Cookies from "js-cookie";
import { toast } from "sonner";



const getLeaves = async (userRole?: string) => {
   try {
    let url = '';
      if (userRole === 'employee') {
        url = '/leaves/me';
      } else {
            const params = new URLSearchParams();
            url = `leaves?${params.toString()}`;
          }
          const token= Cookies.get('token');
          const response = await api.get(url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
         return response.data.leaves;
    
    
          
    
   } catch (error) {
    toast.error('Failed to fetch leave requests');
    return [];
   }
};

export default getLeaves;