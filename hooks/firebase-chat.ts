'use client'
import { db } from "@/lib/firebase"
import { ChatMessage, Conversation, UserProfile } from "@/lib/types";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where, serverTimestamp } from "firebase/firestore";

export type { ChatMessage, Conversation }

export const getOrCreateConversation = async (userId1: string, userId2: string): Promise<string> => {
    const conversationRef = collection(db, 'conversations');

    const q = query(conversationRef, where('participants', 'array-contains', userId1))
    const querySnapShot = await getDocs(q);

    let existingConversation: any = null;
    querySnapShot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(userId2)) {
            existingConversation = { id: doc.id, ...data }
        }
    })

    if (existingConversation) {
        return existingConversation.id;
    }
    
    const newConversation = await addDoc(conversationRef, {
        participants: [userId1, userId2],
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
        lastMessageType: null
    })

    return newConversation.id;
}

export const sendMessage = async (
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    type: 'text' | 'audio',
    audioUrl?: string,
    audioDuration?: number
) => {
    const messageRef = collection(db, 'messages');

    const messageData = {
        conversationId,
        senderId,
        receiverId,
        content,
        type,
        timestamp: serverTimestamp(),
        read: false,
        ...(audioUrl && { audioUrl }),
        ...(audioDuration && { audioDuration }),
    };

    await addDoc(messageRef, messageData);

    const conversationRef = doc(db, 'conversations', conversationId);

    await updateDoc(conversationRef, {
        lastMessage: type === 'audio' ? '🎵 Voice message' : content,
        lastMessageTime: serverTimestamp(),
        lastMessageType: type,
    });
};

// 1. FOR THE CHAT PAGE: Fetches messages inside a specific conversation
export const subscribeToMessage = (
    conversationId: string,
    callback: (message: ChatMessage[]) => void
) => {
    const messageRef = collection(db, 'messages');

    const q = query(
        messageRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data({ serverTimestamps: 'estimate' }), 
        })) as ChatMessage[];

        callback(messages);
    });
};

// 2. FOR THE INBOX PAGE: Fetches all conversations a user is part of
export const subscribeToConversations = (
    userId: string,
    callback: (conversations: Conversation[]) => void
) => {
    const conversationRef = collection(db, 'conversations');

    // Query all conversations where this user is in the participants array
    const q = query(
        conversationRef,
        where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const conversations = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data({ serverTimestamps: 'estimate' }),
        })) as Conversation[];

        // Sort descending by time in JavaScript to avoid immediate Firestore composite index errors
        conversations.sort((a, b) => {
            const timeA = a.lastMessageTime?.toMillis?.() || 0;
            const timeB = b.lastMessageTime?.toMillis?.() || 0;
            return timeB - timeA;
        });

        callback(conversations);
    });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        return { uid: userId, ...userDoc.data()} as UserProfile
    }

    return null;
}

export const markMessageAsRead = async (conversationId: string, userId: string) => {
    const messageRef = collection(db, 'messages');

    const q = query(
        messageRef,
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatedPromise = querySnapshot.docs.map((doc) => updateDoc(doc.ref, { read: true }))

    await Promise.all(updatedPromise);
}

export const deleteMessage = async (messageId: string) => {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
}

export const reactMessage = async (messageId: string, userId: string, emoji: string) => {
    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        const reactions = messageData.reactions || {};

        if (!reactions[emoji]) {
            reactions[emoji] = [];
        }

        const userIndex = reactions[emoji].indexOf(userId);
        if (userIndex > -1) {
            reactions[emoji].splice(userIndex, 1);
        } else {
            reactions[emoji].push(userId);
        }
        
        await updateDoc(messageRef, { reactions }); 
    }
}