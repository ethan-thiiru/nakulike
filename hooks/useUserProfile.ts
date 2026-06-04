'use client'

import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { UserProfile } from '@/lib/types'
import { useState, useEffect, useCallback } from 'react'

interface UserProfileResult {
    profile: UserProfile | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export function useUserProfile(userId: string): UserProfileResult {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            setLoading(true);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const userRef = doc(db,"users", userId);

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const profileData = snapshot.data() as UserProfile;

                if(profileData.profileComplete){
                    const profilewithUid = {
                        ...profileData,
                        uid: userId
                    }
                    setProfile(profilewithUid);
                    setError(null);
                }else{
                    setProfile(null);
                    setError(null);
                }
                    }else{
                        setProfile(null);
                        setError(null);
                    }
                    setLoading(false);
                }, (err) => {
                    console.error("Error fetching user profile:", err);
                    setError(err.message);
                    setProfile(null);
                    setLoading(false);
                }
            )

            return () => unsubscribe();
        }, [userId]);

    const refresh = useCallback(async () => {
        //Real-time listener handles updates, no action needed here
    }, [])
    
    return { profile, loading, error, refresh }
}


