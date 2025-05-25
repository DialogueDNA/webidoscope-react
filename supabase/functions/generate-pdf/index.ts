
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const sessionId = new URL(req.url).pathname.split('/').pop()?.replace('.pdf', '')
    
    if (!sessionId) {
      return new Response('Session ID required', { status: 400 })
    }

    // Get session data
    const { data: session, error } = await supabaseClient
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error || !session) {
      return new Response('Session not found', { status: 404 })
    }

    // Generate PDF content (simplified - you would use a proper PDF library)
    const pdfContent = `
Session Summary Report

Title: ${session.title}
Date: ${new Date(session.created_at).toLocaleDateString()}
Duration: ${session.duration ? `${session.duration} minutes` : 'Unknown'}
Participants: ${session.participants?.join(', ') || 'None listed'}

Summary:
${session.summary || 'No summary available'}

Transcript:
${session.transcript || 'No transcript available'}
    `

    // In a real implementation, you would use a PDF generation library here
    // For now, return as text with PDF headers
    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${session.title}-summary.pdf"`,
      },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
