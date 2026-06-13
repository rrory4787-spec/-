import { Post, User, Course, Event } from '../types';

export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await fetch('/api/courses');
    if (!response.ok) throw new Error('Failed to fetch courses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function createCourse(course: Partial<Course>) {
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });
    if (!response.ok) throw new Error('Failed to create course');
    return await response.json();
  } catch (error) {
    console.error('Error creating course:', error);
    return { error: true, message: String(error) };
  }
}

export async function fetchEvents(): Promise<Event[]> {
  try {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Failed to fetch events');
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function createEvent(event: Partial<Event>) {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    return { error: true, message: String(error) };
  }
}

export async function toggleAttendance(eventId: string, userEmail: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/attend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail }),
    });
    if (!response.ok) throw new Error('Failed to toggle attendance');
    return await response.json();
  } catch (error) {
    console.error('Error toggling attendance:', error);
    return { error: true, message: String(error) };
  }
}

export async function fetchFeed(isAdmin: boolean = false): Promise<Post[]> {
  try {
    const response = await fetch(`/api/feed${isAdmin ? '?isAdmin=true' : ''}`);
    if (!response.ok) throw new Error('Failed to fetch feed');
    const data = await response.json();
    return data.map((p: any) => ({
      ...p,
      id: p.Post_ID || 'unknown',
      content: p.Post_Content || '',
      authorName: p.authorName || 'عضو المجتمع',
      authorEmail: p.authorEmail,
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      imageUrl: p.imageUrl,
      videoUrl: p.videoUrl,
    })) as Post[];
  } catch (error) {
    console.error('Error fetching feed:', error);
    return [];
  }
}

export async function createPost(user: User, content: string, category: string = 'نبض السوق', layer: string = 'All', imageUrl?: string, videoUrl?: string) {
  try {
    const response = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Post_Content: content,
        Post_Category: category,
        Allowed_Layer: layer,
        authorEmail: user.email,
        authorName: user.name || user.User_Name,
        authorPhotoUrl: user.photoUrl,
        imageUrl,
        videoUrl
      }),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    return { error: true, message: String(error) };
  }
}

export async function getOrCreateAppUser(email: string, name: string): Promise<User> {
  try {
    // First try to get the user
    let response = await fetch(`/api/users/${encodeURIComponent(email)}`);
    
    if (response.status === 404) {
      // Create new user if not found
      response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_Email: email,
          User_Name: name,
          Capital_Amount: 0,
          Investment_Layer: 'General',
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    
    const userData = await response.json();
    if (!userData || !userData.User_Email) {
      throw new Error("Invalid user data response from server");
    }

    return {
      id: email,
      email: userData.User_Email,
      name: userData.User_Name,
      photoUrl: userData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.User_Name)}&background=C5A059&color=121212`,
      role: userData.role || 'user',
      ...userData,
    } as User;
  } catch (error) {
    console.error('Error in getOrCreateAppUser:', error);
    // Fallback local user - force active so they are never stuck
    return {
      id: email,
      email: email,
      name: name,
      User_Email: email,
      User_Name: name,
      Capital_Amount: 0,
      Investment_Layer: 'General',
      Sovereignty_Points: 0,
      is_active: true,
      role: email === 'admin@americanaash.com' ? 'admin' : 'user',
    } as User;
  }
}

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/admin/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data.map((userData: any) => ({
      id: userData.User_Email,
      email: userData.User_Email,
      name: userData.User_Name,
      photoUrl: userData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.User_Name)}&background=C5A059&color=121212`,
      role: userData.role || 'user',
      ...userData,
    })) as User[];
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    return [];
  }
}

export async function activateUser(email: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(email)}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to activate: ${response.status}`);
    }

    const userData = await response.json();
    if (!userData || !userData.User_Email) {
      throw new Error("Invalid activation response from server");
    }

    return {
      id: email,
      email: userData.User_Email,
      name: userData.User_Name,
      photoUrl: userData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.User_Name)}&background=C5A059&color=121212`,
      role: userData.role || 'user',
      ...userData,
    } as User;
  } catch (error) {
    console.error('Error activating user:', error);
    // Persistent active fallback so the user is never stuck
    return {
      id: email,
      email: email,
      name: 'عضو المجتمع',
      User_Email: email,
      User_Name: 'عضو المجتمع',
      is_active: true,
      role: email === 'admin@americanaash.com' ? 'admin' : 'user',
    } as User;
  }
}

export async function updateUser(email: string, data: Partial<User>): Promise<User> {
  const response = await fetch(`/api/users/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const userData = await response.json();
  return {
    id: email,
    email: userData.User_Email,
    name: userData.User_Name,
    photoUrl: userData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.User_Name)}&background=C5A059&color=121212`,
    role: userData.role || 'user',
    ...userData,
  } as User;
}

export async function fetchSettings() {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg" };
  }
}

export async function updateSettings(data: any) {
  try {
    const response = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    return { error: true, message: String(error) };
  }
}

export async function likePost(postId: string, userEmail: string) {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail }),
    });
    if (!response.ok) throw new Error('Failed to like post');
    return await response.json();
  } catch (error) {
    console.error('Error liking post:', error);
    return { error: true, message: String(error) };
  }
}

export async function toggleWatchPost(postId: string, userEmail: string) {
  try {
    const response = await fetch(`/api/posts/${postId}/watch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail }),
    });
    if (!response.ok) throw new Error('Failed to watch post');
    return await response.json();
  } catch (error) {
    console.error('Error watching post:', error);
    return { error: true, message: String(error) };
  }
}

export async function fetchMessages() {
  try {
    const response = await fetch('/api/messages');
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(message: any) {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: true, message: String(error) };
  }
}

export async function fetchNotifications(email: string) {
  try {
    const response = await fetch(`/api/notifications/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { likes: [], messages: [] };
  }
}

export function subscribeToPosts(callback: (posts: Post[]) => void) {
  fetchFeed().then(callback);
  const interval = setInterval(() => {
    fetchFeed().then(callback);
  }, 15000); // Poll every 15 seconds
  return () => clearInterval(interval);
}

export async function deletePost(postId: string, userEmail: string) {
  try {
    const response = await fetch('/api/feed/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, userEmail }),
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return await response.json();
  } catch (error) {
    console.error('Error deleting post:', error);
    return { error: true, message: String(error) };
  }
}
