import axiosInstance from "./axios-instance";

export const getUserProfile = async (): Promise<any> => {
    const res = await axiosInstance.get(`/profile/me`);
    return res.data;
};

export const getUserStats = async (): Promise<any> => {
    const res = await axiosInstance.get(`/profile/me/stats`);
    return res.data;
};