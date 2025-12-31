import axiosInstance from "./axios-instance";

/**
 * GET ALL NOTIFICATIONS
 */
export const getNotifications = async (): Promise<any> => {
    const res = await axiosInstance.get("/notifications");
    return res.data;
};

/**
 * MARK NOTIFICATION AS READ
 */
export const markNotificationRead = async (id: number): Promise<any> => {
    const res = await axiosInstance.patch(`/notifications/${id}/read`);
    return res.data;
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 */
export const markAllNotificationsRead = async (): Promise<any> => {
    const res = await axiosInstance.patch("/notifications/read-all");
    return res.data;
};

/**
 * DELETE NOTIFICATION
 */
export const deleteNotification = async (id: number): Promise<any> => {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    return res.data;
};
