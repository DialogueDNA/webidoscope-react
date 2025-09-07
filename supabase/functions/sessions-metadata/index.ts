import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionMetadata {
  id: string;
  title: string;
  duration: number | null;
  participants: string[];
  created_at: string;
  updated_at: string;
  transcript_status: string;
  summary_status: string;
  emotion_breakdown_status: string;
  metadata_status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const createdAfter = url.searchParams.get('created_after');
    const createdBefore = url.searchParams.get('created_before');
    const summaryType = url.searchParams.get('summary_type');

    console.log('Filtering sessions with:', { createdAfter, createdBefore, summaryType, userId: user.id });

    // Build query with filters
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply date filters
    if (createdAfter) {
      query = query.gte('created_at', createdAfter);
    }
    if (createdBefore) {
      // Add one day to include the end date
      const endDate = new Date(createdBefore);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString().split('T')[0]);
    }
    if (summaryType) {
      query = query.eq('summary_preset', summaryType);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transform data to match expected format
    const formattedSessions: SessionMetadata[] = sessions?.map(session => ({
      id: session.id,
      title: session.title || 'Untitled Session',
      duration: session.duration,
      participants: session.participants || [],
      created_at: session.created_at,
      updated_at: session.updated_at,
      transcript_status: session.transcript_status || 'not_started',
      summary_status: session.summary_status || 'not_started',
      emotion_breakdown_status: session.emotion_breakdown_status || 'not_started',
      metadata_status: session.metadata_status || 'completed',
    })) || [];

    console.log(`Returning ${formattedSessions.length} filtered sessions`);

    return new Response(JSON.stringify(formattedSessions), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});