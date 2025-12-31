import axiosInstance from "./axios-instance";

export const getUserBadges = async (): Promise<any> => {
    const res = await axiosInstance.get(`/badges/`);
    return res.data;
};