import axiosInstance from "./axios-instance";

export const getUserProfile = async (): Promise<any> => {
    const res = await axiosInstance.get(`/profile/me`);
    return res.data;
};

export const getUserStats = async (): Promise<any> => {
    const res = await axiosInstance.get(`/profile/me/stats`);
    return res.data;
};

export const updateUserProfile = async (body: {
    full_name: string;
    phone: string;
    avatar?: string | null;
}): Promise<any> => {
    const formData = new FormData();

    formData.append("full_name", body.full_name);
    formData.append("phone", body.phone);

    if (body.avatar) {
        if (body.avatar.startsWith("file://")) {
            formData.append("avatar", {
                uri: body.avatar,
                name: "avatar.jpg",
                type: "image/jpeg",
            } as any);
        } else {
            formData.append("avatar", body.avatar);
        }
    }

    const res = await axiosInstance.put(
        "/profile/me",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
};
