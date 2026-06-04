import { UserProfile } from '@/lib/types'
import { Heart } from 'lucide-react'
import React from 'react'
import { Badge } from '../ui/badge'
import { INTERESTS_OPTIONS } from '@/lib/common-utils'

interface InterestStepProps {
    profile: UserProfile
    updateProfile: (updates: Partial<UserProfile>) => void
}

const InterestStep = ({ profile, updateProfile }: InterestStepProps) => {
  const handleInterestToggle = (interest: string) => {
    const currentInterests = profile.interests;
    
    if (currentInterests.includes(interest)) {
      // If it's already selected, remove it
      updateProfile({ interests: currentInterests.filter((i) => i !== interest) });
    } else {
      // If it's not selected, only add it if we are under the limit of 8
      if (currentInterests.length < 8) {
        updateProfile({ interests: [...currentInterests, interest] });
      }
    }
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <Heart className='h-12 w-12 text-pink-500 mx-auto mb-4'/>
        <h3 className='text-xl font-bold text-gray-800 mb-2'>
          What are you passionate about?
        </h3>
        <p className='text-gray-600'>
          Select up to 8 interests that represent you
        </p>
      </div>

      {/* Added gap-3 here so the badges have spacing between them */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        {INTERESTS_OPTIONS.map((interest) => (
          <Badge
            key={interest.name}
            // Fixed the missing false condition in the ternary operator
            variant={profile.interests.includes(interest.name) ? 'default' : 'outline'}
            className={` w-full cursor-pointer p-6 text-center justify-center transition-all hover:scale-105 ${
              profile.interests.includes(interest.name) 
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white border-0' 
                : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
            }`}
            onClick={() => handleInterestToggle(interest.name)}
          >
            <span className='text-lg mr-2'>{interest.icon}</span>
            <span className='text-sm font-medium'>{interest.name}</span>
          </Badge>
        ))}
      </div>
      
      {/* Updated warning text to reflect the hard limit */}
      {profile.interests.length >= 8 && (
        <p className='text-amber-600 text-sm text-center font-medium'>
          You have reached the maximum of 8 interests.
        </p>
      )}
    </div>
  );
};

export default InterestStep;