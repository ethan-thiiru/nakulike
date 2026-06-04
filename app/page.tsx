'use client'
import Loader from "@/components/Loader";
import MainLayout from "@/components/MainLayout";
import MessagePage from "@/app/message/page";
import DiscoveryPage from "@/app/discovery/page";
import MatchesPage from "@/app/matches/page";
import ProfilePage from "@/app/profile/page"; 
import { useActiveTab } from "@/hooks/useActiveTab";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserProfile } from "@/lib/types";
import { useOnboarding } from "@/hooks/useOnboarding";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";


export default function Home() {

  const { user, loading: userLoading } = useFirebaseAuth();
  const {profile, loading: profileLoading} = useUserProfile(user?.uid);
  const [activeTab, setActiveTab] = useActiveTab('activeTab', 'discovery');
  const {updateProfile:updateLocalProfile} = useOnboarding(user?.uid);
  const router = useRouter();

  useEffect(() => {
    if(userLoading) return;

    if(!user){
      router.push('/login');
      return;
    }

    if(user && !profile && !profileLoading){
      router.push('/user-onboarding');
      return;
    }

  }, [user, userLoading, profile, profileLoading, router])

  const handleSelectMatch = () => {
    setActiveTab('messages');
  }

  const handleProfileUpdate = async(updated:Partial<UserProfile>) => {

    if(!user?.uid) return;

    updateLocalProfile(updated);

    const userRef = doc(db,'users',user.uid);
    try {
      await updateDoc(userRef,updated);
    } catch (error) {
      console.error('Error updating user profile:',error);
    }
  }
  
  if(userLoading){
    return <Loader message="Checking authentication..."/> 
  }

  if(profileLoading){
    return <Loader message="Loading your profile..."/>
  }
    
  if(!user){
    return <Loader message="Redirecting to login..."/>  
  }

    if(!profile){
    return <Loader message="Redirecting to profile setup..."/>  
  }

  console.log("User in Home page:", user);
  return (
    <MainLayout 
    user={user} 
    activeTab={activeTab} 
    onTabChange={setActiveTab}
    profile={profile as any} 
     >  
    {activeTab === 'messages' ? (
      <MessagePage user={user}/>
    ): activeTab === 'discovery' ? (
      <DiscoveryPage user={user} onSelectMatch={handleSelectMatch}/>
    ) : activeTab === 'matches' ? (
      <MatchesPage user={user} onSelectMatch={handleSelectMatch}/>
    ) : activeTab === 'profile' ? (
      <ProfilePage profile={profile} onUpdate={handleProfileUpdate} isOwnProfile={true}/>
    ) : null}
    </MainLayout>
  );
}


