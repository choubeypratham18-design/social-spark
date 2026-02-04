import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type BucketType = 'avatars' | 'post-images' | 'covers';

export const useUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (
    file: File,
    bucket: BucketType
  ): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) {
      return { url: null, error: new Error('Not authenticated') };
    }

    if (!file) {
      return { url: null, error: new Error('No file provided') };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { url: null, error: new Error('File size must be less than 5MB') };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { url: null, error: new Error('File must be an image (JPEG, PNG, GIF, or WebP)') };
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);
      setUploading(false);
      return { url: publicUrl, error: null };
    } catch (error) {
      setUploading(false);
      setProgress(0);
      return { url: null, error: error as Error };
    }
  };

  const uploadAvatar = (file: File) => uploadFile(file, 'avatars');
  const uploadPostImage = (file: File) => uploadFile(file, 'post-images');
  const uploadCover = (file: File) => uploadFile(file, 'covers');

  return {
    uploading,
    progress,
    uploadAvatar,
    uploadPostImage,
    uploadCover,
  };
};
