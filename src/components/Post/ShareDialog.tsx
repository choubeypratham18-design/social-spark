 import React, { useState, useEffect } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { useAuth } from '@/hooks/useAuth';
 import { supabase } from '@/integrations/supabase/client';
 import { Profile } from '@/types/database';
 import { Copy, Check, MessageCircle, Loader2 } from 'lucide-react';
 import { toast } from 'sonner';
 
 interface ShareDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   postId: string;
   postContent: string;
 }
 
 const ShareDialog: React.FC<ShareDialogProps> = ({
   open,
   onOpenChange,
   postId,
   postContent,
 }) => {
   const { user } = useAuth();
   const [copied, setCopied] = useState(false);
   const [conversations, setConversations] = useState<{ id: string; participant: Profile }[]>([]);
   const [loading, setLoading] = useState(false);
   const [sharing, setSharing] = useState<string | null>(null);
 
   const postUrl = `${window.location.origin}/post/${postId}`;
 
   useEffect(() => {
     if (open && user) {
       fetchConversations();
     }
   }, [open, user]);
 
   const fetchConversations = async () => {
     if (!user) return;
     setLoading(true);
 
     const { data: participantsData } = await supabase
       .from('conversation_participants')
       .select('conversation_id')
       .eq('user_id', user.id);
 
     if (!participantsData?.length) {
       setLoading(false);
       return;
     }
 
     const conversationIds = participantsData.map((p) => p.conversation_id);
 
     const { data: otherParticipants } = await supabase
       .from('conversation_participants')
       .select('conversation_id, user_id')
       .in('conversation_id', conversationIds)
       .neq('user_id', user.id);
 
     if (!otherParticipants?.length) {
       setLoading(false);
       return;
     }
 
     const userIds = [...new Set(otherParticipants.map((p) => p.user_id))];
     const { data: profiles } = await supabase
       .from('profiles')
       .select('*')
       .in('user_id', userIds);
 
     const profileMap: Record<string, Profile> = {};
     profiles?.forEach((p) => {
       profileMap[p.user_id] = p;
     });
 
     const convos = otherParticipants.map((p) => ({
       id: p.conversation_id,
       participant: profileMap[p.user_id],
     })).filter((c) => c.participant);
 
     setConversations(convos);
     setLoading(false);
   };
 
   const handleCopyLink = async () => {
     await navigator.clipboard.writeText(postUrl);
     setCopied(true);
     toast.success('Link copied to clipboard!');
     setTimeout(() => setCopied(false), 2000);
   };
 
   const handleShareToConversation = async (conversationId: string) => {
     if (!user) return;
     setSharing(conversationId);
 
     const { error } = await supabase.from('messages').insert({
       conversation_id: conversationId,
       sender_id: user.id,
       content: `Check out this post: ${postContent.substring(0, 50)}...`,
       shared_post_id: postId,
     });
 
     if (error) {
       toast.error('Failed to share post');
     } else {
       toast.success('Post shared!');
       onOpenChange(false);
     }
     setSharing(null);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Share Post</DialogTitle>
           <DialogDescription>
             Share this post with others via link or message.
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-4">
           {/* Copy link */}
           <div className="flex items-center gap-2">
             <Input value={postUrl} readOnly className="flex-1 text-sm" />
             <Button size="sm" onClick={handleCopyLink} variant="outline">
               {copied ? (
                   <Check className="h-4 w-4 text-success" />
               ) : (
                 <Copy className="h-4 w-4" />
               )}
             </Button>
           </div>
 
           {/* Share to conversations */}
           {user && (
             <div>
               <h4 className="text-sm font-medium mb-2">Share via message</h4>
               {loading ? (
                 <div className="flex justify-center py-4">
                   <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                 </div>
               ) : conversations.length > 0 ? (
                 <div className="space-y-2 max-h-48 overflow-y-auto">
                   {conversations.map((convo) => (
                     <button
                       key={convo.id}
                       onClick={() => handleShareToConversation(convo.id)}
                       disabled={sharing === convo.id}
                       className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                     >
                       <Avatar className="h-8 w-8">
                         <AvatarImage src={convo.participant.avatar_url || ''} />
                         <AvatarFallback className="text-xs">
                           {convo.participant.name.charAt(0)}
                         </AvatarFallback>
                       </Avatar>
                       <span className="text-sm font-medium">{convo.participant.name}</span>
                       {sharing === convo.id && (
                         <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                       )}
                     </button>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">
                   No conversations yet. Start a chat to share posts!
                 </p>
               )}
             </div>
           )}
         </div>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default ShareDialog;