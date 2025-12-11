import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn("Gagal mengambil token:", error);
  }
  return config;
});

export default axiosInstance;