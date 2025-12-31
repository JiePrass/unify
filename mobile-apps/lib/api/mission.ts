import axiosInstance from './axios-instance';

export const getUserMissions = async (): Promise<any> => {
    const res = await axiosInstance.get(`/missions/`);
    return res.data;
};

export const getMissionById = async (missionId: number): Promise<any> => {
    const res = await axiosInstance.get(`/missions/${missionId}`)
    return res.data;
}