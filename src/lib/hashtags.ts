 import React from 'react';
 import { supabase } from '@/integrations/supabase/client';
 
 // Extract hashtags from content
 export const extractHashtags = (content: string): string[] => {
   const regex = /#(\w+)/g;
   const matches = content.match(regex);
   if (!matches) return [];
   return [...new Set(matches.map((tag) => tag.substring(1).toLowerCase()))];
 };
 
 // Save hashtags for a post
 export const saveHashtags = async (postId: string, content: string) => {
   const tags = extractHashtags(content);
   if (tags.length === 0) return;
 
   for (const tagName of tags) {
     // Upsert hashtag
     const { data: existingTag } = await supabase
       .from('hashtags')
       .select('id')
       .eq('name', tagName)
       .maybeSingle();
 
     let hashtagId = existingTag?.id;
 
     if (!hashtagId) {
       const { data: newTag } = await supabase
         .from('hashtags')
         .insert({ name: tagName })
         .select('id')
         .single();
       hashtagId = newTag?.id;
     }
 
     if (hashtagId) {
       await supabase
         .from('post_hashtags')
         .upsert({ post_id: postId, hashtag_id: hashtagId });
     }
   }
 };
 
 // Render content with clickable hashtags
 export const renderContentWithHashtags = (content: string): React.ReactNode[] => {
   const parts = content.split(/(#\w+)/g);
   return parts.map((part, index) => {
     if (part.startsWith('#')) {
       const tag = part.substring(1).toLowerCase();
       return React.createElement(
         'a',
         {
           key: index,
           href: `/hashtag/${tag}`,
           className: 'text-primary hover:underline font-medium',
           onClick: (e: React.MouseEvent) => e.stopPropagation(),
         },
         part
       );
     }
     return part;
   });
 };