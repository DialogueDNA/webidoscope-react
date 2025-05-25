
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NewSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewSessionModal = ({ open, onOpenChange }: NewSessionModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Error",
          description: "Please select an audio file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      if (!sessionTitle) {
        setSessionTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Error",
        description: "Please select an audio file and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    if (!sessionTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a session title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload audio file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-sessions')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Create session record in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          title: sessionTitle.trim(),
          audio_file_url: uploadData.path,
          duration: null, // Will be populated after processing
          participants: [],
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Send to backend for processing (optional - for transcription/analysis)
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('sessionId', sessionData.id);
        
        await fetch('/api/upload-audio', {
          method: 'POST',
          body: formData,
        });
      } catch (backendError) {
        console.warn('Backend processing failed:', backendError);
        // Continue anyway - the session was created successfully
      }

      setIsUploading(false);
      onOpenChange(false);
      setSelectedFile(null);
      setSessionTitle('');
      
      toast({
        title: "Success",
        description: "Session created successfully! Processing audio...",
      });

      // Redirect to the new session
      navigate(`/session/${sessionData.id}`);

    } catch (error: any) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSessionTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-title">Session Title</Label>
            <Input
              id="session-title"
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session title"
              className="flex-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-file">Upload Audio File</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || !sessionTitle.trim() || isUploading}>
            {isUploading ? 'Creating Session...' : 'Create Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewSessionModal;
