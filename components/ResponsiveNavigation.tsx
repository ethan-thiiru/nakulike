import { NAV_ITEMS } from '@/lib/common-utils'
import { UserProfile } from '@/lib/types'
import { User } from 'firebase/auth'
import { Flame, Heart, MessageCircle, Settings, UserIcon } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface ResponsiveNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: UserProfile
  user: User
}

const ResponsiveNavigation = ({ activeTab, onTabChange, user, profile }: ResponsiveNavigationProps) => {

  const iconMap = {
    Flame,
    Heart,
    MessageCircle,
    UserIcon
  }

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap]
  }))

  const DesktopSidebar = () => {
    return (
      <div className='hidden lg:flex w-80 bg-linear-to-br from-pink-600 via-red-500 to-orange-500 min-h-screen text-white flex-col shadow-2xl'>
        <div className='p-6 border-b border-white/20'>
          <div className='flex items-center space-x-4 mb-6'>
            {profile.photos?.[0] && (
              <div className='relative'>
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className='w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg'
                />
                {profile.isOnline && (
                  <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white' />
                )}
              </div>
            )}
            <div>
              <h2 className='font-bold text-xl'>
                {profile.name}
              </h2>
              <p className='text-pink-100 text-sm font-medium'>
                {''}
                {profile.isOnline && 'Online now'}
              </p>
            </div>

          </div>
          <div className='flex space-x-3'>
            <Button
              variant='ghost'
              size='sm'
              className='text-white hover:bg-white/20 flex-1 font-semibold'
            >
              <Flame className='h-4 w-4 mr-2 text-orange-300' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              className='text-white hover:bg-white/20 p-2'
            >
              <Settings className='h-4 w-4'/>
            </Button>

          </div>
        </div>

        <div className='flex-1 p-4'>
          <div className='space-y-3'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 font-medium',
                  activeTab === item.id ? 'bg-white/25 shadow-lg backdropblur-sm border border-white/30'
                    : 'hover:bg-white/15 hover:scale-105'

                )}
              >
                <item.icon className='h-6 w-6 text-white' />
                <span className='flex-1 text-left text-lg'>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

        </div>

      </div>
    )
  }

  const MobileBottomNavbar = () => {
    return (
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-linear-to-br from-pink-600 via-red-500 to-orange-500 border-t border-white/20' z-9999="true">

        <div className='flex items-center justify-around py-2'>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 relative',
                activeTab === item.id ? 'bg-white/25 shadow-lg'
                  : 'hover:bg-white/15'

              )}
            >
              <item.icon className='h-6 w-6 text-white' />
              <span className='text-xs text-white font-medium'>
                {item.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    )
  }

  return (
    <>
      <DesktopSidebar />
      <MobileBottomNavbar />
    </>
  )
}

export default ResponsiveNavigation