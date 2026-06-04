import { User } from 'firebase/auth'
import { UserProfile } from '@/lib/types'
import ResponsiveNavigation from './ResponsiveNavigation'
import React, { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { app, db } from '@/lib/firebase'
import { getDatabase, ref, onDisconnect, onValue, set, update, serverTimestamp } from '@firebase/database'


interface MainLayoutProps {
  user: User
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  profile: UserProfile
}
const MainLayout = ({ user, activeTab, onTabChange, children, profile }: MainLayoutProps) => {

  useEffect(() => {
    if (!user.uid) return;
    const firebaseUserRef = doc(db, 'users', user.uid);
    const rtdb = getDatabase(app);
    const userStatusRef = ref(rtdb, `status/${user.uid}`)

    const isOfflineForRTDB = {
      isOnline: false,
      lastSeen: Date.now(),
    }

    const isOnlineForRTDB = {
      isOnline: true,
      lastSeen: Date.now(),
    }

    //When connected to firebase Realtime Db , set up onDisconnect
    const connectedRef = ref(rtdb, '.info/connected')

    const unsubscribe = onValue(connectedRef, async (snap) => {
      if (snap.val() === false) {
        return;
      }

      //when client disconnect, mark as offline automatically
      await onDisconnect(userStatusRef).set(isOfflineForRTDB)

      //when connected, mark as online in RTDB
      await set(userStatusRef, isOnlineForRTDB)

      await updateDoc(firebaseUserRef, {
        isOnline: true,
        lastSeen: serverTimestamp()
      })
    })

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        await update(userStatusRef, isOfflineForRTDB)
        await updateDoc(firebaseUserRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        })
      } else {
        await update(userStatusRef, isOfflineForRTDB)
        await updateDoc(firebaseUserRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      unsubscribe();
      update(userStatusRef, isOfflineForRTDB)
    }

  }, [user?.uid])
  return (
    <div className='min-h-screen bg-black flex relative pb-20 md:pb-0'>
      <div className='hidden lg:block fixed top-0 left-0 h-screen'>
        <ResponsiveNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          user={user}
          profile={profile}
        />
      </div>
      <div className='flex-1 lg:ml-80 pb-16 lg:pb-0'>
        {children}
      </div>

      <div className='lg:hidden fixed bottom-0 left-0 right-0 '>
        <ResponsiveNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          user={user}
          profile={profile}
        />
      </div>

    </div>
  )
}

export default MainLayout