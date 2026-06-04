import { UserProfile } from '@/lib/types'
import React, { useState } from 'react'
import { Card } from './ui/card';
import { formatUtils, PLACEHOLDERS } from '@/lib/common-utils';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface SwipeableCardProps {
    profile:UserProfile;
    style?:React.CSSProperties;
    isAnimating?:boolean;
}

const SwipeableCard = ({profile,style,isAnimating}:SwipeableCardProps) => {

  const [currentImageIndex,setCurrentImageIndex] = useState<number>(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => Math.min(prev + 1, profile.photos.length - 1));
  }
  const prevImage = () => {
    setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
  }

const cardStyle = {
  ...style,
  ...(isAnimating && {
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
  }),
}

  return (
    <div className='absolute w-full h-full' style={cardStyle}>
      <Card className='w-full h-full shadow-2xl bg-gray-900 border-gray-700 overflow-hidden rounded-xl p-0 gap-0 flex! flex-col!'>
        <div className='relative w-fill h-full shrink-0'>

          {/* FIX #1: Added flex + positioning so dots are visible */}
          {profile.photos.length > 1 && (
            <div className='absolute flex top-4 left-4 right-4 space-x-2 z-20'>
              {profile.photos.map((_ ,index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}

          <img 
            src={profile?.photos[currentImageIndex] || PLACEHOLDERS.AVATAR} 
            alt={profile.name}
            className='absolute inset-0 w-full h-full object-cover' 
            draggable={false}
          />

          <div className='absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent'/>


          {profile.photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                disabled={currentImageIndex === 0}
                className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full text-white p-3 transition-all duration-200 z-20
                  ${currentImageIndex === 0 ? 'bg-black/20 cursor-not-allowed opacity-50' : 'bg-black/40 hover:bg-black/60 hover:scale-110'}
                `}
              >
                <ChevronLeft className='h-6 w-6'/>
              </button>

              {/* FIX #2: Changed left-4 to right-4 so button is on the correct side */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                disabled={currentImageIndex === profile.photos.length - 1}  // FIX #3: was profile.photos.length, off by one
                className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full text-white p-3 transition-all duration-200 z-20
                  ${currentImageIndex === profile.photos.length - 1 ? 'bg-black/20 cursor-not-allowed opacity-50' : 'bg-black/40 hover:bg-black/60 hover:scale-110'}
                `}
              >
                <ChevronRight className='h-6 w-6'/>
              </button>
            </>
          )}

          <div className='absolute bottom-0 left-0 right-0 p-6 text-white z-10'>
            <div className='flex items-center space-x-3 mb-1'>
              <h2 className='text-3xl font-bold'>
                {profile.name}
              </h2>
              <span className='text-2xl font-light'>
                {profile.age}
              </span>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
            </div>

            {profile.additionalInfo.bio && (
              <p className='text-base opacity-90 mb-2 line-clamp-3'>
              {profile.additionalInfo.bio}
              </p>
            )}

            <div className='flex items-center space-x-2 mb-4'>
              <MapPin className='h-5 w-5'/>
              <span className='text-base'>
                {[profile.location.city, profile.location.country].filter(Boolean).join(', ')}
                {profile.distance !== undefined && profile.distance > 0 && (
                  <span className='ml-2 font-semibold'> ●
                    {formatUtils.formatDistance(profile.distance)} away
                  </span>
                )}
              </span>
            </div>

            <div className='flex flex-wrap gap-2 mb-2'>
              {profile.interests.slice(0, 4).map((interest) => (
                <Badge
                key={interest}
                variant='secondary'
                className='text-sm bg-white/20 text-white border-white/30 px-3 py-1'
                >
                  {interest}
                </Badge>
              ))}

              {profile.interests.length > 4 && (
                <Badge
                variant='secondary'
                className='text-sm bg-white/20 text-white border-white/30 px-3 py-1'
                >
                  +{profile.interests.length - 4}
                </Badge>
              )}

            </div>

          </div>

        </div>
      </Card>
    </div>
  )
}

export default SwipeableCard