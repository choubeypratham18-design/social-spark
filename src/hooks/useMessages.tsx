import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ConversationWithDetails, Message, Profile, GroupChatWithDetails, GroupChatMessage } from '@/types/database';

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChatWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (!participations || participations.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationIds = participations.map(p => p.conversation_id);

    const { data: conversationsData } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (!conversationsData) {
      setLoading(false);
      return;
    }

    const enrichedConversations: ConversationWithDetails[] = await Promise.all(
      conversationsData.map(async (conv) => {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            profiles!conversation_participants_user_id_fkey(*)
          `)
          .eq('conversation_id', conv.id);

        const { data: lastMsg } = await supabase
          .from('messages')
          .select(`
            *,
            profiles!messages_sender_id_fkey(*)
          `)
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...conv,
          participants: participants?.map(p => p.profiles as unknown as Profile) || [],
          last_message: lastMsg ? { ...lastMsg, profile: lastMsg.profiles as unknown as Profile } : undefined,
          unread_count: 0,
        };
      })
    );

    setConversations(enrichedConversations);
    setLoading(false);
  }, [user]);

  const fetchGroupChats = useCallback(async () => {
    if (!user) return;

    const { data: memberships } = await supabase
      .from('group_chat_members')
      .select('group_chat_id')
      .eq('user_id', user.id);

    if (!memberships || memberships.length === 0) {
      setGroupChats([]);
      return;
    }

    const groupIds = memberships.map(m => m.group_chat_id);

    const { data: groupsData } = await supabase
      .from('group_chats')
      .select('*')
      .in('id', groupIds)
      .order('updated_at', { ascending: false });

    if (!groupsData) return;

    const enrichedGroups: GroupChatWithDetails[] = await Promise.all(
      groupsData.map(async (group) => {
        const { data: members } = await supabase
          .from('group_chat_members')
          .select(`
            profiles!group_chat_members_user_id_fkey(*)
          `)
          .eq('group_chat_id', group.id);

        const { data: lastMsg } = await supabase
          .from('group_chat_messages')
          .select(`
            *,
            profiles!group_chat_messages_sender_id_fkey(*)
          `)
          .eq('group_chat_id', group.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...group,
          members: members?.map(m => m.profiles as unknown as Profile) || [],
          member_count: members?.length || 0,
          last_message: lastMsg ? { ...lastMsg, profile: lastMsg.profiles as unknown as Profile } : undefined,
        };
      })
    );

    setGroupChats(enrichedGroups);
  }, [user]);

  const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return data?.map(msg => ({ ...msg, profile: msg.profiles as unknown as Profile })) || [];
  };

  const getGroupMessages = async (groupId: string): Promise<GroupChatMessage[]> => {
    const { data } = await supabase
      .from('group_chat_messages')
      .select(`
        *,
        profiles!group_chat_messages_sender_id_fkey(*)
      `)
      .eq('group_chat_id', groupId)
      .order('created_at', { ascending: true });

    return data?.map(msg => ({ ...msg, profile: msg.profiles as unknown as Profile })) || [];
  };

  const sendMessage = async (conversationId: string, content: string, sharedPostId?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        shared_post_id: sharedPostId,
      });

    if (!error) {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return { error };
  };

  const sendGroupMessage = async (groupId: string, content: string, sharedPostId?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('group_chat_messages')
      .insert({
        group_chat_id: groupId,
        sender_id: user.id,
        content,
        shared_post_id: sharedPostId,
      });

    if (!error) {
      await supabase
        .from('group_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', groupId);
    }

    return { error };
  };

  const startConversation = async (targetUserId: string): Promise<string | null> => {
    if (!user) return null;

    // Check if conversation already exists
    const { data: existingParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (existingParticipations) {
      for (const p of existingParticipations) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', p.conversation_id)
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (otherParticipant) {
          return p.conversation_id;
        }
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError || !newConv) return null;

    // Add participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: newConv.id, user_id: user.id },
      { conversation_id: newConv.id, user_id: targetUserId },
    ]);

    await fetchConversations();
    return newConv.id;
  };

  const createGroupChat = async (name: string, memberIds: string[]): Promise<string | null> => {
    if (!user) return null;

    const { data: newGroup, error: groupError } = await supabase
      .from('group_chats')
      .insert({
        name,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError || !newGroup) return null;

    // Add creator as admin
    await supabase.from('group_chat_members').insert({
      group_chat_id: newGroup.id,
      user_id: user.id,
      role: 'admin',
    });

    // Add other members
    if (memberIds.length > 0) {
      await supabase.from('group_chat_members').insert(
        memberIds.map(id => ({
          group_chat_id: newGroup.id,
          user_id: id,
          role: 'member' as const,
        }))
      );
    }

    await fetchGroupChats();
    return newGroup.id;
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchGroupChats();
    }
  }, [user, fetchConversations, fetchGroupChats]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const groupMessagesChannel = supabase
      .channel('group-messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_chat_messages' },
        () => {
          fetchGroupChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(groupMessagesChannel);
    };
  }, [user, fetchConversations, fetchGroupChats]);

  return {
    conversations,
    groupChats,
    loading,
    fetchConversations,
    fetchGroupChats,
    getConversationMessages,
    getGroupMessages,
    sendMessage,
    sendGroupMessage,
    startConversation,
    createGroupChat,
  };
};
