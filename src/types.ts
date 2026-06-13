export type InvestmentLayer = 'General' | 'Layer_250' | 'Layer_500' | 'Layer_700';
export type PostCategory = 'نبض السوق' | 'جدار القبيلة';
export type AllowedLayer = 'All' | 'Layer_500' | 'Layer_700';

export interface User {
  id: string; // Firebase UID
  name: string;
  email: string;
  photoUrl?: string;
  role: 'admin' | 'user';
  
  // Custom schema fields
  User_Email: string;
  User_Name: string;
  Capital_Amount: number;
  Investment_Layer: InvestmentLayer;
  Sovereignty_Points: number;
  is_active: boolean;
  watchedPostIds?: string[];
}

export interface Post {
  id: string; // Map to Post_ID
  Post_ID: string;
  Post_Content: string;
  Post_Category: PostCategory;
  Allowed_Layer: AllowedLayer;
  
  // Legacy fields for UI compatibility
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhotoUrl?: string;
  content: string; // Maps to Post_Content
  imageUrl?: string;
  videoUrl?: string;
  createdAt: number | string;
  likesCount: number;
  commentsCount: number;
  isDeleted?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  lessonsCount: number;
  allowedLayer: AllowedLayer;
  createdAt: number | string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  allowedLayer: AllowedLayer;
  attendees: string[]; // User emails
  createdAt: number | string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  content: string;
  createdAt: number;
}
