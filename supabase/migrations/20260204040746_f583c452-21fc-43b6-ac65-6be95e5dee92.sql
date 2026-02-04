-- Fix overly permissive policies

-- Drop and recreate conversation_participants INSERT policy to require the user adding themselves
DROP POLICY "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants" ON public.conversation_participants 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    public.is_conversation_participant(conversation_id)
  );

-- Drop and recreate group_chat_members INSERT policy
DROP POLICY "Users can join groups" ON public.group_chat_members;
CREATE POLICY "Members can add members" ON public.group_chat_members 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    public.is_group_member(group_chat_id)
  );

-- Drop and recreate conversations INSERT policy to require auth
DROP POLICY "Users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Drop and recreate notifications INSERT policy to require authenticated user
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications" ON public.notifications 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);