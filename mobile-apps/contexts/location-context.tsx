import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

interface LocationContextType {
    location: { latitude: number; longitude: number } | null;
    loading: boolean;
    error: string | null;
    refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
    location: null,
    loading: true,
    error: null,
    refreshLocation: async () => { },
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshLocation = async () => {
        setLoading(true);
        setError(null);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Permission to access location was denied");
                setLoading(false);
                return;
            }

            // High accuracy for better results, but might be slower. 
            // Balanced usage:
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        } catch (err) {
            console.log("Error fetching location:", err);
            setError("Failed to fetch location");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshLocation();
    }, []);

    return (
        <LocationContext.Provider value={{ location, loading, error, refreshLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
