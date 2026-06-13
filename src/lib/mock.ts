import { User, Post } from '../types';

export const MOCK_USER: User = {
  id: 'current-user',
  name: 'أحمد المحسن',
  email: 'ahmed@americanaash.com',
  photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
  role: 'admin',
  User_Email: 'ahmed@americanaash.com',
  User_Name: 'أحمد المحسن',
  Capital_Amount: 150000,
  Investment_Layer: 'Layer_700',
  Sovereignty_Points: 1250,
  is_active: true,
};

export const MOCK_MEMBERS: User[] = [
  MOCK_USER,
  {
    id: 'user-2',
    name: 'سارة خالد',
    email: 'sara@example.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    role: 'user',
    User_Email: 'sara@example.com',
    User_Name: 'سارة خالد',
    Capital_Amount: 25000,
    Investment_Layer: 'Layer_250',
    Sovereignty_Points: 450,
    is_active: true,
  },
  {
    id: 'user-3',
    name: 'عمر الفاروق',
    email: 'omar@example.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    role: 'user',
    User_Email: 'omar@example.com',
    User_Name: 'عمر الفاروق',
    Capital_Amount: 5000,
    Investment_Layer: 'General',
    Sovereignty_Points: 120,
    is_active: true,
  },
];

export const MOCK_POSTS: Post[] = [];
