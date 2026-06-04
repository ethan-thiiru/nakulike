'use client'
import FloatingActionButton from '@/components/FloatingActionButton'
import SwipeableCard from '@/components/SwipeableCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDiscovery } from '@/hooks/useDiscovery'
import { DISCOVERY_CONSTANTS, PLACEHOLDERS } from '@/lib/common-utils'
import { UserProfile } from '@/lib/types'
import { User } from 'firebase/auth'
import { Heart } from 'lucide-react'
import React, { useState } from 'react'

interface DiscoveryPageProps {
  user: User,
  onSelectMatch: () => void
}

const DiscoveryPage = ({ user, onSelectMatch }: DiscoveryPageProps) => {
  const { profiles, loading, handleSwipeAction, loadProfiles } = useDiscovery(user)

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  // Enhanced profiles with actual profile photos
  const enhancedProfiles = profiles.map((profile) => ({
    ...profile,
    photos: profile.photos.length > 0 ? profile.photos : [PLACEHOLDERS.AVATAR]
  }))

  const handleButtonAction = async (
    action: 'pass' | 'like' | 'superlike' | 'rewind' | 'message',
    profile?: UserProfile
  ) => {
    if (actionLoading || enhancedProfiles.length === 0) return;

    setActionLoading(action);

    // FIX #6: Get current profile and mark it as animating before any action
    const currentProfile = enhancedProfiles[0];

    try {
      if (action === 'message' && profile) {
        await handleSwipeAction(profile, 'like') // FIX #4: added await
        onSelectMatch();
        return;
      }

      if (action === 'rewind') {
        // FIX #5 (minor): rewind has no swipe action; just return and let finally clean up
        return;
      }

      // FIX #6: Add to animating set so the card fades out and FAB is disabled
      setAnimatingCards((prev) => new Set(prev).add(currentProfile.uid));

      if (action === 'like') {
        await handleSwipeAction(currentProfile, 'like'); // FIX #4: added await
      } else if (action === 'superlike') {
        await handleSwipeAction(currentProfile, 'superlike'); // FIX #4: added await
      } else if (action === 'pass') {
        await handleSwipeAction(currentProfile, 'dislike'); // FIX #4: added await
      }

      // Remove this profile from animating set after animation completes
      setTimeout(() => {
        setAnimatingCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentProfile.uid);
          return newSet;
        });
      }, 300);
    } catch (error) {
      console.error('Error handling button action:', error);
      // Clean up animating state on error
      setAnimatingCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentProfile.uid);
        return newSet;
      });
    } finally {
      setActionLoading(null);
    }
  }

  const visibleProfiles = enhancedProfiles.slice(0, DISCOVERY_CONSTANTS.MAX_VISIBLE_PROFILES);

  if (loading) {
    return (
      // FIX #1: Moved <p> outside the spinning div so text doesn't rotate
      <div className='h-full bg-linear-to-br flex items-center justify-center'>
        <div className='text-white text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4' />
          <p className='text-lg'>
            finding people near you...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-full text-white flex flex-col relative'>
      <div className='flex-1 flex items-center justify-center p-4 relative min-h-0'>
        {/* FIX #2: Corrected malformed calc() — added space and closing parenthesis */}
        <div
          className='relative w-full max-w-100'
          style={{ height: 'calc(100vh - 160px)' }}
        >
          {visibleProfiles.length === 0 ? (
            <Card className='w-full h-full bg-linear-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl'>
              <CardContent className='flex flex-col items-center justify-center h-full p-8 text-center'>
                <div className='bg-linear-to-r from-pink-500 to-red-500 rounded-full p-6 mb-6'>
                  <Heart className='h-16 w-16 text-white' />
                </div>

                <h3 className='text-2xl font-bold text-white mb-3'>
                  No more profiles
                </h3>

                <p>
                  You&apos;ve seen everyone in your area! Check back later for new matches.
                </p>

                <Button
                  onClick={loadProfiles}
                  className='bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg'
                >
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {visibleProfiles.map((profile, index) => {
                const zIndex = visibleProfiles.length - index + DISCOVERY_CONSTANTS.Z_INDEX_BASE;
                const scale = 1 - index * DISCOVERY_CONSTANTS.SCALE_FACTOR;
                const translateY = index * DISCOVERY_CONSTANTS.TRANSLATE_Y_FACTOR; // FIX #5: fixed typo 'tanslateY' → 'translateY'
                const isAnimating = animatingCards.has(profile.uid);

                return (
                  <SwipeableCard
                    key={profile.uid}
                    profile={profile}
                    isAnimating={isAnimating}
                    style={{
                      zIndex,
                      transform: `scale(${scale}) translateY(${translateY}px)`, // FIX #5: uses corrected variable
                      opacity: isAnimating ? 0 : 1,
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                    }}
                  />
                )
              })}

              {visibleProfiles.length > 0 && (
                <FloatingActionButton
                  onAction={handleButtonAction}
                  actionLoading={actionLoading}
                  disabled={animatingCards.size > 0}
                  currentProfile={visibleProfiles[0]}
                />
              )}
            </>
          )}
        </div>
      </div>

      {visibleProfiles.length > 0 && (
        <div className='absolute bottom-24 lg:bottom-8 left-1/2 transform -translate-x-1/2 text-center'>
          <p className='text-white/40 text-sm'>
            Use the buttons above to make your choice
          </p>
        </div>
      )}
    </div>
  )
}

export default DiscoveryPage