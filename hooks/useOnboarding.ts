"use client";
import { ONBOARDING_CONSTANTS } from "@/lib/common-utils";
import { UserProfile } from "@/lib/types";
import { useEffect, useState } from "react";

export type { UserProfile };

const STEP_KEY = "onboarding_step";
const PROFILE_KEY = "onboarding_profile";

export const useOnboarding = (userId?: string) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    uid: "",
    name: "",
    age: 18,
    email: "",
    gender: "",
    phone: "",
    interests: [],
    height: "",
    weight: "",
    lookingFor: [],
    ageRange: [18, 35],
    drinking: "",
    smoking: "",
    workout: "",
    diet: "",
    pets: "",
    photos: [],
    location: {
      latitude: 0,
      longitude: 0,
      city: "",
      state: "",
      country: "",
      address: "",
    },
    additionalInfo: {
      jobTitle: "",
      company: "",
      educationLevel: "",
      university: "",
      bio: "",
    },
    isVerifiedProfile: false,
    profileComplete: false,
    isOnline: false,
  });

  useEffect(() => {
    const lastUserId = localStorage.getItem("last_onboarding_user_id");
    if (lastUserId && lastUserId !== userId) {
      localStorage.removeItem(STEP_KEY);
      localStorage.removeItem(PROFILE_KEY);
    }

    if (userId) {
      localStorage.setItem("last_onboarding_user_id", userId);
    }

    const savedStep = localStorage.getItem(STEP_KEY);
    const savedProfile = localStorage.getItem(PROFILE_KEY);

    if (savedStep) setCurrentStep(Number(savedStep));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, [userId]);

  const persist = (step: number, updatedProfile: UserProfile) => {
    localStorage.setItem(STEP_KEY, String(step));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
  };

  const updateProfile = (upadtes: Partial<UserProfile>) => {
    const updated = { ...profile, ...upadtes };
    setProfile(updated);
    persist(currentStep, updated);
  };

  const nextStep = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    persist(next, profile);
  };

  const prevStep = () => {
    const prev = currentStep - 1;
    setCurrentStep(prev);
    persist(prev, profile);
  };

  const gotoStep = (step: number) => {
    setCurrentStep(step);
    persist(step, profile);
  };

  const getStepCompletion = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          profile.name &&
          profile.age &&
          profile.gender &&
          profile.phone
        );
      case 2:
        return profile.interests.length > 0;
      case 3:
        return !!(
          profile.height &&
          profile.weight &&
          profile.lookingFor.length > 0
        );
      case 4:
        return !!(profile.drinking && profile.smoking && profile.workout);
      case 5:
        return !!(
          profile.location &&
          profile.location.latitude !== 0 &&
          profile.location.longitude !== 0 &&
          profile.location.city &&
          profile.location.address
        );
      case 6:
        return !!(
          profile.additionalInfo.jobTitle &&
          profile.additionalInfo.company &&
          profile.additionalInfo.educationLevel &&
          profile.additionalInfo.university &&
          profile.additionalInfo.bio
        );
      case 7:
        return profile.photos.length > 0;
      default:
        return false;
    }
  };

  const getOverallCompletion = (): number => {
    const completedStep = Array.from(
      { length: ONBOARDING_CONSTANTS.TOTAL_STEPS },
      (_, i) => i + 1,
    ).filter((step) => getStepCompletion(step)).length;
    return Math.round((completedStep / ONBOARDING_CONSTANTS.TOTAL_STEPS) * 100);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STEP_KEY);
    localStorage.removeItem(PROFILE_KEY);
  };

  return {
    currentStep,
    profile,
    nextStep,
    prevStep,
    gotoStep,
    updateProfile,
    getStepCompletion,
    getOverallCompletion,
    resetOnboarding,
  };
};
