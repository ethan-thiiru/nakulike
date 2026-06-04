import { GENDER_OPTIONS, validationUtils } from '@/lib/common-utils'
import { UserProfile } from '@/lib/types'
import { Calendar, User, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { isType } from 'firebase/firestore/lite/pipelines'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface BasicInfoStepProps {
    profile:UserProfile
    updateProfile: (updates:Partial<UserProfile>) => void
}

const BasicInfoStep = ({profile,updateProfile}:BasicInfoStepProps) => {
  const [ageInput, setAgeInput] = useState<string>(profile.age ? String(profile.age) : '')

  useEffect(() => {
    setAgeInput(profile.age ? String(profile.age) : '')
  }, [profile.age])

  const parsedAge = ageInput.trim() ? NaN : Number.parseInt(ageInput, 10)
  const isTypedUnderage = !Number.isNaN(parsedAge) && parsedAge < 18;
  const isProfileAgeInvalid = !ageInput && !validationUtils.isValidAge(profile.age) && profile.age > 0

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <User className='h-12 w-12 text-blue-500 mx-auto mb-4' />
        <h3 className='text-xl font-bold text-gray-800 mb-2'>
          Let's get to know you
        </h3>
        <p className='text-gray-600'>
          Tell us a bit about yourself so we can personalize your experience.
        </p>

      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <Label htmlFor='name' 
          className='flex items-center space-x-2 text-gray-700 font-medium'
          >
            <User className='h-4 w-4 text-primary'/>
            <span>Full Name</span>
          </Label>

          <Input
          id='name'
          value={profile.name}
          type='text'
          onChange={(e) => updateProfile({ name: e.target.value })}
          placeholder='Enter your full name'
          className='border-gray-300 border-primary focus:ring-primary  rounded-xl h-12'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='age' 
          className='flex items-center space-x-2 text-gray-700 font-medium'
          >
            <Calendar className='h-4 w-4 text-primary'/>
            <span>Age</span>
          </Label>

          <Input
          id='age'
          type='number'
          min='18'
          max='100'
          value={ageInput}
          onChange={(e) => {
            setAgeInput(e.target.value)
          }}
          onBlur={() => {
            const value = ageInput.trim();
            if(value === '') {
              updateProfile({age:0})
              return;
            }

            const numValue = Number.parseInt(value, 10)
            if(validationUtils.isValidAge(numValue)) {
              updateProfile({age:numValue})
            } else {
              updateProfile({age:18})
              setAgeInput('18')
            }
          }}

          placeholder='Your age'
          className='border-gray-300 focus:border-primary focus:ring-primary rounded-xl h-12'
          />

          {isTypedUnderage && (
            <p className='text-sm text-red-500 mt-1'>You must be at least 18 years old.</p>
          )}
          {!isTypedUnderage && isProfileAgeInvalid && (
            <p className='text-sm text-red-500'>Must be 18 or older</p>
          )}
        </div>
        </div>


        <div className='space-y-2'>
          <Label className='flex items-center space-x-2 text-gray-700 font-medium'>
            <Users className='h-4 w-4 text-gray-900'/>
            <span>Gender</span>
          </Label>

          <Select 
          value={profile.gender} 
          onValueChange={(value) => updateProfile({ gender: value })}
          >
            <SelectTrigger className='w-full border-gray-300 focus:border-gray-300  rounded-xl h-12'>
              <SelectValue placeholder='Select your gender'/>
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

                <div className='space-y-2'>
          <Label htmlFor='phone' 
          className='flex items-center space-x-2 text-gray-700 font-medium'
          >
            <User className='h-4 w-4 text-primary'/>
            <span>Phone Number</span>
          </Label>

          <Input
          id='phone'
          value={profile.phone}
          type='tel'
          onChange={(e) => updateProfile({ phone: e.target.value })}
          placeholder='+254 701234567'
          className='border-gray-300 focus:border-primary focus:ring-primary  rounded-xl h-12'
          />

          {profile.phone && !validationUtils.isValidPhone(profile.phone) && (
            <p className='text-sm text-red-500'>Please enter a valid phone number.</p>
          )}
        </div>

    </div>
  )
}

export default BasicInfoStep