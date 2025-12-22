import axiosInstance from "./axios-instance";

export const getGlobalLeaderboard = async (): Promise<any> => {
    const res = await axiosInstance.get(`/leaderboard/global`);
    return res.data;
};