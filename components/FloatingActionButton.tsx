import { UserProfile } from 'firebase/auth';
import React from 'react'
import { Button } from './ui/button';
import { RewindIcon } from 'lucide-react';
import { DisLikeIcon, LikeIcon, MessageIcon, SuperLikeIcon } from './ActionIcons';


interface FloatingActionButtonProps {
  onAction: (action: 'pass' |  'like' | 'superlike' | 'rewind' | 'message', profile?:UserProfile) => void;
  actionLoading: string | null;
  disabled?: boolean;
  currentProfile?: UserProfile;
}
const FloatingActionButton = ({onAction,actionLoading,disabled=false,currentProfile}:FloatingActionButtonProps) => {
  return (
    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-50'>
      <div className='flex items-center justify-center space-x-4 rounded-full p-4'>
        <Button
        onClick={() => onAction('rewind')}
        size='sm'
        variant='outline'
        disabled={disabled || actionLoading === 'rewind'}
        className='rounded-full h-12 w-12 border-2 border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-800/40 text-yellow-400 hover:text-yellow-300 transition-all duration-200 hover:scale-110 shadow-lg p-3'
        >
          {actionLoading === 'rewind' ? (
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400'>

            </div>
          ):(
            <RewindIcon/>
          )}
        </Button>

        <Button
        onClick={() => onAction('pass')}
        size='sm'
        variant='outline'
        disabled={disabled || actionLoading === 'pass'}
        className='rounded-full h-16 w-16 border-2 border-red-500/50 bg-red-900/20 hover:bg-red-800/40 transition-all duration-200 hover:scale-110 shadow-lg'
        >
          {actionLoading === 'pass' ? (
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-red-400'>

            </div>
          ):(
            <DisLikeIcon/>
          )}
        </Button>

                <Button
        onClick={() => onAction('superlike')}
        size='sm'
        variant='outline'
        disabled={disabled || actionLoading === 'superlike'}
        className='rounded-full h-16 w-16 bg-blue-600 hover:bg-blue-800 text-white transition-all duration-200 hover:scale-110 shadow-lg p-3'
        >
          {actionLoading === 'superlike' ? (
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white'>

            </div>
          ):(
            <SuperLikeIcon/>
          )}
        </Button>

                        <Button
        onClick={() => onAction('like')}
        size='sm'
        variant='outline'
        disabled={disabled || actionLoading === 'like'}
        className='rounded-full h-16 w-16 bg-linear-to-r from-pink-500 to-yellow-500 hover:from-yellow-600 hover:to-gray-600 text-white transition-all duration-200 hover:scale-110 shadow-lg p-3'
        >
          {actionLoading === 'like' ? (
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white'>

            </div>
          ):(
            <LikeIcon/>
          )}
        </Button>

                        <Button
        onClick={() => onAction('message')}
        size='sm'
        variant='outline'
        disabled={disabled || actionLoading === 'message'}
        className='rounded-full h-16 w-16 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 hover:scale-110 shadow-lg p-2'
        >
          {actionLoading === 'message' ? (
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'>

            </div>
          ):(
            <MessageIcon/>
          )}
        </Button>

        
      </div>
    </div>
  )
}

export default FloatingActionButton