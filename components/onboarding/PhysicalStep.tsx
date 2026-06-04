import { generateHeightOptions, generateWeightOptions, LOOKING_FOR_OPTIONS, ONBOARDING_CONSTANTS } from '@/lib/common-utils'
import { UserProfile } from '@/lib/types'
import React, { useEffect, useState } from 'react'
import { Label } from '../ui/label'
import { Ruler, Search, Weight, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'


interface PhysicalStepProps {
    profile:UserProfile
    updateProfile: (updates:Partial<UserProfile>) => void
}

const PhysicalStep = ({profile,updateProfile}:PhysicalStepProps) => {
  const[minAge,setMinAge] = useState(profile.ageRange?. [0] ?? ONBOARDING_CONSTANTS.DEFAULT_AGE_MIN)
  const[maxAge,setMaxAge] = useState(profile.ageRange?. [1] ?? ONBOARDING_CONSTANTS.DEFAULT_AGE_MAX)

  useEffect(() => {
    setMinAge(profile.ageRange?. [0] ?? ONBOARDING_CONSTANTS.DEFAULT_AGE_MIN)
    setMaxAge(profile.ageRange?. [1] ?? ONBOARDING_CONSTANTS.DEFAULT_AGE_MAX)
  }, [profile.ageRange])

  const handleBlur = () => {
    const validMin = Math.max(ONBOARDING_CONSTANTS.MIN_AGE, minAge || ONBOARDING_CONSTANTS.MIN_AGE)
    const validMax = Math.max(validMin, maxAge || validMin + 1)

    setMinAge(validMin)
    setMaxAge(validMax)

    updateProfile({ ageRange: [validMin, validMax] })
  }

  const handleLookingForToggle = (value: string) => {
    const current = profile.lookingFor;
    const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateProfile({ lookingFor: updated });
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <Label className='flex items-center space-x-2 text-gray-700'>
            <Ruler className='h-4 w-4 text-pink-600' />
            <span>Height</span>
          </Label>

          <Select value={profile.height} onValueChange={(value) => updateProfile({ height: value })}>
            <SelectTrigger className='w-full border-gray-300 focus:border-pink-500'>
              <SelectValue placeholder="Select your height" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {generateHeightOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      

        <div className='space-y-2'>
          <Label className='flex items-center space-x-2 text-gray-700'>
            <Weight className='h-4 w-4 text-pink-600' />
            <span>Weight</span>
          </Label>

          <Select value={profile.weight} onValueChange={(value) => updateProfile({ weight: value })}>
            <SelectTrigger className='w-full border-gray-300 focus:border-pink-500'>
              <SelectValue placeholder="Select your weight" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {generateWeightOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>

        <div className='space-y-4'>
          <Label className='flex items-center space-x-2 text-gray-700'>
            <Search className='h-4 w-4 text-pink-600' />
            <span>What are you looking for</span>
          </Label>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {LOOKING_FOR_OPTIONS.map((option) => (
          <Badge
            key={option.value}
            // Fixed the missing false condition in the ternary operator
            variant={profile.lookingFor.includes(option.value) ? 'default' : 'outline'}
            className={` w-full cursor-pointer p-6 text-center justify-center transition-all hover:scale-105 ${
              profile.lookingFor.includes(option.value) 
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white border-0' 
                : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
            }`}
            onClick={() => handleLookingForToggle(option.value)}
          >
            <span className='text-lg mr-2'>{option.icon}</span>
            <span className='text-sm font-medium'>{option.value}</span>
          </Badge>
        ))}
          </div>
        </div>

        <div className='space-y-4'>
          <Label className='flex items-center space-x-2 text-gray-700'>
            <Calendar className='h-4 w-4 text-pink-600'/>
            <span>Age Range Preference</span>
          </Label>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm text-gray-600'>Min Age</Label>
              <Input
              type='number'
              min='18'
              max='100'
              value={minAge === 0 ? '' : minAge}
              onChange={(e) => {
                const val = e.target.value;
                setMinAge(val === '' ? 0 : parseInt(val))
              }}
              onBlur={handleBlur}
              className='border-gray-300 focus:border-pink-500 '
              />
            </div>

            <div>
              <Label className='text-sm text-gray-600'>Max Age</Label>
              <Input
              type='number'
              min='18'
              max='100'
              value={maxAge === 0 ? '' : maxAge}
              onChange={(e) => {
                const val = e.target.value;
                setMaxAge(val === '' ? 0 : parseInt(val))
              }}
              onBlur={handleBlur}
              className='border-gray-300 focus:border-pink-500 '
              />
            </div>
          </div>
        </div>
    </div>
  );
};

export default PhysicalStep;