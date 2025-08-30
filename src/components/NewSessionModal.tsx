/**
 * NewSessionModal
 *
 * Responsibilities:
 * - Load available summary presets when the dialog opens.
 * - Require the user to choose a preset before creating a session.
 * - Upload the audio + title + summary_preset to /api/sessions/upload.
 * - On success, navigate to the new session page.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

interface NewSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Preset = { key: string; label: string };

const NewSessionModal: React.FC<NewSessionModalProps> = ({ open, onOpenChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [presets, setPresets] = useState<Preset[]>([]);
  const [preset, setPreset] = useState('');
  const [loadingPresets, setLoadingPresets] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Load presets when the dialog opens
  useEffect(() => {
    if (!open) return;
    setLoadingPresets(true);
    apiClient('/api/sessions/summary/presets')
      .then((res) => setPresets(res?.presets ?? []))
      .catch(() =>
        toast({ title: 'Error', description: 'Failed to load summary types', variant: 'destructive' })
      )
      .finally(() => setLoadingPresets(false));
  }, [open]);

  // Handle file selection (+ set default title from file name)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast({ title: 'Error', description: 'Please select an audio file', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    if (!sessionTitle) setSessionTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  // Create the session
  const handleUpload = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Please choose an audio file', variant: 'destructive' });
      return;
    }
    if (!sessionTitle.trim()) {
      toast({ title: 'Error', description: 'Please enter a session title', variant: 'destructive' });
      return;
    }
    if (!preset) {
      toast({ title: 'Error', description: 'Please choose a summary type', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', sessionTitle.trim());
      formData.append('summary_preset', preset);

      const res: any = await apiClient('/api/sessions/upload', { method: 'POST', body: formData });

      onOpenChange(false);
      setSelectedFile(null);
      setSessionTitle('');
      toast({ title: 'Success', description: 'Session created! Processing audio…' });

      // Navigate to the session page (adjust if your route is /sessions/:id)
      navigate(`/session/${res.session_id}`);
    } catch (e: any) {
      toast({
        title: 'Upload failed',
        description: e?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset local state when closing the dialog
  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedFile(null);
      setSessionTitle('');
      setPreset('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="session-title">Session Title</Label>
            <Input
              id="session-title"
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session title"
            />
          </div>

          {/* Audio file */}
          <div className="space-y-2">
            <Label htmlFor="audio-file">Upload Audio File</Label>
            <div className="flex items-center gap-2">
              <Input id="audio-file" type="file" accept="audio/*" onChange={handleFileChange} />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
            )}
          </div>

          {/* Preset select */}
          <div className="space-y-2">
            <Label>Summary type (required)</Label>
            {loadingPresets ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <select
                className="w-full border rounded-md p-2"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                <option value="" disabled>
                  Pick one…
                </option>
                {presets.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !sessionTitle.trim() || !preset || isUploading}
          >
            {isUploading ? 'Creating Session…' : 'Create Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewSessionModal;
