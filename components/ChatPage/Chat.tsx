import { deleteMessage, markMessageAsRead, sendMessage, subscribeToMessage, reactMessage } from '@/hooks/firebase-chat';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useCloudinaryAudio } from '@/hooks/useCloudinaryAudio';
import { getLastSeenText, QUICK_REACTIONS } from '@/lib/common-utils';
import { SavedRecording, UserProfile, ChatMessage } from '@/lib/types';
import { User } from 'firebase/auth';
import {set} from 'firebase/database';
import { ArrowLeft, Heart, Mic, Pause, Play, Plus, Send, Smile, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { Input } from '../ui/input';

interface ChatPageProps {
  user: User;
  conversationId: string;
  otherUser: UserProfile;
  onBack: () => void;
}

const Chat = ({ user, conversationId, otherUser, onBack }: ChatPageProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [realTimeMessages, setRealTimeMessages] = useState<any[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState<string | null>(null);
  const [savedRecording, setSavedRecording] = useState<SavedRecording | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const { isRecording, recordingTime, audioLevel, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const { uploadAudio, uploadProgress, uploading } = useCloudinaryAudio();

  const quickReactions = QUICK_REACTIONS;

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const unsubscribeToMessages = subscribeToMessage(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        markMessageAsRead(conversationId, user.uid);
      }
    );

    return () => {
      unsubscribeToMessages();
    };
  }, [conversationId, user?.uid]);

    useEffect(() => {
    scrollToBottom();
  }, [messages, realTimeMessages]);

  // Create audio element when savedRecording changes
  useEffect(() => {
    if (savedRecording && savedRecording.url && !previewAudioRef.current) {
      previewAudioRef.current = new Audio(savedRecording.url);
      previewAudioRef.current.preload = 'auto';
      previewAudioRef.current.onended = () => {
        setIsPlayingPreview(false);
        setCurrentPlaybackTime(0);
      };
      previewAudioRef.current.onerror = () => {
        setIsPlayingPreview(false);
        setCurrentPlaybackTime(0);
      };
    }
  }, [savedRecording]);

  // Update playback time during playback
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlayingPreview && previewAudioRef.current) {
      interval = setInterval(() => {
        if (previewAudioRef.current) {
          setCurrentPlaybackTime(previewAudioRef.current.currentTime);
        }
      }, 100);
    } else {
      setCurrentPlaybackTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlayingPreview]);

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        window.audioRecordingCallback = async (recording) => {
          try {
            const audioUrl = URL.createObjectURL(recording.blob);
            setSavedRecording({
              blob: recording.blob,
              duration: recording.duration,
              url: audioUrl,
            });
          } catch (error) {
            console.error('Error saving recording', error);
          } finally {
            window.audioRecordingCallback = undefined;
          }
        };

        await startRecording();
      } catch (error) {
        console.error('Error starting recording', error);
        window.audioRecordingCallback = undefined;
      }
    }
  };

  const handlePlayPausePreview = async () => {
    if (!previewAudioRef.current) {
      if (savedRecording && savedRecording.url) {
        previewAudioRef.current = new Audio(savedRecording.url);
        previewAudioRef.current.preload = 'auto';

        previewAudioRef.current.onended = () => {
          setIsPlayingPreview(false);
        };
        previewAudioRef.current.onerror = () => {
          setIsPlayingPreview(false);
        };
      } else {
        return;
      }
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
      setCurrentPlaybackTime(0);
    } else {
      try {
        if (previewAudioRef.current.readyState < 2) {
          await new Promise((resolve, reject) => {
            previewAudioRef.current!.oncanplay = resolve;
            previewAudioRef.current!.onerror = reject;
            previewAudioRef.current!.load();
          });
        }
        await previewAudioRef.current.play();
        setIsPlayingPreview(true);
      } catch (error) {
        console.error('Error playing audio preview', error);
        setIsPlayingPreview(false);
      }
    }
  };

  const handleSendRecording = async () => {
    if (!savedRecording) return;

    try {
      const audioUrl = await uploadAudio(savedRecording.blob);

      await sendMessage(
        conversationId,
        user?.uid,
        otherUser?.uid,
        `Voice message (${Math.round(savedRecording.duration)}s)`,
        'audio',
        audioUrl,
        savedRecording.duration
      );

      handleDiscardRecording();
    } catch (error) {
      console.error('Error sending voice message', error);
    }
  };

  const handleDiscardRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    if (savedRecording?.url) {
      URL.revokeObjectURL(savedRecording.url);
    }

    setSavedRecording(null);
    setIsPlayingPreview(false);
    setCurrentPlaybackTime(0);
  };

  const handleCancelRecording = () => {
    window.audioRecordingCallback = undefined;
    cancelRecording();
    handleDiscardRecording();
  };

  useEffect(() => {
    return () => {
      window.audioRecordingCallback = undefined;

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }

      if (savedRecording?.url) {
        URL.revokeObjectURL(savedRecording.url);
      }
    };
  }, [savedRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(
        conversationId,
        user?.uid,
        otherUser?.uid,
        newMessage.trim(),
        'text'
      );

      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const handleEmojiSelect = (emojiData: any) => {
    if (showFullEmojiPicker) {
      handleReactToMessage(showFullEmojiPicker, emojiData.emoji);
      setShowFullEmojiPicker(null);
    } else {
      setNewMessage((prev) => prev + emojiData.emoji);
      setShowEmojiPicker(false);
    }
  };

    const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message', error);
    }
  };

    const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      await reactMessage(messageId, user?.uid, emoji);
      setShowReactionPicker(null);
      setShowFullEmojiPicker(null);
      setShowEmojiPicker(false)
    } catch (error) {
      console.error('Error reacting to message', error);
    }
  };


  const playAudio = (messageId: string, audioUrl: string) => {
    if (playingAudio === messageId) {
      const audio = audioRef.current[messageId];
      if (audio) {
        audio.pause();
        setPlayingAudio(null);
      }
    } else {
      if (playingAudio) {
        const currentAudio = audioRef.current[playingAudio];
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      if (!audioRef.current[messageId]) {
        audioRef.current[messageId] = new Audio(audioUrl);
        audioRef.current[messageId].onended = () => setPlayingAudio(null);
      }

      audioRef.current[messageId].play();
      setPlayingAudio(messageId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allMessages = [
    ...messages,
    ...realTimeMessages.filter(
      (rtMsg) => !messages.some((msg) => msg.id === rtMsg.id)
    ),
  ].sort((a, b) => {
    const aTime = a.timestamp?.toMillis?.() || Date.now();
    const bTime = b.timestamp?.toMillis?.() || Date.now();
    return aTime - bTime;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 to-red-50 ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-pink-50 to-red-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="flex items-center space-x-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:bg-pink-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar className="w-12 h-12 border-2 border-white shadow-md">
            <AvatarImage
              src={otherUser?.photos?.[0]}
              alt={otherUser.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-linear-to-br from-pink-400 to-red-400 text-white font-semibold">
              {otherUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="font-bold text-gray-800">{otherUser.name}</h2>
            <div className="text-sm text-gray-500">
              {otherUser?.isOnline ? (
                <span className="text-green-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Online
                </span>
              ) : (
                <span>{getLastSeenText(otherUser?.lastSeen)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {allMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-linear-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              You matched with {otherUser?.name}
            </h3>
            <p className="text-gray-600">
              Say hello and start your conversation 👋
            </p>
          </div>
        ) : (
          allMessages.map((message) => {
            const isCurrentUser = message.senderId === user?.uid;
            return (
              <div key={message.id} className="relative">
                <div
                  className={cn(
                    'flex items-start gap-3 mt-6',
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className="relative group max-w-xs lg:max-w-md">
                    <div className={cn(
                      'px-5 py-4 rounded-3xl shadow-lg relative overflow-visible',
                      isCurrentUser ? 'bg-linear-to-r from-pink-500 to-red-500 text-white rounded-br-lg' :
                        'bg-white text-gray-800 border border-gray-100 rounded-bl-lg'
                    )}>
                      {message.type === 'audio' ? (
                        <div className="flex items-center space-x-3">
                          <Button
                            type="button"
                            variant='ghost'
                            size='sm'
                            onClick={() => playAudio(message.id, message.audioUrl)}
                            className={cn('p-2 rounded-full', isCurrentUser ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-600')}
                          >
                            {playingAudio === message.id ? (
                              <Pause className='h-4 w-4' />
                            ) : (
                              <Play className='h-4 w-4' />
                            )}
                          </Button>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-2'>
                              <Mic className='h-4 w-4' />
                              <span className='text-sm font-medium'>
                                Voice message
                              </span>
                            </div>
                            {message.audioDuration && (
                              <p className='text-xs opacity-75 mt-1'>
                                {formatTime(Math.round(message.audioDuration))}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className='text-sm leading-relaxed'>
                          {message.content}
                        </p>
                      )}

                      <p className={cn('text-xs mt-3', isCurrentUser ? 'text-pink-100' : 'text-gray-400')}>
                        {message.timestamp?.toDate?.()?.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) || 'Sending...'}
                      </p>
                    </div>

                    {/* Emoji reaction icon toggle trigger */}
                    <div className={cn(
                      'absolute top-1/2 transform -translate-y-1/2 z-30 mt-2',
                      isCurrentUser ? '-left-4' : '-right-4'
                    )}>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setShowReactionPicker(
                            showReactionPicker === message.id ? null : message.id
                          )
                        }
                        className='h-8 w-8 p-0 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100'
                      >
                        <Heart className='h-4 w-4' />
                      </Button>
                    </div>

                    {showReactionPicker === message.id && (
                      <div className={cn('absolute -bottom-6 z-50 bg-white rounded-xl shadow-xl border-2 border-pink-100 p-3 transform -translate-y-1/2', isCurrentUser ? 'right-0' : 'left-0')}>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-xs font-medium text-gray-600'>
                            Reactions
                          </span>
                          <button
                            onClick={() => setShowReactionPicker(null)}
                            className='p-1 rounded-full hover:bg-pink-50 transition-colors'
                          >
                            <X className='h-5 w-5 text-gray-500' />
                          </button>
                        </div>

                        {/* Quick Reactions Panel */}

                        <div className='flex gap-2 mb-2'>
                          {quickReactions.map((emoji) => (
                            <Button
                              key={emoji}
                              variant='ghost'
                              size='sm'
                              onClick={() => handleReactToMessage(message.id, emoji)}
                              className='h-10 w-10 p-0 hover:bg-pink-50 text-xl rounded-lg transition-all duration-200 hover:scale-125'
                            >
                              {emoji}
                            </Button>
                          ))}

                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setShowFullEmojiPicker(message.id);
                              setShowReactionPicker(null);
                            }}
                            className='h-8 p-1 mt-1 text-pink-500 text-sm font-medium rounded-lg  border-none '
                            >
                            <Plus className='h-4 w-4 mr-1'/>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Saved Message Reactions Output Display */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className={cn('absolute -bottom-3 flex flex-wrap gap-2 z-20 bg-white border-2 border-gray-200 rounded-full px-3 py-1 shadow-lg animate-in slide-in-from-bottom-2 duration-300',
                        isCurrentUser ? 'right-2 -bottom-10' : 'left-2 -bottom-10'
                      )}
                      style={{ transform: 'translateY(-50%)' }}
                      >
                        {Object.entries(message.reactions).map(
                          ([emoji,users]) => (
                            <div key={emoji} className='flex items-center gap-1.5'>
                          <span className='text-base'>
                            {emoji}
                          </span>
                            </div>
                        ))}
                      </div>
                    )}

                    {/* Delete Message Action Trigger */}
                    {isCurrentUser && (
                      <div className='absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteMessage(message.id)}
                          className='h-7 w-7 p-0 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-200'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Full Modal Emoji Picker Container */}
      {showFullEmojiPicker && (
        <div className='fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end'>
          <div className='w-full bg-white rounded-t-3xl shadow-2xl border-t-2 border-pink-100 animate-in slide-in-from-bottom duration-300'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowEmojiPicker(false)}
                className='h-10 w-10 p-0 rounded-full hover:bg-gray-100'
              >
                <X className='h-5 w-5 text-gray-400'/>
              </Button>
            <div className='max-h-80 overflow-hidden'>
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                width='100%'
                height={300}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Chat Input Form Layout Context */}
      <div className='bg-white/50 backdrop:blur-sm border-t border-pink-100 p-4 space-y-4'>
        {showEmojiPicker && (
            <div className=' bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowEmojiPicker(false)}
                className='h-10 w-10 p-0 rounded-full hover:bg-gray-100'
              >
                <X className='h-5 w-5 text-gray-400'/>
              </Button>
            <div className='max-h-80 overflow-hidden'>
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                width='100%'
                height={250}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </div>
          </div>
        )}

        {savedRecording ? (
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 bg-green-50 border border-green-200 rounded-2xl p-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handlePlayPausePreview}
                className='text-green-600 hover:bg-green-100 p-3 rounded-full'
              >
                {isPlayingPreview ? (
                  <Pause className='h-5 w-5' />
                ) : (
                  <Play className='h-5 w-5' />
                )}
              </Button>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700'>
                  Voice message ready
                </p>
                <p className='text-xs text-green-600'>
                  {isPlayingPreview ? formatTime(Math.round(savedRecording.duration - currentPlaybackTime)) : formatTime(Math.round(savedRecording.duration))}
                </p>
              </div>
            </div>
            <div className='flex items-center justify-center space-x-4'>
              <Button
                variant='outline'
                onClick={handleDiscardRecording}
                className='border-red-300 text-red-600 hover:bg-red-50 bg-transparent rounded-full px-6'
              >
                <Trash2 className='h-4 w-4 mr-2'/>
                Discard
              </Button>
              <Button
                onClick={handleSendRecording}
                disabled={uploading}
                className='bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-full px-6 disabled:opacity-50'
              >
                {uploading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='h-4 w-4 mr-2'/>
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : isRecording ? (
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 bg-red-50 border border-red-200 rounded-2xl p-4'>
              <div className='flex items-center space-x-3 flex-1'>
                <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center relative'>
                  <Mic className='h-4 w-4 text-white'/>
                  <div className='absolute inset-0 rounded-full border-2 border-red-300 animate-pulse'
                    style={{
                      transform: `scale(${1 + audioLevel * 0.3})`,
                      opacity: 0.7 + audioLevel * 0.3,
                    }}
                  />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-red-700'>
                    Recording voice message...
                  </p>
                  <div className='flex items-center space-x-2 mt-1'>
                    <div className='flex space-x-1'>
                      {[...Array(20)].map((_, i) => (
                        <div key={i}
                          className='w-1 bg-red-400 rounded-full transition-all duration-100'
                          style={{ height: `${8 + Math.random() * audioLevel * 16}px` }}
                        />
                      ))}
                    </div>
                    <span className='text-sm font-mono text-red-600 ml-2'>
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-center space-x-4'>
              <Button
                variant='outline'
                onClick={handleCancelRecording}
                className='border-red-30 text-red-600 hover:bg-red-50 bg-transparent rounded-full px-6'
              >
                <Trash2 className='h-4 w-4 mr-2'/>
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleVoiceRecording}
                className='bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-6'
              >
                <Mic className='h-4 w-4 mr-2'/>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={handleSendMessage}
            className='flex items-center space-x-3'
          >
            <div className='flex-1 relative'>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${otherUser.name}...`}
                className='pr-12 bg-white border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-2xl h-12'
                disabled={uploading}
              />

              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() =>
                  setShowEmojiPicker(!showEmojiPicker)}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50'
              >
                <Smile className='h-5 w-5'/>
              </Button>
            </div>

            <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleVoiceRecording}
            disabled={uploading}
            className='text-pink-500 hover:bg-pink-100 p-3 rounded-full transition-all duration-200 hover:scale-110'
            >
              <Mic className='h-5 w-5'/>

            </Button>

            <Button
            type='submit'
            disabled={!newMessage.trim() || uploading}
            className="bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className='h-5 w-5'/>

            </Button>

          </form>
        )}

        {uploading && (
          <div className='text-center'>
            <p className='text-sm text-pink-600 animate-pulse'>
              Sending voice message...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;