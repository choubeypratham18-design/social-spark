import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Post, Notification, User, Conversation, Message, Comment } from '@/types';
import { 
  initialPosts, 
  initialNotifications, 
  initialConversations, 
  conversationMessages,
  currentUser,
  users 
} from '@/data/mockData';

interface SocialContextType {
  currentUser: User;
  posts: Post[];
  notifications: Notification[];
  conversations: Conversation[];
  getMessages: (conversationId: string) => Message[];
  getUserById: (userId: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  addPost: (content: string, image?: string) => void;
  deletePost: (postId: string) => void;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  sharePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  toggleFollow: (userId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(conversationMessages);
  const [allUsers, setAllUsers] = useState<User[]>(users);

  const getUserById = (userId: string) => allUsers.find(u => u.id === userId);
  const getUserByUsername = (username: string) => allUsers.find(u => u.username === username);

  const addPost = (content: string, image?: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content,
      image,
      createdAt: 'Just now',
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
      isBookmarked: false,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const toggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const toggleBookmark = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const sharePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, shares: post.shares + 1 }
          : post
      )
    );
  };

  const addComment = (postId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content,
      createdAt: 'Just now',
      likes: 0,
      isLiked: false,
    };
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !comment.isLiked,
                      likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                    }
                  : comment
              ),
            }
          : post
      )
    );
  };

  const toggleFollow = (userId: string) => {
    setAllUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? {
              ...user,
              isFollowing: !user.isFollowing,
              followers: user.isFollowing ? user.followers - 1 : user.followers + 1,
            }
          : user
      )
    );
    // Update posts with the new user data
    setPosts(prev =>
      prev.map(post =>
        post.userId === userId
          ? {
              ...post,
              user: {
                ...post.user,
                isFollowing: !post.user.isFollowing,
                followers: post.user.isFollowing ? post.user.followers - 1 : post.user.followers + 1,
              },
            }
          : post
      )
    );
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const getMessages = (conversationId: string) => messages[conversationId] || [];

  const sendMessage = (conversationId: string, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      sender: currentUser,
      content,
      createdAt: 'Just now',
      isRead: false,
    };
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: newMessage }
          : conv
      )
    );
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        posts,
        notifications,
        conversations,
        getMessages,
        getUserById,
        getUserByUsername,
        addPost,
        deletePost,
        toggleLike,
        toggleBookmark,
        sharePost,
        addComment,
        toggleCommentLike,
        toggleFollow,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sendMessage,
        unreadNotificationsCount,
        unreadMessagesCount,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};
