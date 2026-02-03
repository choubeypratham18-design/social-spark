import React, { useState } from 'react';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Avatar from '@/components/common/Avatar';
import { useSocial } from '@/context/SocialContext';
import { Conversation } from '@/types';
import { cn } from '@/lib/utils';

const Messages: React.FC = () => {
  const { currentUser, conversations, getMessages, sendMessage } = useSocial();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      sendMessage(selectedConversation.id, newMessage);
      setNewMessage('');
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== currentUser.id) || conversation.participants[0];
  };

  return (
    <Layout showSidebar={false}>
      <div className="rounded-xl border border-border bg-card shadow-social overflow-hidden">
        <div className="flex h-[calc(100vh-180px)] min-h-[500px]">
          {/* Conversations List */}
          <div
            className={cn(
              'w-full border-r border-border md:w-80',
              selectedConversation && 'hidden md:block'
            )}
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Messages</h1>
            </div>

            <div className="divide-y divide-border">
              {conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      'flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary',
                      selectedConversation?.id === conversation.id && 'bg-secondary'
                    )}
                  >
                    <Avatar
                      src={otherUser.avatar}
                      alt={otherUser.displayName}
                      size="md"
                      isVerified={otherUser.isVerified}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-medium text-foreground">
                          {otherUser.displayName}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat View */}
          {selectedConversation ? (
            <div className="flex flex-1 flex-col">
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-border p-4">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="rounded-full p-2 hover:bg-secondary md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar
                  src={getOtherParticipant(selectedConversation).avatar}
                  alt={getOtherParticipant(selectedConversation).displayName}
                  size="md"
                  isVerified={getOtherParticipant(selectedConversation).isVerified}
                />
                <div>
                  <p className="font-medium text-foreground">
                    {getOtherParticipant(selectedConversation).displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{getOtherParticipant(selectedConversation).username}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getMessages(selectedConversation.id).map((message) => {
                  const isOwn = message.senderId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2',
                          isOwn
                            ? 'rounded-br-md gradient-primary text-primary-foreground'
                            : 'rounded-bl-md bg-secondary text-foreground'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={cn(
                            'mt-1 text-xs',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}
                        >
                          {message.createdAt}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t border-border p-4">
                <div className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full rounded-full border border-border bg-secondary py-3 pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="text-center">
                <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-foreground">Select a conversation</p>
                <p className="mt-2 text-muted-foreground">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
