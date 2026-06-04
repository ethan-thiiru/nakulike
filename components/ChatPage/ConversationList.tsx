'use client'

import { getUserProfile, subscribeToConversations } from '@/hooks/firebase-chat'
import { Conversation, UserProfile } from '@/lib/types'
import { User } from 'firebase/auth'
import { MessageCircle, Mic, Search } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { PLACEHOLDERS } from '@/lib/common-utils'

interface ConversationWithProfile extends Conversation {
  otherUser?: UserProfile
}

interface ConversationListProps {
  user: User
  onSelectConversation: (conversationId: string, otherUser: UserProfile) => void
}

const ConversationList = ({ user, onSelectConversation }: ConversationListProps) => {
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Cache to prevent redundant Firestore reads on every real-time update
  const profileCache = useRef<Record<string, UserProfile>>({});

  useEffect(() => {
    if (!user?.uid) return;

    // FIX: Using the newly created subscribeToConversations (plural)
    const unsubscribe = subscribeToConversations(user.uid, async (newConversations) => {
      const conversationWithProfiles: ConversationWithProfile[] = await Promise.all(
        newConversations.map(async (conversation) => {
          const otherUserId = conversation.participants.find((id) => id !== user.uid)
          let otherUser: UserProfile | undefined = undefined;

          if (otherUserId) {
            // Check the cache before making a network request
            if (profileCache.current[otherUserId]) {
              otherUser = profileCache.current[otherUserId];
            } else {
              const fetchedProfile = await getUserProfile(otherUserId);
              if (fetchedProfile) {
                profileCache.current[otherUserId] = fetchedProfile;
                otherUser = fetchedProfile;
              }
            }
          }
          
          return { ...conversation, otherUser }
        })
      )

      setConversations(conversationWithProfiles)
      setLoading(false)
    })
    
    return unsubscribe;
  }, [user?.uid])

  const filteredConversation = conversations.filter((conversation) =>
    conversation.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-pink-50 to-red-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-pink-50 to-red-50 overflow-x-hidden'>
      <div className='bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10 will-change-scroll'>
        <div className='p-4 max-w-full'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-800 truncate'>
              Messages
            </h1>

            <div className='w-10 h-10 bg-linear-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center shrink-0 ml-2'>
              <MessageCircle className='h-5 w-5 text-white' />
            </div>
          </div>

          {/* search bar */}
          <div className='relative w-full'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search conversation...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 bg-white border-gray-200 focus:border-pink-300 focus:ring-pink-200 w-full'
            />
          </div>
        </div>
      </div>

      <div className='p-4 max-w-full overflow-x-hidden'>
        {filteredConversation.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-20 h-20 bg-linear-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <MessageCircle className='h-10 w-10 text-pink-500' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>
              No conversation yet
            </h3>
            <p className='text-gray-500 text-sm'>
              Start matching to begin a conversation!
            </p>
          </div>
        ) : (
          <div className='space-y-2 max-w-full'>
            {filteredConversation.map((conversation) => {
              // Placeholder for future unread logic
              const hasUnreadMessages = false; 

              return (
                <Button
                  key={conversation.id}
                  variant='ghost'
                  className='w-full p-3 sm:p-4 h-auto justify-start bg-white/60 hover:bg-white/80 border border-white/50 rounded-xl transition-all duration-200 overflow-hidden'
                  onClick={() => conversation.otherUser && onSelectConversation(conversation.id, conversation.otherUser)}
                >
                  <div className='flex items-center space-x-3 sm:space-x-4 w-full min-w-0'>
                    <div className='relative shrink-0'>
                      <Avatar className='w-12 h-12 sm:w-14 sm:h-14 border-2 border-white shadow-md'>
                        <AvatarImage
                          src={conversation.otherUser?.photos?.[0] || PLACEHOLDERS.AVATAR_SMALL}
                          alt={conversation.otherUser?.name || 'User'}
                          className='object-cover'
                        />
                        <AvatarFallback className='bg-linear-to-br from-pink-400 to-red-400 text-white font-semibold text-base sm:text-lg'>
                          {conversation.otherUser?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      {conversation?.otherUser?.isOnline && (
                        <div className='absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full z-10' />
                      )}
                    </div>

                    <div className='flex-1 min-w-0 text-left overflow-hidden'>
                      <div className='flex items-center justify-between mb-1 gap-2'>
                        <h3 className='font-semibold text-gray-800 truncate text-sm sm:text-base'>
                          {conversation.otherUser?.name || 'Unknown User'}
                        </h3>

                        <span className='text-xs text-gray-500 shrink-0 whitespace-nowrap'>
                          {formatLastMessageTime(conversation.lastMessageTime)}
                        </span>
                      </div>

                      <div className='flex items-center space-x-1 overflow-hidden'>
                        {conversation.lastMessageType === 'audio' && (
                          <Mic className='h-3 w-3 text-gray-400 shrink-0' />
                        )}
                        <p className='text-xs sm:text-sm text-gray-600 truncate'>
                          {conversation.lastMessage || 'Say hello! 👋'}
                        </p>
                      </div>
                    </div>
                    
                    {hasUnreadMessages && (
                      <div className='w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full shrink-0' />
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList;