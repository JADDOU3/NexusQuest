// Custom hook for loading user avatar
// Replaces duplicate avatar loading logic across multiple pages

import { useState, useEffect } from 'react';
import { fetchUserAvatar } from '../utils';

export function useUserAvatar() {
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAvatar = async () => {
            setLoading(true);
            const avatar = await fetchUserAvatar();
            setAvatarImage(avatar);
            setLoading(false);
        };
        loadAvatar();
    }, []);

    return { avatarImage, loading };
}
