import axiosInstance from "./axios-instance";

// REGISTER
export const registerUser = async (data: Record<string, any>): Promise<any> => {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
};

// VERIFY EMAIL
export const verifyEmail = async (data: { email: string; otp: string }): Promise<any> => {
    const res = await axiosInstance.post("/auth/verify-email", data);
    return res.data;
};

// RESEND VERIFY EMAIL
export const resendVerifyEmail = async (email: string): Promise<{ message: string }> => {
    const res = await axiosInstance.post("/auth/resend-verification", { email });
    return res.data;
};

// LOGIN
export const loginUser = async (data: { email: string; password: string }): Promise<any> => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
};

// FORGOT PASSWORD
export const forgotPassword = async (data: { email: string }): Promise<any> => {
    const res = await axiosInstance.post("/auth/forgot-password", data);
    return res.data;
};

// RESET PASSWORD
export const resetPassword = async (data: { token: string; newPassword: string }): Promise<any> => {
    const res = await axiosInstance.post("/auth/reset-password", data);
    return res.data;
};

// GET CURRENT USER
export const getCurrentUser = async (): Promise<any> => {
    const res = await axiosInstance.get("/auth/me");
    return res.data.user;
};

// GOOGLE LOGIN
export const loginWithGoogle = async (code: string): Promise<any> => {
    const res = await axiosInstance.post("/auth/google", { code });
    return res.data;
};