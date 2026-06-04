// ============================================================================
// CORE TYPES
// ============================================================================

export interface UserProfile {
  uid: string
  // Step 1: Basic Info
  name: string
  email: string
  age: number
  gender: string
  phone: string

  // Step 2: Interests
  interests: string[]

  // Step 3: Physical & Looking For
  height: string
  weight: string
  lookingFor: string[]
  ageRange: [number, number]

  // Step 4: Lifestyle
  drinking: string
  smoking: string
  workout: string
  diet: string
  pets: string

  // Step 5: Location
  location: {
    latitude: number
    longitude: number
    city: string
    state: string
    country: string
    address: string
  }

  // Step 6: Photos
  photos: string[]

  // Step 7: Additional Info
  additionalInfo: {
    jobTitle: string
    company: string
    educationLevel: string
    university: string
    bio: string
  }

  // System fields
  isVerifiedProfile: boolean
  profileComplete: boolean
  isOnline: boolean
  lastSeen?: any
  createdAt?: Date
  distance?: number // Distance in km (calculated dynamically)
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  type: "text" | "audio"
  timestamp: any
  reactions?: { [emoji: string]: string[] }
  audioUrl?: string
  audioDuration?: number
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: string
  lastMessageTime?: any
  lastMessageType?: "text" | "audio"
  unreadCount?: { [userId: string]: number }
  isTyping?: { [userId: string]: boolean }
}


// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface ConversationWithProfile extends Conversation {
  otherUser?: UserProfile
}


// ============================================================================
// CHAT UTILITY TYPES
// ============================================================================

export interface SavedRecording {
  blob: Blob
  duration: number
  url: string
}

export interface SelectedConversation {
  conversationId: string
  otherUser: UserProfile
}
