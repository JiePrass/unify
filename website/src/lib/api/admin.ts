/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";

/**
 * =========================
 * DASHBOARD
 * =========================
 */


// GET ALL DASHBOARD DATA
export const getDashboardData = async (year: number): Promise<any> => {
    const res = await axiosInstance.get("/admin", {
        params: { year },
    });
    return res.data;
};

/**
 * =========================
 * MISSIONS MANAGEMENT
 * =========================
 */

// CREATE MISSION
export const createMission = async (data: Record<string, any>): Promise<any> => {
    const res = await axiosInstance.post("/admin/missions", data);
    return res.data;
};

// GET ALL MISSIONS
export const getAllMissions = async (): Promise<any[]> => {
    const res = await axiosInstance.get("/admin/missions");
    return res.data;
};

// GET MISSION BY ID
export const getMissionById = async (id: number): Promise<any> => {
    const res = await axiosInstance.get(`/admin/missions/${id}`);
    return res.data;
};

// DELETE MISSION
export const deleteMission = async (id: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete(`/admin/missions/${id}`);
    return res.data;
};

/**
 * =========================
 * CANCEL EVENTS
 * =========================
 */

// GET CANCEL EVENTS (FILTERABLE)
export const getCancelHelpRequest = async (params?: {
    actor?: string;
    stage?: string;
    minViolationScore?: number;
    from?: string;
    to?: string;
    onlyPending: true,
}): Promise<any[]> => {
    const res = await axiosInstance.get("/admin/cancel-help", {
        params,
    });
    return res.data.data;
};

// GET CANCEL EVENT DETAIL
export const getCancelHelpRequestDetail = async (id: string): Promise<any> => {
    const res = await axiosInstance.get(`/admin/cancel-help/${id}`);
    return res.data.data;
};

// EXECUTE PENALTY
export const executeCancelHelpRequestPenalty = async (
    id: number,
    data?: {
        targetUserId?: number;
        notes?: string;
    }
): Promise<any> => {
    const res = await axiosInstance.post(
        `/admin/execute-penalty/${id}`,
        data
    );
    return res.data;
};

/**
 * =========================
 * BADGES
 * =========================
 */

// GET ALL BADGES
export const getAllBadges = async (): Promise<any> => {
    const res = await axiosInstance.get("/badges/");
    return res.data;
};

// EDIT BADGE
export const updateBadge = async (
    id: number,
    data: FormData
): Promise<any> => {
    const res = await axiosInstance.patch(`/badges/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    return res.data
}

// DELETE BADGE
export const deleteBadge = async (
    id: number
): Promise<{ message: string }> => {
    const res = await axiosInstance.delete(`/badges/${id}`);
    return res.data;
};

// CREATE BADGE
export const createBadge = async (
    data: FormData
): Promise<any> => {
    const res = await axiosInstance.post("/badges", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    return res.data
}
