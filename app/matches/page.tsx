import { useDiscovery } from '@/hooks/useDiscovery'
import { UserProfile } from '@/lib/types'
import { User } from 'firebase/auth'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import ProfilePage from '../profile/page'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart, MessageCircle, UserIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PLACEHOLDERS } from '@/lib/common-utils'
import { Button } from '@/components/ui/button'
import { getOrCreateConversation } from '@/hooks/firebase-chat'


interface MatchesPageProps {
  user: User
  onSelectMatch: () => void
}

const MatchesPage = ({ user, onSelectMatch }: MatchesPageProps) => {
  const { myMatches, whoLikedMe, loading, handleSwipeAction } = useDiscovery(user);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const handleStartChat = async (matchedUser: UserProfile) => {
    setStartingChat(matchedUser.uid);
    try {
      await getOrCreateConversation(user?.uid, matchedUser.uid);
      onSelectMatch();
    } catch (error) {
      console.error('Error starting chat', error)
    }finally{
      setStartingChat(null);
    }
  };

  const handleLikeBack = async (profile: UserProfile) => {
    const success = await handleSwipeAction(profile, 'like')
    if (success) {
      toast.success('Liked back successfully')
    }
  }

  const handleViewProfile = (profile: UserProfile) => {
    setViewingProfile(profile)
  }

  const handleBackFromProfile = () => {
    setViewingProfile(null)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-pink-50 to-red-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500' />
      </div>
    );
  }

  if (viewingProfile) {
    return (
      <ProfilePage
        profile={viewingProfile}
        isOwnProfile={false}
        onBack={handleBackFromProfile}
        onStartChat={() => {
          handleStartChat(viewingProfile);
          setViewingProfile(null);
        }}
      />
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-pink-50 to-red-50'>
      {/* Header */}
      <div className='bg-white/20 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10'>
        <div className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-linear-to-r from-pink-600 to-red-600 bg-clip-text text-transparent'>
                Your Matches
              </h1>
              <p className='text-gray-600 mt-1'>
                Connect with people who liked you
              </p>
            </div>

            <div className='flex gap-2'>
              <Badge
                variant='secondary'
                className='bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold'
              >
                {whoLikedMe.length} likes
              </Badge>

              <Badge
                variant='secondary'
                className='bg-linear-to-r from-pink-500 to-red-500 text-white px-4 py-2 text-sm font-semibold'
              >
                {myMatches.length} matches
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Who Liked Me */}
      <div className='p-6 space-y-8'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center'>
            <Eye className='h-5 w-5 text-purple-600' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-gray-800'>
              See Who Likes Me
            </h2>
            <p className='text-gray-600'>
              People who swiped right on you
            </p>
          </div>
        </div>

        {whoLikedMe.length === 0 ? (
          <Card className='bg-white/60 backdrop-blur-sm border-purple-200 shadow-lg'>
            <CardContent className='flex flex-col items-center justify-center p-12 text-center'>
              <div className='w-20 h-20 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6'>
                <Eye className='h-10 w-10 text-purple-500' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                No one has liked you yet
              </h3>
              <p className='text-gray-600 max-w-md'>
                Keep swiping! When someone likes you, you'll see them here.
              </p>
            </CardContent>
          </Card>
        ) : (
          // FIX #3: grid grid4 → grid grid-cols-1, added gap-6
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {whoLikedMe.map((profile) => (
              <Card
                key={profile.uid}
                className='hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-purple-200 hover:border-purple-300 hover:scale-105 group'
              >
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='relative'>
                      <Avatar className='w-32 h-32 border-4 border-white shadow-lg'>
                        <AvatarImage
                          src={profile.photos?.[0] || PLACEHOLDERS.AVATAR_LARGE}
                          alt={profile.name}
                          className='object-cover'
                        />
                        <AvatarFallback className='bg-linear-to-br from-purple-400 to-pink-400 text-white text-2xl font-semibold'>
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {profile.isOnline && (
                        <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full' />
                      )}
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-center space-x-2'>
                        <h3 className='font-bold text-xl text-gray-800'>
                          {profile.name}
                        </h3>
                        {/* FIX #2: added className= to span */}
                        <span className='text-gray-500 font-medium text-lg'>
                          {profile.age}
                        </span>
                      </div>
                      {/* FIX #4: txt-sm → text-sm */}
                      <p className='text-sm text-gray-600'>
                        {profile.location.city}
                      </p>
                    </div>

                    <div className='bg-linear-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200 w-full'>
                      <p className='text-sm text-purple-600 font-medium'>
                        💙 {profile.name} liked you!
                      </p>
                    </div>

                    <div className='flex items-center justify-center space-x-3 w-full'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent'
                        onClick={() => handleViewProfile(profile)}
                      >
                        <UserIcon className='h-4 w-4 mr-2' />
                        View Profile
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        onClick={() => handleLikeBack(profile)}
                      >
                        <Heart className='h-4 w-4 mr-2' />
                        Like Back
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Mutual Matches — FIX #1: removed duplicate "See Who Likes Me" section that was here */}
      <div className='p-6 space-y-8'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-linear-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center'>
            <Heart className='h-5 w-5 text-pink-600' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-gray-800'>
              My Mutual Matches
            </h2>
            <p className='text-gray-600'>
              People who liked you back
            </p>
          </div>
        </div>

        {myMatches.length === 0 ? (
          <Card className='bg-white/60 backdrop-blur-sm border-pink-200 shadow-lg'>
            <CardContent className='flex flex-col items-center justify-center p-12 text-center'>
              <div className='w-20 h-20 bg-linear-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mb-6'>
                <Heart className='h-10 w-10 text-pink-500' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                No mutual matches yet!
              </h3>
              <p className='text-gray-600 max-w-md'>
                Start liking people back! When you both like each other, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          // FIX #3: grid grid4 → grid grid-cols-1, added gap-6
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {myMatches.map((profile) => (
              <Card
                key={profile.uid}
                className='hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-pink-200 hover:border-red-300 hover:scale-105 group'
              >
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='relative'>
                      <Avatar className='w-32 h-32 border-4 border-white shadow-lg'>
                        <AvatarImage
                          src={profile.photos?.[0] || PLACEHOLDERS.AVATAR_LARGE}
                          alt={profile.name}
                          className='object-cover'
                        />
                        <AvatarFallback className='bg-linear-to-br from-pink-400 to-red-400 text-white text-2xl font-semibold'>
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {profile.isOnline && (
                        <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full' />
                      )}
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-center space-x-2'>
                        <h3 className='font-bold text-xl text-gray-800'>
                          {profile.name}
                        </h3>
                        {/* FIX #2: added className= to span */}
                        <span className='text-gray-500 font-medium text-lg'>
                          {profile.age}
                        </span>
                      </div>
                      {/* FIX #4: txt-sm → text-sm */}
                      <p className='text-sm text-gray-600'>
                        {profile.location.city}
                      </p>
                    </div>

                    <div className='bg-linear-to-r from-pink-50 to-red-50 rounded-lg p-3 border border-pink-200 w-full'>
                      <p className='text-sm text-pink-600 font-medium'>
                        💞 It's a match! Say hello
                      </p>
                    </div>

                    <div className='flex items-center justify-center space-x-3 w-full'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent'
                        onClick={() => handleViewProfile(profile)}
                      >
                        <UserIcon className='h-4 w-4 mr-2' />
                        View Profile
                      </Button>

                      <Button
                        className='flex-1 bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white'
                        onClick={() => handleStartChat(profile)}
                        disabled={startingChat === profile.uid}
                      >
                        <MessageCircle className='h-4 w-4 mr-2' />
                        Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage