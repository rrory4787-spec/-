import { Post, User } from '../types';

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
  const response = await fetch('/api/feed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Post_Content: content,
      Post_Category: category,
      Allowed_Layer: layer,
      authorEmail: user.email,
      authorName: user.name || user.User_Name,
      imageUrl,
      videoUrl
    }),
  });
  return response.json();
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
    
    const userData = await response.json();
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
    // Fallback local user
    return {
      id: email,
      email,
      name,
      User_Email: email,
      User_Name: name,
      Capital_Amount: 0,
      Investment_Layer: 'General',
      Sovereignty_Points: 0,
      role: 'user',
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
  const response = await fetch(`/api/users/${encodeURIComponent(email)}/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetch('/api/settings');
  return response.json();
}

export async function updateSettings(data: any) {
  const response = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function likePost(postId: string, userEmail: string) {
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail }),
  });
  return response.json();
}

export async function toggleWatchPost(postId: string, userEmail: string) {
  const response = await fetch(`/api/posts/${postId}/watch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail }),
  });
  return response.json();
}

export async function fetchMessages() {
  const response = await fetch('/api/messages');
  return response.json();
}

export async function sendMessage(message: any) {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  return response.json();
}

export async function fetchNotifications(email: string) {
  const response = await fetch(`/api/notifications/${encodeURIComponent(email)}`);
  return response.json();
}

export function subscribeToPosts(callback: (posts: Post[]) => void) {
  fetchFeed().then(callback);
  const interval = setInterval(() => {
    fetchFeed().then(callback);
  }, 15000); // Poll every 15 seconds
  return () => clearInterval(interval);
}

export async function deletePost(postId: string, userEmail: string) {
  const response = await fetch('/api/feed/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, userEmail }),
  });
  return response.json();
}
