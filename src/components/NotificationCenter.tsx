import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { fetchNotifications } from '../lib/db';
import { Heart, MessageSquare } from 'lucide-react';
import React from 'react';

interface NotificationCenterProps {
  userEmail: string;
}

export function NotificationCenter({ userEmail }: NotificationCenterProps) {
  const lastLikeCount = useRef<number | null>(null);
  const lastMessageCount = useRef<number | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!userEmail) return;

    const checkNotifications = async () => {
      try {
        const data = await fetchNotifications(userEmail);
        const { likes, messages } = data;

        // Message Notification logic
        if (!isFirstLoad.current && messages.length > (lastMessageCount.current || 0)) {
          const newMessages = messages.slice(lastMessageCount.current || 0);
          newMessages.forEach((msg: any) => {
            toast('رسالة جديدة في الديوان', {
              description: `${msg.senderName}: ${msg.text.substring(0, 40)}${msg.text.length > 40 ? '...' : ''}`,
              icon: <MessageSquare className="h-4 w-4 text-[#C5A059]" />,
              duration: 5000,
            });
          });
        }

        // Like Notification logic
        if (!isFirstLoad.current && likes.length > (lastLikeCount.current || 0)) {
          const newLikes = likes.slice(lastLikeCount.current || 0);
          newLikes.forEach((like: any) => {
             // For like, we just know someone liked it. 
             // In a real app we'd have the liker's name from the DB.
             toast('إعجاب جديد', {
              description: `قام أحد الأعضاء بالإعجاب بمنشورك.`,
              icon: <Heart className="h-4 w-4 text-red-500 fill-red-500" />,
              duration: 4000,
            });
          });
        }

        lastLikeCount.current = likes.length;
        lastMessageCount.current = messages.length;
        isFirstLoad.current = false;
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [userEmail]);

  return null; // This component doesn't render anything visible
}
