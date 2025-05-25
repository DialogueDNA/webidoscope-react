
import React, { useState } from 'react';
import axios from 'axios'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface NewSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewSessionModal = ({ open, onOpenChange }: NewSessionModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/sessions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsUploading(false);
      onOpenChange(false);
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Audio file uploaded successfully and is being processed",
      });

      console.log('File uploaded successfully:', response.data);
    } catch (error: any) {
        console.error("Upload failed:", error);
        console.error("Response:", error?.response);
        console.error("Data:", error?.response?.data);
        toast({
          title: "Upload failed",
          description: error?.response?.data?.detail || "An unexpected error occurred",
          variant: "destructive",
        });
    }

    // Simulate file upload processing
    // setTimeout(() => {
    //   setIsUploading(false);
    //   onOpenChange(false);
    //   setSelectedFile(null);
    //   toast({
    //     title: "Success",
    //     description: "Audio file uploaded successfully and is being processed",
    //   });
    // }, 2000);
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Audio File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-file">Select Audio File</Label>
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
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewSessionModal;
