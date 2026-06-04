import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateProfileCompletion, localStorageUtils, STORAGE_KEYS } from '@/lib/common-utils';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import { signOut } from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Briefcase, Camera, Cat, ChevronDown, ChevronLeft, ChevronRight, Cigarette, DessertIcon, DrumstickIcon, Dumbbell, Edit3, GraduationCap, Heart, LogOut, Mail, MessageCircle, Ruler, Weight, Wine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import EditProfileModal from '@/components/EditProfileModal';

interface ProfilePageProps {
  profile: UserProfile;
  onUpdate?: (updates: Partial<UserProfile>) => void;
  isOwnProfile?: boolean;
  onBack?: () => void;
  onStartChat?: () => void;
}

const ProfilePage = ({ profile, onUpdate, isOwnProfile, onBack, onStartChat }: ProfilePageProps) => {
  if (!profile) {
    return <Loader />;
  }
  const [showDetails, setShowDetails] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const router = useRouter();

  const handleEditField = (field: string) => {
    if (!isOwnProfile) return;
    setEditingField(field);
    setEditModalOpen(true)
  }

  const nextImage = () => {
    if (profile?.photos?.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    }
  }
  const prevImage = () => {
    if (profile.photos?.length) {
      setCurrentPhotoIndex((prev) => (prev + 1 + profile.photos.length) % profile.photos.length);
    }
  }

  const handlelogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userRef, {
            isOnline: false,
            lastSeen: serverTimestamp(),
          })
        } catch (error) {

        }
      }
      await signOut(auth);

      localStorageUtils.set(STORAGE_KEYS.ACTIVE_TAB, 'discovery')
      toast.success('you have been logged out successfully.');
      router.push('/login');
    } catch (error) {
      console.error('Error during logout', error);
      toast.error('Failed to logout, please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
      <div className='w-full max-w-sm'>
        {onBack && (
          <div className='mb-4'>
            <Button
              onClick={onBack}
              variant='ghost'
              className='text-white hover:bg-gray-800 p-2'
            >
              <ArrowLeft className='h-5 w-5 mr-2' />
              Back
            </Button>
          </div>
        )}

        <div className='relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl'>
          <div className='relative h-137.5'>
            {profile?.photos?.length > 0 && (
              <>
                <img
                  src={profile.photos[currentPhotoIndex]}
                  alt={profile.name}
                  className='w-full h-full object-cover'
                />
                {profile.photos?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className='absolute top-1/2 left-2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm'
                    >
                      <ChevronLeft className='h-5 w-5 text-white' />
                    </button>

                    <button
                      onClick={nextImage}
                      className='absolute top-1/2 right-2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm'
                    >
                      <ChevronRight className='h-5 w-5 text-white' />
                    </button>
                  </>
                )}

                <div className='absolute top-0 left-0 right-0 bg-gray-900 p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <h1 className='text-2xl font-bold text-white'>
                        {profile.name}
                      </h1>
                      <span className='text-xl text-white'>
                        {profile.age}
                      </span>
                      {profile.isVerifiedProfile && (
                        <img
                          src='/images/verify.png'
                          alt='verify'
                          className='h-6 w-6'
                        />
                      )}
                    </div>
                    {isOwnProfile && (
                      <div className='flex justify-end'>
                        <Button
                          onClick={handlelogout}
                          variant='outline'
                          className='bg-linear-to-r from-pink-500 to-red-500 text-white font-semibold py-2 rounded-full'
                        >
                          <LogOut className='h-5 w-5' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>

          <div className='p-4 space-y-3'>
            <div className='flex space-x-3'>
              <Button
                onClick={() => setShowDetails(!showDetails)}
                className='flex-1 bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 rounded-full '
              >
                {showDetails ? (
                  <>
                    <ChevronDown className='w-4 h-4 ml-2' />
                    Hide Profile
                  </>

                ) : (
                  <>
                    View Profile
                    <ChevronDown className='w-4 h-4 ml-2' />
                  </>
                )}
              </Button>

              {isOwnProfile ? (
                <Button
                  onClick={() => handleEditField('photos')}
                  variant='outline'
                  className='flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent py-3 rounded-full'
                >
                  <Camera />
                  Add Photos
                </Button>
              ) : (
                onStartChat && (
                  <Button
                    onClick={onStartChat}
                    variant='outline'
                    className='flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent py-3 rounded-full'
                  >
                    <MessageCircle className='h-5 w-5 mr-2' />
                    Message
                  </Button>
                )
              )}
            </div>

          </div>

        </div>

        {showDetails && (
          <div className='mt-4 space-y-4 animate-in slide-in-from-bottom-4 duration-300'>
            {isOwnProfile && (
              <div className='flex justify-center'>
                <Button
                  onClick={() => handleEditField('Profile')}
                  className='bg-white/10 hover:bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20'
                >
                  <Edit3 className='w-4 h-4 mr-2' />
                  Edit Profile ({calculateProfileCompletion(profile)}% complete)

                </Button>
              </div>
            )}

            <div className='bg-gray-900 p-4 rounded-xl transition-colors border border-gray-800'>
              <h3 className='text-lg font-semibold mb-3'>
                Account information
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <Mail className='w-5 h-5 text-gray-400' />
                  <span className='text-gray-300 text-sm'>
                    {profile.email || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio information */}
            <div
              className={`bg-gray-900 p-4 rounded-xl transition-colors border border-gray-800 ${isOwnProfile ? 'cursor-pointer hover:bg-gray-800' : ''}`}
              onClick={() => isOwnProfile && handleEditField('bio')}
            >
              <h3 className='text-lg font-semibold mb-3'>
                About {profile.name}
              </h3>
              <p className='text-gray-300 text-sm leading-relaxed'>
                {profile.additionalInfo?.bio || (isOwnProfile ? 'Tuambie kiasi kukuhusu' : 'This user has not added a bio yet')}
              </p>

            </div>

            {/* Job and Education */}
            <div className={`bg-gray-900 p-4 rounded-xl transition-colors border border-gray-800 ${isOwnProfile ? 'cursor-pointer hover:bg-gray-800' : ''}`}
              onClick={() => isOwnProfile && handleEditField('work')}
            >
              <h3 className='text-lg font-semibold mb-3'>
                Job & Education
              </h3>

              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <Briefcase className='w-5 h-5 text-gray-400' />
                  <span className='text-gray-300 text-sm'>
                    {profile.additionalInfo?.jobTitle || (isOwnProfile ? 'Tuambie kazi yako' : 'Not specified')}
                  </span>
                </div>

                <div className='flex items-center space-x-3'>
                  <GraduationCap className='w-5 h-5 text-gray-400' />
                  <span className='text-gray-300 text-sm'>
                    {profile.additionalInfo?.educationLevel || (isOwnProfile ? 'Tuambie umesoma mpaka wapi' : 'Not specified')}
                  </span>
                </div>

              </div>

            </div>

            {/* Interested */}
            <div className={`bg-gray-900 p-4 rounded-xl transition-colors border border-gray-800 ${isOwnProfile ? 'cursor-pointer hover:bg-gray-800' : ''}`}
              onClick={() => isOwnProfile && handleEditField('interests')}
            >
              <h3 className='text-lg font-semibold mb-3'>
                Interests
              </h3>
              {profile?.interests?.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {profile.interests.map((interest) => (
                    <Badge
                      key={interest}
                      className='bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs'
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-gray-400 text-sm'>
                  {isOwnProfile ? 'Tuambie mambo unayopenda ili watu waweze kukufahamu zaidi' : 'This user has not added any interests yet.'}
                </p>
              )}
            </div>

            {/* Lifestyle */}
            <div className={`bg-gray-900 p-4 rounded-xl transition-colors border border-gray-800 ${isOwnProfile ? 'cursor-pointer hover:bg-gray-800' : ''}`}
              onClick={() => isOwnProfile && handleEditField('lifestyle')}
            >
              <h3 className='text-lg font-semibold mb-3'>
                Lifestyle
              </h3>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Ruler className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      Height
                    </span>
                  </div>

                  <span className='text-gray-300 text-sm'>
                    {profile.height || (isOwnProfile ? 'Tuambie urefu wako' : 'Not specified')}
                  </span>
                </div>

                                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Weight className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      Weight
                    </span>
                  </div>

                  <span className='text-gray-300 text-sm'>
                    {profile.weight || (isOwnProfile ? 'Tuambie uzito wako' : 'Not specified')}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Dumbbell className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      Exercise
                    </span>
                  </div>

                  <span className='text-gray-300 text-sm'>
                    {profile.workout || (isOwnProfile ? 'Tuambie rutini yako ya tizi' : 'Not specified')}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Wine className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      Drinking Habits
                    </span>
                  </div>

                  <span className='text-gray-300 text-sm'>
                    {profile.drinking || (isOwnProfile ? 'Tuambie utaratibu wako wa kukunywa' : 'Not specified')}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Cigarette className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      Smoking Habits
                    </span>
                  </div>

                  <span className='text-gray-300 text-sm'>
                    {profile.smoking || (isOwnProfile ? 'Tuambie utaratibu wako wa kunywa sigara' : 'Not specified')}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <DrumstickIcon className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      Diet
                    </span>
                  </div>

                  <span className='text-gray-300 text-sm'>
                    {profile.diet || (isOwnProfile ? 'Tuambie utaratibu wako wa kula' : 'Not specified')}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Cat className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      Pets
                    </span>
                  </div>

                  <span className='text-gray-300 text-sm'>
                    {profile.pets || (isOwnProfile ? 'Tuambie mnyama unafuga' : 'Not specified')}
                  </span>
                </div>
              </div>

            </div>

            {/* Looking For */}
            <div className={`bg-gray-900 p-4 rounded-xl transition-colors border border-gray-800 
            ${isOwnProfile ? 'cursor-pointer hover:bg-gray-800' : ''
              }`}
              onClick={() => isOwnProfile && handleEditField('lookingFor')}
            >
              <h3 className='text-lg font-semibold mb-3'>
                Looking For
              </h3>
              {profile?.lookingFor?.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {profile.lookingFor.map((lf) => (
                    <Badge
                      key={lf}
                      className='bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs'
                    >
                      {lf}
                      <Heart className='w-3 h-3 text-pink-500' />
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-gray-400 text-sm'>
                  {isOwnProfile ? 'Add what you are looking for' : 'No specifications yet.'}
                </p>
              )}
            </div>
          </div>
        )}

                {isOwnProfile && onUpdate &&(
          <EditProfileModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            field={editingField}
            currentData={profile}
            onUpdate={onUpdate}
          />
        )}

      </div>
    </div>
  )
}

export default ProfilePage;