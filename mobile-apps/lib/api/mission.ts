import axiosInstance from './axios-instance';

export const getUserMissions = async (): Promise<any> => {
    const res = await axiosInstance.get(`/missions/`);
    return res.data;
};