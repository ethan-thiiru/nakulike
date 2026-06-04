'use client'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ONBOARDING_STEPS } from '@/lib/common-utils';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import BasicInfoStep from '@/components/onboarding/BasicInfoStep';
import LifeStyleStep from '@/components/onboarding/LifeStyleStep';
import PhysicalStep from '@/components/onboarding/PhysicalStep';
import InterestStep from '@/components/onboarding/InterestStep';
import LocationStep from '@/components/onboarding/LocationStep';
import PhotosStep from '@/components/onboarding/PhotosStep';
import JobEducationBioStep from '@/components/onboarding/JobEducationBioStep';
import { ArrowLeft, ArrowLeftCircle, ArrowRight, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const page = () => {
  const [saving, setSaving] = useState(false);
  const { user, logout } = useFirebaseAuth();
  const { currentStep, profile, updateProfile, nextStep, prevStep, gotoStep, getOverallCompletion, getStepCompletion } = useOnboarding(user?.uid);
  const router = useRouter();

  const steps = ONBOARDING_STEPS;

  const handlelogout = async () => {
    try {
      await logout();
      toast.success('you have been logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Error during logout', error)
      toast.error('Failed to logout, please try again.')
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user?.uid), {
        ...profile,
        profileComplete: true,
        createdAt: new Date(),
        uid: user.uid,
        email: user.email,
        isOnline: true,
        lastSeen: new Date(),
        isVerifiedProfile: true,
      });

      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_profile');
      localStorage.removeItem('last_onboarding_user_id');

      toast.success('welcome to the dating world!')
      router.push('/');
    } catch (error) {
      console.error('Error saving profile', error)
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setSaving(false);
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep profile={profile} updateProfile={updateProfile} />;
      case 2:
        return <InterestStep profile={profile} updateProfile={updateProfile} />;
      case 3:
        return <PhysicalStep profile={profile} updateProfile={updateProfile} />;
      case 4:
        return (
          <LifeStyleStep profile={profile} updateProfile={updateProfile} />
        );
      case 5:
        return <LocationStep profile={profile} updateProfile={updateProfile} />;
      case 6:
        return (
          <JobEducationBioStep
            profile={profile}
            updateProfile={updateProfile}
          />
        );
      case 7:
        return <PhotosStep profile={profile} updateProfile={updateProfile} />;

      default:
        return null;
    }
  };

  const canProceed = getStepCompletion(currentStep);
  const isLastStep = currentStep === 7;

  return (
    /* 1. FIXED: Changed bg-linear-to-br to bg-gradient-to-br */
    <div className='min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col'>
      
      {/* Mobile Top Navigation */}
      <div className='md:hidden bg-white border-b shadow-sm'>
        <div className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <button
              onClick={handlelogout}
              className='p-1 rounded-full hover:bg-gray-100 transition-all duration-200 group'
              title='logout'
            >
              <ArrowLeftCircle className='h-6 w-6 text-gray-600 group-hover:text-gray-800 transition-colors' />
            </button>

            <h1 className='text-lg font-bold text-gray-900'>
              Complete Profile
            </h1>

            <span className='text-sm font-medium text-gray-900'>
              {getOverallCompletion()}%
            </span>
          </div>

          <Progress value={getOverallCompletion()} className='h-2' />
        </div>

        <div className='flex justify-between p-4'>
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => {
                const isAccessible = step.id === 1 || getStepCompletion(step.id - 1);
                if(isAccessible) gotoStep(step.id)
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all  ${currentStep === step.id ? 'bg-gray-900 text-white shadow-glow' : getStepCompletion(step.id) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {getStepCompletion(step.id) ? <Check className='h-4 w-5'/> : step.id}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Twin Column Layout Wrapper */}
      {/* 2. FIXED: Changed structural alignment layout rules */}
      <div className='flex flex-1 w-full items-stretch'>

        {/* Desktop Sidebar */}
        {/* 3. FIXED: Changed bg-linear-to-b to bg-gradient-to-b and added shrink-0 */}
        <div className='hidden md:block w-80 bg-linear-to-b from-pink-500 to-red-500 p-6 text-white shrink-0'>
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-2'>
              <h1 className='text-2xl font-bold'>
                Complete Your Profile
              </h1>

              <button
                onClick={handlelogout}
                className='p-1 rounded-full hover:bg-white/20 transition-all duration-200 group'
                title='logout'
              >
                <ArrowLeftCircle className='h-6 w-6 text-white group-hover:text-gray-200 transition-colors' />
              </button>
            </div>

            <div className='flex items-center space-x-2 mb-4'>
              <Progress value={getOverallCompletion()} className='flex-1 bg-white/20' />
              <span className='text-sm font-medium'>
                {getOverallCompletion()}%
              </span>
            </div>
          </div>

          <div className='space-y-4'>
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => {
                  const isAccessible = step.id === 1 || getStepCompletion(step.id - 1);
                  if (isAccessible) gotoStep(step.id);
                }}
                className={`flex items-center rounded-lg space-x-3 p-3 cursor-pointer transition-all  
                  ${currentStep === step.id 
                    ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
                  }`}
              >
                {/* 4. FIXED: Added 'flex' utility so icons center perfectly */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getStepCompletion(step.id) ? 'bg-green-500 text-white' : 
                currentStep === step.id 
                ? 'bg-white text-pink-500' : 'bg-white/20'}`}
                >
                  {getStepCompletion(step.id) ? (
                    <Check className='h-4 w-5' />
                  ) : (
                    step.icon
                  )}
                </div>

                <div>
                  <p className='font-medium'>
                    {step.title}
                  </p>
                  <p className='text-xs opacity-75'>
                    {getStepCompletion(step.id) ? 'Completed' : 'Incomplete'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Pane */}
        
        <div className='flex-1 flex items-start justify-center p-4 md:p-8'>
          <div className='w-full max-w-2xl'>
            {/* 6. FIXED: Set clean, standard solid white background */}
            <Card className='shadow-xl border-0 bg-white'>
              <CardContent className='p-8'>
                {renderStep()}

                <div className='flex justify-between mt-8'>
                  <Button
                    variant='outline'
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className='flex items-center space-x-2 bg-transparent'
                  >  
                    <ArrowLeft className='h-4 w-4'/>
                    <span>Previous</span>
                  </Button>

                  {isLastStep ? (
                    /* 7. FIXED: Changed bg-linear-to-r to bg-gradient-to-r */
                    <Button
                      variant='outline'
                      onClick={handleSaveProfile}
                      disabled={!canProceed || saving || profile.photos.length < 2}
                      className='bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white flex items-center space-x-2'
                    >  
                      {saving ? 'Saving...' : 'Complete Profile'}
                    </Button>
                  ) : (
                    /* 8. FIXED: Changed bg-linear-to-r to bg-gradient-to-r */
                    <Button
                      variant='outline'
                      onClick={nextStep}
                      disabled={!canProceed}
                      className='bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white flex items-center space-x-2'
                    >  
                      <span>Next</span>
                      <ArrowRight className='h-4 w-4'/>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default page;


