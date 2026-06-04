'use client';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { STATS_DATA } from '@/lib/common-utils';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Heart, Sparkle, Star, Users, Zap, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const page = () => {
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useFirebaseAuth();
  const router = useRouter();


  useEffect(() => {
    if (!userLoading && user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try{
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth,provider)
      toast.success("successfully signed in with Google!");
      router.push('/')
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("Failed to sign in with google. Please try again.");
    }finally{
      setLoading(false);
    }
  };
  if(userLoading){
    return <Loader message="Checking authentication..."/>
  }

  const stats = STATS_DATA;
  return (
    <div className='min-h-screen bg-linear-to-br from-pink-400 via-red-500 to-yellow-500 relative overflow-hidden'>

      <div className='relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen'>

          <div className='space-y-6 sm:space-y-8'>

            <div className='text-center lg:text-left space-y-4 sm:space-y-6'>

              <div className='flex justify-center lg:justify-start'>

                <div className='relative'>

                  <div className='bg-white/20 backdrop-blur-sm p-6 rounded-full'>

                  <Heart className='h-16 w-16 text-white fill-current animate-pulse-soft'/>

                  </div>
                  <Sparkle className='h-8 w-8 text-golden absolute -top-2 -right-2 animate-pulse'/>
                  <Star className='h-6 w-6 text-white absolute -bottom-1 -left-1 animate-float' /> 

                </div>

              </div>
               
               <h1 className='text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight'>
                There is that
                <span className='block bg-linear-to-r from-white to-white/20 bg-clip-text text-transparent'>
                  Missing Piece.
                </span>
               </h1>

               <p className='text-lg sm:text-xl text-white/90 max-w-lg mx-auto lg:mx-0'  >
                Kutana na watu millioni utafute mpenzi wa roho
               </p>

               <div className='grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0'>
                {stats.map((stat,i) => (
                  <div key={i} className='text center'>
                    <div className='text-2xl sm:text-3xl font-bold text-white'>
                      {stat.label}
                    </div>
                    <div className='text-white/80 text-xs sm:text-sm'>
                      {stat.sub}
                    </div>
                  </div>
                ))}
               </div>
            </div>

          </div>

          <div className='flex justify-center lg:justify-end'>
            <Card className='w-full max-w-md bg-white/95 backdrop-blur-sm border-0 overflow-hidden shadow-2xl'>
            <div className='relative'>
              <div className='absolute inset-0 bg-linear-soft opacity-50'>

              </div>
              <CardHeader className='relative text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8'>

                <div className='flex justify-center'>
                  <div className='relative'>
                    <div className='bg-linear-to-br from-pink-400 via-red-500 to-yellow-500 p-4 rounded-full shadow-glow'>
                      <Heart className='h-12 w-12 text-white fill-current '/>
                    </div>

                  <Sparkle className='h-6 w-6 text-golden absolute -top-1 -right-1 animate-pulse'/>
                  <div className='absolute -bottom-2 -left-2 bg-passionate rounded-full p-1'>
                    <Star className='h-4 w-4 text-white fill-current' />
                  </div>
                  </div>
                </div>
                <div className='space-y-3'>
                  <CardTitle className='text-4xl font-bold text-pink-500'>
                    Ingia Sasa
                  </CardTitle>

                  <CardDescription className='text-gray-600 text-lg font-medium'>
                    Start your love story today
                  </CardDescription>
                </div>

                <div className='flex justify-center space-x-6 text-sm text-gray-500'>
                  <div className='flex items-center space-x-1'>
                    <Zap className='h-4 w-4 text-golden'/>
                    <span>Instant Setup</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <Users className='h-4 w-4 text-romantic'/>
                    <span>Verified Users</span>
                  </div>
                </div>
              </CardHeader>
            </div>

            <CardContent className='space-y-4 sm:space-y-6 px-6 sm:px-8 pb-6 sm:pb-8'> 
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className='w-full h-12 bg-red-500 sm:h-14 text-base sm:text-lg font-semibold rounded-full relative overflow-hidden group'
                >
                  {loading ? (
                    <div className='flex items-center space-x-3'>
                      <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'/>
                      <span>Creating your account...</span>
                    </div>
                  ) : (
                    <>
                      <div className='absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000'>
                      </div>
                      
                      <div className='flex items-center space-x-3 relative z-10'>
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                        <Heart className='h-5 w-5 animate-pulse-soft'/>
                      </div>
                    </>
                  )}

              </button>

              <div className='bg-linear-soft rounded-lg text-center'>
                <div className='flex justify-center items-center space-x-4 mb-2'>
                  <Shield className='h-5 w-5 text-romantic'/>
                  <span className='text-sm font-medium text-gray-700'>
                    Secure & Private
                  </span>
                </div>
              </div>

              <p className='text-xs text-gray-500 text-center leading-relaxed'>
                By signing up, you agree to our{''}
                <a 
                href="#"
                className='text-romantic hover:underline font-medium'
                >
                  Terms of Service
                </a>
                {''}and{''}
                <a 
                className='text-romantic hover:underline font-medium'
                href="#"
                >
                  Privacy Policy
                </a>
              </p>
            </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}

export default page