import axiosInstance from "./axios-instance";

/**
 * =======================================
 * HELP REQUEST — MEMINTA BANTUAN
 * =======================================
 */

// CREATE HELP REQUEST
export const createHelpRequest = async (data: Record<string, any>): Promise<any> => {
    const res = await axiosInstance.post("/help", data);
    return res.data;
};

// GET NEARBY HELP REQUESTS
export const getNearbyHelpRequests = async (params: {
    latitude: number;
    longitude: number;
    radius?: number;
}): Promise<any> => {
    const res = await axiosInstance.get('/help/nearby', {
        params: {
            latitude: params.latitude,
            longitude: params.longitude,
            radius: params.radius ?? 5000,
        },
    });

    return res.data;
};

// GET HELP REQUEST DETAIL
export const getHelpRequestById = async (id: number | string): Promise<any> => {
    const res = await axiosInstance.get(`/help/${id}`);
    return res.data;
};

// GET MY ACTIVE HELP REQUEST
export const getMyActiveHelp = async (params: {
    latitude: number;
    longitude: number;
    radius?: number;
}): Promise<any> => {
    const res = await axiosInstance.get('/help/active', {
        params: {
            latitude: params.latitude,
            longitude: params.longitude,
            radius: params.radius ?? 5000,
        },
    });

    return res.data;
};

// DELETE HELP REQUEST (SOFT DELETE)
export const deleteHelpRequest = async (id: number | string): Promise<any> => {
    const res = await axiosInstance.delete(`/help/${id}`);
    return res.data;
};

/**
 * =======================================
 * HELP ASSIGNMENT — RELAWAN
 * =======================================
 */

// TAKE HELP REQUEST
export const takeHelpRequest = async (helpRequestId: number | string): Promise<any> => {
    const res = await axiosInstance.post(`/help/${helpRequestId}/take`);
    return res.data;
};

// CONFIRM HELPER
export const confirmHelper = async (
    helpRequestId: number | string,
    assignmentId: number | string
): Promise<any> => {
    const res = await axiosInstance.post(
        `/help/${helpRequestId}/confirm/${assignmentId}`
    );
    return res.data;
};

// CANCEL HELP REQUEST
export const cancelHelpRequest = async (
    helpRequestId: number | string,
    data?: Record<string, any>
): Promise<any> => {
    const res = await axiosInstance.post(`/help/${helpRequestId}/cancel`, data);
    return res.data;
};

/**
 * =======================================
 * HELP STATUS — STATUS AKHIR
 * =======================================
 */

// MARK COMPLETED
export const markHelpCompleted = async (
    assignmentId: number | string
): Promise<any> => {
    const res = await axiosInstance.post(
        `/help/assignment/${assignmentId}/complete`
    );
    return res.data;
};

// MARK FAILED
export const markHelpFailed = async (
    assignmentId: number | string,
    data?: Record<string, any>
): Promise<any> => {
    const res = await axiosInstance.post(
        `/help/assignment/${assignmentId}/failed`,
        data
    );
    return res.data;
};