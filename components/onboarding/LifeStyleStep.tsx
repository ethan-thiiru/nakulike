import { UserProfile } from '@/lib/types'
import { Cigarette, Dumbbell, Heart, Utensils, Wine } from 'lucide-react'
import React from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DIET_OPTIONS, DRINKING_OPTIONS, PETS_OPTIONS, SMOKING_OPTIONS, WORKOUT_OPTIONS } from '@/lib/common-utils'


interface LifestyleStepProps {
    profile:UserProfile
    updateProfile: (updates:Partial<UserProfile>) => void
}

const LifeStyleStep = ({profile,updateProfile}:LifestyleStepProps) => {
  return (
        <div className='space-y-6'>
          <div className='text-center'>
            <Heart className='h-12 w-12 text-pink-500 mx-auto mb-4'/>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>
              Tell us about your lifestyle
            </h3>
            <p className='text-gray-600'>
              This will help us match you with compatible people
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <LifestyleSelect
              label='Drinking'
              icon={<Wine className='h-4 w-4 text-pink-500'/>}
              placeholder='Select drinking habits'
              options={DRINKING_OPTIONS}
              value={profile.drinking}
              onChange={(value) => updateProfile({drinking:value})}
            />

            <LifestyleSelect
              label='Smoking'
              icon={<Cigarette className='h-4 w-4 text-pink-500'/>}
              placeholder='Select smoking habits'
              options={SMOKING_OPTIONS}
              value={profile.smoking}
              onChange={(value) => updateProfile({smoking:value})}
            />

            <LifestyleSelect
              label='Workout'
              icon={<Dumbbell className='h-4 w-4 text-pink-500'/>}
              placeholder='Select workout habits'
              options={WORKOUT_OPTIONS}
              value={profile.workout}
              onChange={(value) => updateProfile({workout:value})}
            />

            <LifestyleSelect
              label='diet'
              icon={<Utensils className='h-4 w-4 text-pink-500'/>}
              placeholder='Select diet preferrence'
              options={DIET_OPTIONS}
              value={profile.diet}
              onChange={(value) => updateProfile({diet:value})}
            />
            <LifestyleSelect
              label='pets'
              icon={<Heart className='h-4 w-4 text-pink-500'/>}
              placeholder='Do you have pets'
              options={PETS_OPTIONS}
              value={profile.pets}
              onChange={(value) => updateProfile({pets:value})}
              className='md:col-span-2'
            />
          </div>
          </div>
  )
}

interface LifestyleSelectProps {
  label: string
  icon: React.ReactNode
  placeholder: string
  options: { label: string, value: string, icon: string }[]
  onChange: (value: string) => void
  className?: string
  value?: string
}

function LifestyleSelect({ label, icon, placeholder, options, onChange, className, value }: LifestyleSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className='flex items-center space-x-2 text-gray-700'>
        {icon}
        <span>{label}</span>
      </Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='w-full border-gray-300 focus:border-pink-500'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className='bg-white'>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className='flex items-center space-x-2'>
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}


export default LifeStyleStep