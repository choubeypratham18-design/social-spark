import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, MessageCircle, Users, Plus, Send, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message, GroupChatMessage, ConversationWithDetails, GroupChatWithDetails, Profile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

const MessagesPage: React.FC = () => {
  const { user, profile: currentProfile } = useAuth();
  const {
    conversations,
    groupChats,
    loading,
    getConversationMessages,
    getGroupMessages,
    sendMessage,
    sendGroupMessage,
    createGroupChat,
  } = useMessages();

  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupChatWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id || '')
        .limit(50);
      if (data) setAllUsers(data);
    };
    if (user) fetchUsers();
  }, [user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (selectedConversation) {
        setLoadingMessages(true);
        const msgs = await getConversationMessages(selectedConversation.id);
        setMessages(msgs);
        setLoadingMessages(false);
      } else if (selectedGroup) {
        setLoadingMessages(true);
        const msgs = await getGroupMessages(selectedGroup.id);
        setGroupMessages(msgs);
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedConversation, selectedGroup, getConversationMessages, getGroupMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, groupMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    if (selectedConversation) {
      await sendMessage(selectedConversation.id, newMessage.trim());
      const msgs = await getConversationMessages(selectedConversation.id);
      setMessages(msgs);
    } else if (selectedGroup) {
      await sendGroupMessage(selectedGroup.id, newMessage.trim());
      const msgs = await getGroupMessages(selectedGroup.id);
      setGroupMessages(msgs);
    }
    setNewMessage('');
    setSendingMessage(false);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await createGroupChat(newGroupName.trim(), selectedMembers);
    setNewGroupName('');
    setSelectedMembers([]);
    setShowCreateGroup(false);
  };

  const getOtherParticipant = (conv: ConversationWithDetails): Profile | undefined => {
    return conv.participants.find(p => p.user_id !== user?.id);
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-lg font-medium">Login to view messages</p>
        </div>
      </Layout>
    );
  }

  if (selectedConversation || selectedGroup) {
    const otherUser = selectedConversation ? getOtherParticipant(selectedConversation) : null;
    const chatMessages = selectedConversation ? messages : groupMessages;
    const chatTitle = selectedConversation
      ? otherUser?.name || 'Unknown'
      : selectedGroup?.name || 'Group';

    return (
      <Layout>
        <div className="flex flex-col h-[calc(100vh-200px)]">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedConversation(null);
                setSelectedGroup(null);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              {selectedConversation && otherUser ? (
                <>
                  <AvatarImage src={otherUser.avatar_url || ''} />
                  <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src={selectedGroup?.avatar_url || ''} />
                  <AvatarFallback>
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div>
              <h2 className="font-semibold">{chatTitle}</h2>
              {selectedGroup && (
                <p className="text-sm text-muted-foreground">
                  {selectedGroup.member_count} members
                </p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isOwn = msg.sender_id === user.id;
                const senderProfile = msg.profile;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {!isOwn && senderProfile && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={senderProfile.avatar_url || ''} />
                        <AvatarFallback>{senderProfile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {selectedGroup && !isOwn && senderProfile && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {senderProfile.name}
                        </p>
                      )}
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Add Members</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {allUsers.map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(u.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, u.user_id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== u.user_id));
                            }
                          }}
                          className="rounded"
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url || ''} />
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateGroup} className="w-full" disabled={!newGroupName.trim()}>
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="direct" className="w-full">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="direct" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Direct Messages
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="direct" className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  return (
                    <div
                      key={conv.id}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={other?.avatar_url || ''} />
                        <AvatarFallback>{other?.name.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{other?.name || 'Unknown'}</p>
                        {conv.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message.content}
                          </p>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="groups" className="space-y-2">
              {groupChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No group chats yet. Create one!
                </div>
              ) : (
                groupChats.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={group.avatar_url || ''} />
                      <AvatarFallback>
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.member_count} members
                      </p>
                    </div>
                    {group.last_message && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(group.last_message.created_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default MessagesPage;
