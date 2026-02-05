export interface Profile {
  id: string;
  user_id: string;
  username: string;
  name: string;
  bio: string | null;
  work: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithProfile extends Post {
  profile: Profile;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

 export interface PostComment {
   id: string;
   post_id: string;
   user_id: string;
   content: string;
   parent_comment_id: string | null;
   created_at: string;
   updated_at: string;
   profile?: Profile;
   replies?: PostComment[];
 }
 
 export interface Hashtag {
   id: string;
   name: string;
   created_at: string;
 }
 
 export interface PostHashtag {
   id: string;
   post_id: string;
   hashtag_id: string;
   created_at: string;
 }

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  shared_post_id: string | null;
  created_at: string;
  profile?: Profile;
  shared_post?: PostWithProfile;
}

export interface GroupChat {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupChatMember {
  id: string;
  group_chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface GroupChatMessage {
  id: string;
  group_chat_id: string;
  sender_id: string;
  content: string;
  shared_post_id: string | null;
  created_at: string;
  profile?: Profile;
  shared_post?: PostWithProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'group_invite' | 'share';
  actor_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface ConversationWithDetails extends Conversation {
  participants: Profile[];
  last_message?: Message;
  unread_count: number;
}

export interface GroupChatWithDetails extends GroupChat {
  members: Profile[];
  member_count: number;
  last_message?: GroupChatMessage;
}
