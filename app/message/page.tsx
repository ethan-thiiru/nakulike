'use client'
import Chat from '@/components/ChatPage/Chat'
import ConversationList from '@/components/ChatPage/ConversationList'
import { SelectedConversation, UserProfile } from '@/lib/types'
import { User } from 'firebase/auth'
import React, { useEffect, useRef, useState } from 'react'


interface MessagePageProps {
  user:User
}

const MessagePage = ({user}:MessagePageProps) => {
  const [selectedConversation,setSelectedConversation] = useState<SelectedConversation | null>(null)
  const scrollPositionRef = useRef(0)
  const handleSelectConversation = (conversationId:string,otherUser:UserProfile) => {
    scrollPositionRef.current = window.scrollY
    setSelectedConversation({conversationId,otherUser})
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
    setTimeout(() => {
      window.scrollTo({top:scrollPositionRef.current, behavior:'instant'})
    },0)
  }

  useEffect(() => {
    if(!selectedConversation && scrollPositionRef.current > 0) {
      window.scrollTo({top:scrollPositionRef.current, behavior:'instant'})
    }
  },[selectedConversation])
  return (
    <div className='h-screen flex bg-linear-to-br from-pink-50 to-red-50'>
      <div className='hidden md:flex w-full'>
        <div className='w-1/3 min-w-[320px] max-w-100 border-r border-pink-100 bg-white/50 backdrop-blur-sm'>
        <ConversationList user={user} onSelectConversation={handleSelectConversation}/>
        </div>

        <div className='flex-1 flex flex-col'>
          {selectedConversation ? (
            <Chat
            user={user}
            conversationId={selectedConversation.conversationId}
            otherUser={selectedConversation.otherUser}
            onBack={handleBackToList}
            />
          ): (
            <div className='flex-1 flex items-center justify-center bg-linear-to-br from-pink-50 to-red-50'>
              <div className='text-center p-8'>
                <div className='w-24 h-24 bg-linear-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <svg width="116" height="116" viewBox="0 0 116 116" xmlns="http://www.w3.org/2000/svg">
  //Halo circle 
  <circle cx="58" cy="58" r="58" fill="#f5d0dc"/>

  //Messenger bubble
  <g transform="translate(58,58)">
    <path d="
      M0,-34
      C18,-34 34,-20 34,0
      C34,18 20,33 2,34
      L-5,45
      L-5,34
      C-20,32 -34,18 -34,0
      C-34,-20 -18,-34 0,-34
      Z"
      fill="none" stroke="#c0266a" strokeWidth="3"
      strokeLinejoin="round" strokeLinecap="round"/>
    //Dots
    <circle cx="-10" cy="0" r="3" fill="#c0266a"/>
    <circle cx="0"   cy="0" r="3" fill="#c0266a"/>
    <circle cx="10"  cy="0" r="3" fill="#c0266a"/>
  </g>
</svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                  Select a conversation
                </h3>
                <p className='text-gray-600 mx-w-sm'>
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      <div className='md:hidden w-full'>
        {selectedConversation ? (
          <Chat
            user={user}
            conversationId={selectedConversation.conversationId}
            otherUser={selectedConversation.otherUser}
            onBack={handleBackToList}
          />
        ): (
          <ConversationList user={user} onSelectConversation={handleSelectConversation}/>
        )}

      </div>
    </div>
  )
}

export default MessagePage