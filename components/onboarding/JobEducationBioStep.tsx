import { UserProfile } from '@/lib/types'
import { Briefcase, Building2, GraduationCap, BookOpen, FileText } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import React from 'react'

interface JobEducationBioStepProps {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const JobEducationBioStep = ({ profile, updateProfile }: JobEducationBioStepProps) => {
  const handleChange = (field: keyof UserProfile['additionalInfo'], value: string) => {
    updateProfile({
      additionalInfo: {
        ...profile.additionalInfo,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Briefcase className="h-12 w-12 text-pink-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Tell us about yourself</h3>
        <p className="text-gray-600">Your career, education, and a short bio</p>
      </div>

      {/* Job Title & Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Briefcase className="h-4 w-4 text-gray-400" />
            Job Title
          </Label>
          <Input
            placeholder="Enter your job title"
            value={profile.additionalInfo.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            className="h-12 border-gray-300 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building2 className="h-4 w-4 text-gray-400" />
            Company
          </Label>
          <Input
            placeholder="Enter your company"
            value={profile.additionalInfo.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className="h-12 border-gray-300 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
          />
        </div>
      </div>

      {/* Education Level & University */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            Education Level
          </Label>
          <Input
            placeholder="e.g, Bachelor, Master"
            value={profile.additionalInfo.educationLevel}
            onChange={(e) => handleChange('educationLevel', e.target.value)}
            className="h-12 border-gray-300 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <BookOpen className="h-4 w-4 text-gray-400" />
            University / College
          </Label>
          <Input
            placeholder="Enter your university/college"
            value={profile.additionalInfo.university}
            onChange={(e) => handleChange('university', e.target.value)}
            className="h-12 border-gray-300 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
          />
        </div>
      </div>

      {/* Short Bio */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-gray-400" />
          Short Bio
        </Label>
        <Textarea
          placeholder="Write a short bio about yourself..."
          value={profile.additionalInfo.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          className="min-h-32 border-gray-300 focus:border-pink-400 focus:ring-pink-400 rounded-xl resize-none"
        />
        <p className="text-xs text-gray-400 text-right">
          {profile.additionalInfo.bio?.length || 0} characters
        </p>
      </div>
    </div>
  )
}

export default JobEducationBioStep