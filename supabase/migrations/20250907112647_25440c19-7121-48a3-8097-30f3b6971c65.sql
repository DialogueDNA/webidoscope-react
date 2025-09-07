-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "allow_all_inserts" ON public.sessions;

-- Create proper RLS policies for the sessions table
CREATE POLICY "Users can view their own sessions" 
ON public.sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.sessions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.sessions 
FOR DELETE 
USING (auth.uid() = user_id);