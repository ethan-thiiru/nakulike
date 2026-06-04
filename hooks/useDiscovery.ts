'use client'

import { User } from "firebase/auth";
import { UserProfile } from "./useOnboarding";
import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, getDocs, limit, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateDistance, CHAT_ACTIONS, GENDER_FILTERS } from "@/lib/common-utils";

export const useDiscovery = (user: User) => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
    const [myMatches, setMyMatches] = useState<UserProfile[]>([]);
    const [whoLikedMe, setWhoLikedMe] = useState<UserProfile[]>([]);

    const loadCurrentUser = useCallback(async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', user?.uid));
            if (userDoc.exists()) {
                setCurrentUser(userDoc.data() as UserProfile);
            }
        } catch (error) {
            console.error('Error loading current user profile:', error);
        }
    }, [user?.uid])

    const getInteractedUserIds = async (userId: string): Promise<string[]> => {
        try {
            const interactionsQuery = query(
                collection(db, 'interactions'),
                where('userId', '==', userId),
                where('action', 'in', ['like', 'dislike', 'superlike'])
            )

            const snapshot = await getDocs(interactionsQuery);
            const interactedIds = snapshot.docs.map((doc) => doc.data().targetUserId);
            return interactedIds;
        } catch (error) {
            console.error('Error fetching interacted user IDs', error);
            return [];
        }
    }

    // load profiles for discovery
    const loadProfiles = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);

        try {
            const interactedUserIds = await getInteractedUserIds(user?.uid)
            const excludedIds = [...interactedUserIds, user?.uid];

            const genderFilter = [...(GENDER_FILTERS[currentUser.gender as keyof typeof GENDER_FILTERS] || GENDER_FILTERS.default)]
            const usersQuery = query(
                collection(db, 'users'),
                where('profileComplete', '==', true),
                where('gender', 'in', genderFilter),
                where('age', '>=', currentUser.ageRange[0]),
                where('age', '<=', currentUser.ageRange[1]),
                limit(50)
            )

            const snapshot = await getDocs(usersQuery);

            // FIX: Build the full filtered+distance array FIRST, then use its
            // length to decide maxDistance — instead of using snapshot.docs.length
            // (which was always up to 50, forcing a 50 km cap and filtering
            // everyone out when you had 10+ raw results).
            const profilesWithDistance = snapshot.docs
                .map((doc) => ({ ...doc.data(), uid: doc.id }) as UserProfile)
                .filter((profile) => !excludedIds.includes(profile.uid))
                .filter((profile) => {
                    // Drop profiles (or current user) with missing location data
                    if (!profile.location?.latitude || !profile.location?.longitude) return false;
                    if (!currentUser.location?.latitude || !currentUser.location?.longitude) return false;
                    return true;
                })
                .map((profile) => {
                    const distance = calculateDistance(
                        currentUser.location.latitude,
                        currentUser.location.longitude,
                        profile.location.latitude,
                        profile.location.longitude
                    )
                    return { ...profile, distance }
                });

            // Now that we know the real count, pick a sensible maxDistance
            const totalProfiles = profilesWithDistance.length;
            let maxDistance = 100;

            if (totalProfiles < 5) {
                maxDistance = 20000;   // very few candidates → show everyone worldwide
            } else if (totalProfiles < 10) {
                maxDistance = 10000;
            } else if (totalProfiles < 50) {
                maxDistance = 5000;
            }

            const potentialProfiles = profilesWithDistance
                .filter((profile) => profile.distance <= maxDistance)
                .sort((a, b) => (a.distance || 0) - (b.distance || 0))
                .slice(0, 50);

            setProfiles(potentialProfiles);
        } catch (error) {
            console.error('Error loading discovery profiles:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, user?.uid])

    const loadWhoLikesMe = useCallback(async () => {
        try {
            const likedMeQuery = query(
                collection(db, 'interactions'),
                where('targetUserId', '==', user.uid),
                where('action', 'in', ['like', 'superlike']),
                where('status', '==', 'pending')
            )

            const snapshot = await getDocs(likedMeQuery);
            const userIds = snapshot.docs.map((doc) => doc.data().userId);

            const profiles = await Promise.all(
                userIds.map(async (likedId) => {
                    const likerDoc = await getDoc(doc(db, 'users', likedId));
                    if (!likerDoc.exists()) return null;
                    return { ...likerDoc.data(), uid: likerDoc.id } as UserProfile;
                })
            )

            setWhoLikedMe(profiles.filter(Boolean) as UserProfile[]);
        } catch (error) {
            console.error('Error loading who liked me:', error);
        }
    }, [user?.uid])

    const loadMyMatches = useCallback(async () => {
        try {
            const matchesQuery = query(
                collection(db, 'interactions'),
                where('userId', '==', user.uid),
                where('status', '==', 'matched')
            )

            const snapshot = await getDocs(matchesQuery);
            const userIds = snapshot.docs.map((doc) => doc.data().targetUserId);

            const profiles = await Promise.all(
                userIds.map(async (matchId) => {
                    const matchDoc = await getDoc(doc(db, 'users', matchId));
                    if (!matchDoc.exists()) return null;
                    return { ...matchDoc.data(), uid: matchDoc.id } as UserProfile;
                })
            )

            setMyMatches(profiles.filter(Boolean) as UserProfile[]);
        } catch (error) {
            console.error('Error loading my matches:', error);
        }
    }, [user?.uid])

    const handleSwipeAction = async (
        profile: UserProfile,
        action: 'like' | 'dislike' | 'superlike'
    ): Promise<boolean> => {
        try {
            // FIX 1: Spelled 'interactions' properly here
            const existingInteractionQuery = query(
                collection(db, 'interactions'),
                where('userId', '==', user.uid),
                where('targetUserId', '==', profile.uid) 
            )
            const existingInteractionSnapshot = await getDocs(existingInteractionQuery);
            
            // FIX 2: Added '!' so it runs correctly when an interaction *does* exist
            if (!existingInteractionSnapshot.empty) {
                const existingDoc = existingInteractionSnapshot.docs[0];
                const existingData = existingDoc.data();

                // if already matched don't create new entry
                if (existingData.status === 'matched') {
                    setProfiles((prev) => prev.filter((p) => p.uid !== profile.uid));
                    return true;
                }
                
                // if interaction exists but matched not, update instead of creating new one
                await updateDoc(existingDoc.ref, {
                    action,
                    status: action === 'dislike' ? 'rejected' : 'pending',
                    createdAt: Timestamp.now(),
                })
            } else {
                await addDoc(collection(db, 'interactions'), {
                    userId: user.uid,
                    targetUserId: profile.uid,
                    action,
                    status: action === "dislike" ? 'rejected' : 'pending',
                    createdAt: Timestamp.now(),
                })
            }

            setProfiles((prev) => prev.filter((p) => p.uid !== profile.uid));
            
            if (action === 'like' || action === 'superlike') {
                const otherUserLikesQuery = query(
                    collection(db, 'interactions'),
                    where('userId', '==', profile.uid),
                    where('targetUserId', '==', user.uid),
                    where('action', 'in', CHAT_ACTIONS),
                    where('status', '==', 'pending')
                )
                const likesSnapshot = await getDocs(otherUserLikesQuery);

                if (!likesSnapshot.empty) {
                    const otherUserDoc = likesSnapshot.docs[0];
                    await updateDoc(otherUserDoc.ref, { status: 'matched' });

                    const currentUserQuery = query(
                        collection(db, 'interactions'),
                        where('userId', '==', user.uid),
                        where('targetUserId', '==', profile.uid),
                        where('action', 'in', CHAT_ACTIONS),
                    )

                    const currentUserSnapshot = await getDocs(currentUserQuery);
                    if (!currentUserSnapshot.empty) {
                        await updateDoc(currentUserSnapshot.docs[0].ref, { status: 'matched' });
                    }

                    setMatchedUser(profile);
                    loadMyMatches();
                    loadWhoLikesMe();
                }
            }

            return true;
        } catch (error) {
            // FIX 3: Extracted error variable cleanly from the string 
            console.error('Error handling swipe action:', error);
            return false;
        }
    }

    useEffect(() => {
        loadCurrentUser();
    }, [loadCurrentUser])

    useEffect(() => {
        if (currentUser) {
            loadProfiles();
            loadMyMatches();
            loadWhoLikesMe();
        }
    }, [currentUser, loadProfiles, loadMyMatches, loadWhoLikesMe])

    return {
        profiles,
        currentUser,
        loading,
        matchedUser,
        myMatches,
        whoLikedMe,
        loadProfiles,
        handleSwipeAction,
        setMatchedUser,
        loadWhoLikesMe,
        loadMyMatches,
    }
};