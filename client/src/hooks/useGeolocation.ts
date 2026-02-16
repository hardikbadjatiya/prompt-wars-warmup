import { useState, useEffect, useCallback } from 'react';
import type { LatLng } from '../types';

interface GeolocationState {
    position: LatLng | null;
    accuracy: number | null;
    heading: number | null;
    error: string | null;
    isTracking: boolean;
}

export function useGeolocation(): GeolocationState & { startTracking: () => void; stopTracking: () => void } {
    const [state, setState] = useState<GeolocationState>({
        position: null,
        accuracy: null,
        heading: null,
        error: null,
        isTracking: false,
    });

    const [watchId, setWatchId] = useState<number | null>(null);

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: 'Geolocation not supported' }));
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (pos) => {
                setState({
                    position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                    accuracy: pos.coords.accuracy,
                    heading: pos.coords.heading,
                    error: null,
                    isTracking: true,
                });
            },
            (err) => {
                setState(prev => ({ ...prev, error: err.message, isTracking: false }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000,
            }
        );

        setWatchId(id);
    }, []);

    const stopTracking = useCallback(() => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setState(prev => ({ ...prev, isTracking: false }));
        }
    }, [watchId]);

    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    return { ...state, startTracking, stopTracking };
}
