-- Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Session',
  duration NUMERIC,
  participants TEXT[] DEFAULT '{}',
  summary_preset TEXT,
  transcript_status TEXT DEFAULT 'not_started',
  summary_status TEXT DEFAULT 'not_started',
  emotion_breakdown_status TEXT DEFAULT 'not_started',
  metadata_status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own sessions
CREATE POLICY "Users can view their own sessions" 
ON public.sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to create their own sessions
CREATE POLICY "Users can create their own sessions" 
ON public.sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own sessions
CREATE POLICY "Users can update their own sessions" 
ON public.sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own sessions
CREATE POLICY "Users can delete their own sessions" 
ON public.sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_summary_preset ON public.sessions(summary_preset);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();