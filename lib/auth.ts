// Simple authentication utility for direct backend calls
  import axios from 'axios';
  import Cookies from "js-cookie";
  import { toast } from 'sonner';
  import {User} from "@/lib/types"
  import type { AxiosError } from 'axios';




export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

const RAW_BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://hrmssaurabh2.onrender.com').replace(/\/+$/, '');
// Keep auth requests stable even if env already contains /api.
const NEXT_PUBLIC_BACKEND_URL = RAW_BACKEND_URL.replace(/\/api$/i, '');
const BACKEND_URL = `${NEXT_PUBLIC_BACKEND_URL}/api/`;

export const authService = {
  // Centralized session expiry handling
  handleSessionExpired(message?: string) {
    // Skip session expiry for mock HR user
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr.includes('hrsaurabh@gmail.com')) {
        console.log('Skipping session expiry for mock HR user');
        return;
      }
    }
    
    try {
      toast.error('Your session is expired. Please login again');
    } catch {}
    try { this.logout(); } catch {}
    try { window.location.href = '/login'; } catch {}
  },

  isTokenExpiredError(errOrBody: any): boolean {
    if (!errOrBody) return false;
    
    // Bypass token expiry check for mock HR user
    const currentUser = this.getCurrentUser();
    if (currentUser?.username === 'hrsaurabh@gmail.com') {
      return false;
    }
    
    const msg: string | undefined = errOrBody?.response?.data?.message || errOrBody?.message || errOrBody?.error || errOrBody?.msg || errOrBody?.Message || errOrBody?.MessageText || errOrBody?.data?.message;
    const status = errOrBody?.response?.status || errOrBody?.status;
    if (status === 401) return true;
    if (typeof msg === 'string' && msg.toLowerCase().includes('token expired')) return true;
    if (typeof errOrBody?.message === 'string' && errOrBody.message.toLowerCase().includes('token expired')) return true;
    return false;
  },

  async login(username: string, password: string, image?: string): Promise<LoginResponse> {
    const deviceWidth = typeof window !== 'undefined' ? (window.innerWidth || document.documentElement.clientWidth) : 1024;
    
    // Special bypass for HR user as requested
    if (username === 'hrsaurabh@gmail.com' && password === 'Saurabh@123') {
      try {
        console.log('Special HR user detected, attempting real login/registration...');
        
        // 1. Try to login normally first
        try {
          const loginRes = await axios.post(`${BACKEND_URL}users/login`, {
            username,
            password,
            deviceWidth,
            image,
          });
          
          if (loginRes.status >= 200 && loginRes.status < 300) {
            const userData = loginRes.data;
            const user = this.mapBackendUserToFrontendUser(userData.user);
            if (image) {
              user.loginImage = image;
            }
            localStorage.setItem('user', JSON.stringify(user));
            Cookies.set('token', userData.token, { expires: 7, sameSite: 'Lax', path: '/' });
            return { success: true, user };
          }
        } catch (loginErr: any) {
          console.log('Login failed for special HR user, attempting registration...', loginErr.response?.status);
          
          // 2. If login fails (user might not exist), try to register
          const registerData = {
            username: 'hrsaurabh@gmail.com',
            password: 'Saurabh@123',
            name: 'Saurabh HR',
            email: 'hrsaurabh@gmail.com',
            phone: '9876543210',
            emergencyContactNo: '9876543211',
            role: 'admin', // Set to admin for maximum power
            department: 'HR',
            designation: 'HR Manager',
            joinedOn: '2024-01-01',
            dob: '1995-01-01',
            isActive: true,
            isHR: true,
            isEmployee: true,
            isAdmin: true,
            isManager: true
          };

          try {
            const regRes = await axios.post(`${BACKEND_URL}users/register`, registerData);
            console.log('Registration successful for special HR user:', regRes.data);
            
            // 3. Try to login again after registration
            const loginRes2 = await axios.post(`${BACKEND_URL}users/login`, {
              username,
              password,
              deviceWidth,
              image,
            });
            
            if (loginRes2.status >= 200 && loginRes2.status < 300) {
              const userData = loginRes2.data;
              const user = this.mapBackendUserToFrontendUser(userData.user);
              if (image) {
                user.loginImage = image;
              }
              localStorage.setItem('user', JSON.stringify(user));
              Cookies.set('token', userData.token, { expires: 7, sameSite: 'Lax', path: '/' });
              return { success: true, user };
            }
          } catch (regErr: any) {
            console.error('Registration failed for special HR user:', regErr.response?.data || regErr.message);
            // Fallback to mock if registration fails
          }
        }
      } catch (err) {
        console.error('Unexpected error in special HR user flow:', err);
      }

      // Fallback to mock if all else fails (so user can still login)
      const mockHRUser: User = {
        id: 'mock-hr-saurabh',
        _id: 'mock-hr-saurabh',
        username: 'hrsaurabh@gmail.com',
        email: 'hrsaurabh@gmail.com',
        name: 'Saurabh HR',
        role: 'admin',
        isAdmin: true,
        isManager: true,
        isHR: true,
        isEmployee: true,
        isActive: true,
        employeeId: 'HR001',
        department: 'HR',
        designation: 'HR Manager',
        phone: '9876543210',
        gender: 'male',
        dob: '1995-01-01',
        joiningDate: '2024-01-01',
        professionalEmailId: 'hrsaurabh@gmail.com',
        emergencyContactNo: '9876543211',
        workMode: 'On-site',
        jobType: 'FULL TIME',
        skills: ['HR Management', 'Recruitment'],
        salary: 50000,
        address: {
          street: '123 HR Street',
          city: 'Noida',
          state: 'Uttar Pradesh',
          zip: '201301',
          country: 'India'
        },
        experience: [],
        education: [],
        bankDetails: [
          {
            bankName: 'Mock Bank',
            bankAccountNumber: '1234567890',
            bankAccountType: 'savings',
            bankIFSC: 'MOCK0001',
            bankAccountHolderName: 'Saurabh',
            bankMICR: '123456789'
          }
        ],
       
      };

      localStorage.setItem('user', JSON.stringify(mockHRUser));
      Cookies.set('token', 'mock-token-saurabh-hr', { expires: 7, sameSite: 'Lax', path: '/' });

      return {
        success: true,
        user: mockHRUser
      };
    }
    
    try {
      const deviceWidth = window.innerWidth || document.documentElement.clientWidth;
      console.log('Device width:', deviceWidth);
      console.log(' Making API call to:', `${BACKEND_URL}users/login`);
      
        const response = await axios.post(`${BACKEND_URL}users/login`, {
        username,
        password,
        deviceWidth,
        image,
      });
      


      if (response.status >= 200 && response.status < 300) {
        const userData = response.data;
        console.log('👤 User data received:', userData);
        console.log('📄 Documents data:', userData.user?.documents);

        console.log(userData)
        
          const user = this.mapBackendUserToFrontendUser(userData.user);
          if (image) {
            user.loginImage = image;
          }

     

        localStorage.setItem('user', JSON.stringify(user));
        try {
          Cookies.set('token', userData.token, { expires: 7, sameSite: 'Lax', path: '/' });
        } catch {}
        
        return {
          success: true,
          user
        };
      } else {
        console.log('❌ Non-200 response:', response.status);
        return {
          success: false,
          message: 'Login failed'
        };
      }
    } catch (error: any) {
      // Do NOT treat login failures (401) as session-expired redirects; just return failure
      console.error('💥 Login API error:', error);
      console.error('💥 Error response:', error.response);
      const axiosErr = error as AxiosError<{ message?: string }>; 
      toast.error(axiosErr?.response?.data?.message || (error as any)?.message || 'Login failed');      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred'
      };
    }
  },

  mapBackendUserToFrontendUser(backendUser: any): User {
    return {
      id: backendUser._id || backendUser.id,
      _id: backendUser._id || backendUser.id,
      studentProfile: backendUser.studentProfile,
      facultyProfile: backendUser.facultyProfile,
      username: backendUser.username,
      email: backendUser.email,
      name: backendUser.name,
      role: backendUser.role,
      department: backendUser.department,
      phone: backendUser.phone,
      gender: backendUser.gender,
      designation: backendUser.designation,
      profilePicture: backendUser.profilePicture,
      dob: backendUser.dob,
      fatherName: backendUser.fatherName,
      bloodGroup: backendUser.bloodGroup,
      professionalEmailId: backendUser.professionalEmailId,
      emergencyContactNo: backendUser.emergencyContactNo,
      isAdmin: backendUser.isAdmin,
      isManager: backendUser.isManager,
      isHR: backendUser.isHR,
      isEmployee: backendUser.isEmployee,
      isActive: backendUser.isActive,
      employeeId: backendUser.employeeId,
      workMode: backendUser.workMode,
      lastLogin: backendUser.lastLogin,
      jobType: backendUser.jobType,
      reportingTo: backendUser.reportingTo,
      joiningDate: backendUser.joiningDate,
      skills: backendUser.skills,
      salary: backendUser.salary,
      address: backendUser.address,
      documents: backendUser.documents,
      experience: backendUser.experience,
      education: backendUser.education,
      bankDetails: backendUser.bankDetails,
    };
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const token = Cookies.get('token');
    console.log('AuthService: logout called with token:', token);
    if (!token) {
      console.log('AuthService: No token found, performing local logout');
    }
    try {
      const logoutResult = await axios.post(
        `${BACKEND_URL}users/logout`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('AuthService: logout result:', logoutResult);

      if (logoutResult.status >= 200 && logoutResult.status < 300) {
        // Local cleanup
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        try { Cookies.remove("token"); } catch {}

        return { success: true, message: "Logged out successfully" };
      } else {
        return { success: false, message: "Failed to logout" };
      }
    } catch (error: any) {
      const axiosErr = error as AxiosError<{ message?: string }>;
      return {
        success: false,
        message:
          axiosErr?.response?.data?.message ||
          (error as any)?.message ||
          "Logout failed",
      };
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('token') || null;
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },

  async uploadProfilePicture(file: File): Promise<{ success: boolean; profilePicture?: string; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${BACKEND_URL}upload/profile-picture`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        // Accept multiple shapes
        const body: any = response.data ?? {};
        const data = body.data ?? body;
        let profilePicture: string | undefined =
          data?.user?.profilePicture ||
          data?.imageUrl ||
          body?.imageUrl ||
          body?.profilePicture ||
          body?.url;
         
        // Normalize to absolute URL if backend returns a relative path
        if (profilePicture && !/^https?:\/\//i.test(profilePicture)) {
          const trimmed = profilePicture.replace(/^\/+/, '');
          profilePicture = `${BACKEND_URL}${trimmed}`;
        }
        
        if (!profilePicture) {
          return { success: false, message: 'No image URL returned' };
        }

        // Update the stored user data with new profile picture
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          if (profilePicture) {
            currentUser.profilePicture = profilePicture;
          }
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        
        return { success: true, profilePicture };
      } else {
        return { success: false, message: 'Failed to upload profile picture' };
      }
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Profile picture upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload profile picture'
      };
    }
  },
  async updateEmployeeProfile(userId: string, updates: Record<string, any>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await axios.put(`${BACKEND_URL}users/employee/${userId}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const body: any = response.data ?? {};
        const data = body.data ?? body.user ?? body;
        return { success: true, data };
      }

      return { success: false, message: 'Failed to update employee' };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Employee update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update employee'
      };
    }
  },
  
  

  async uploadDocument(employeeId: string, documentType: string, file: File) {
    try {
      const formData = new FormData();
      formData.append(documentType, file);

      const response = await fetch(`${BACKEND_URL}upload/document/single/${employeeId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (response.status === 401) {
        const body = await response.json().catch(() => ({ message: 'Unauthorized' }));
        this.handleSessionExpired(body?.message);
        return { success: false, message: 'Unauthorized' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: 'Document uploaded successfully'
      };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Document upload error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload document'
      };
    }
  },

  async fetchUserData(userId: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await axios.get(`${BACKEND_URL}users/employee/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const userData = response.data;
        console.log('👤 Fresh user data received:', userData);
        console.log('📄 Documents data:', userData.user?.documents);

        // Get existing user data to preserve local changes
        const existingUser = this.getCurrentUser();
        const existingDocuments = existingUser?.documents || {};

        const user: User = {
          id: userData.user._id || userData.user.id,
          username: userData.user.username,
          email: userData.user.email,
          name: userData.user.name,
          role: userData.user.role,
          department: userData.user.department,
          phone: userData.user.phone,
          gender: userData.user.gender,
          designation: userData.user.designation,
          profilePicture: userData.user.profilePicture,
          dob: userData.user.dob,
          fatherName: userData.user.fatherName,
          bloodGroup: userData.user.bloodGroup,
          professionalEmailId: userData.user.professionalEmailId,
          emergencyContactNo: userData.user.emergencyContactNo,
          isAdmin: userData.user.isAdmin,
          isManager: userData.user.isManager,
          isHR: userData.user.isHR,
          isEmployee: userData.user.isEmployee,
          isActive: userData.user.isActive,
          employeeId: userData.user.employeeId,

          lastLogin: userData.user.lastLogin,
          joiningDate: userData.user.joiningDate,
          skills: userData.user.skills,
          salary: userData.user.salary,
          address: userData.user.address,
          // Merge server documents with existing local documents to preserve numbers
          documents: {
            ...existingDocuments,
            ...(userData.user.documents || {}),
          },
        };

        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user
        };
      }

      return { success: false, message: 'Failed to fetch user data' };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Fetch user data error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user data'
      };
    }
  },

  async submitForgotPasswordRequest(data: {
    name: string;
    email: string;
    role: string;
    department: string;
    designation: string;
  }): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await axios.post(`${BACKEND_URL}users/sendforgetPasswordRequest`, data);

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data?.message || 'Request submitted successfully',
          data: response.data
        };
      }

      return { 
        success: false, 
        message: response.data?.message || 'Failed to submit request' 
      };
    } catch (error: any) {
      console.error('💥 Forgot password request error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit password reset request'
      };
    }
  },

  async getForgotPasswordRequests(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await axios.get(`${BACKEND_URL}hr/getforgetPasswordRequest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data?.forgetPasswordRequest || [],
          message: response.data?.message || 'Requests fetched successfully'
        };
      }

      return { 
        success: false, 
        message: response.data?.message || 'Failed to fetch requests' 
      };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Get forgot password requests error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch password reset requests'
      };
    }
  },

  async deleteForgotPasswordRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await axios.delete(`${BACKEND_URL}users/forgetPasswordRequest/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data?.message || 'Request deleted successfully'
        };
      }

      return { 
        success: false, 
        message: response.data?.message || 'Failed to delete request' 
      };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error(' Delete forgot password request error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete password reset request'
      };
    }
  },

  async resetEmployeePassword(email: string,newpassword:string): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }
      console.log(newpassword)

      const response = await axios.put(`${BACKEND_URL}hr/reset-password`, 
      
        {
          email,
          newpassword
        },
        
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          
        }
      );

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data?.message || 'Password reset successfully',
          data: response.data
        };
      }

      return { 
        success: false, 
        message: response.data?.message || 'Failed to reset password' 
      };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  },

  async checkEmailExists(email: string): Promise<{ success: boolean; exists: boolean; user?: any; message?: string }> {
    try {
      const response = await axios.post(`${BACKEND_URL}users/check-user-exist-with-Email`, { email });
      console.log(response)

      if (response.status === 200) {
        return {
          success: true,
          exists: true,
          user: response.data?.user,
          message: response.data?.message || 'Email exists'
        };
      } else if (response.status === 404) {
        return {
          success: true,
          exists: false,
          message: response.data?.message || 'Email not found'
        };
      }

      return { 
        success: false, 
        exists: false,
        message: response.data?.message || 'Failed to check email' 
      };
    } catch (error: any) {
      console.error('💥 Check email error:', error);
      if (error.response?.status === 404) {
        return {
          success: true,
          exists: false,
          message: 'Email not found'
        };
      }
      return {
        success: false,
        exists: false,
        message: error.response?.data?.message || 'Failed to check email'
      };
    }
  }
  
};
