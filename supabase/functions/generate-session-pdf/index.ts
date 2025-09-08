import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionData {
  id: string
  title: string
  created_at: string
  duration: number | null
  participants: string[] | null
  summary: string
}

function generateSimplePDF(sessionData: SessionData): Uint8Array {
  // Simple PDF structure - this is a basic implementation
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length ${JSON.stringify(sessionData).length + 200}
>>
stream
BT
/F1 12 Tf
72 720 Td
(Session Summary: ${sessionData.title}) Tj
0 -20 Td
(Date: ${new Date(sessionData.created_at).toLocaleDateString()}) Tj
0 -20 Td
(Duration: ${sessionData.duration ? Math.floor(sessionData.duration / 60) + ' minutes' : 'Unknown'}) Tj
0 -20 Td
(Participants: ${sessionData.participants?.join(', ') || 'Unknown'}) Tj
0 -40 Td
(Summary:) Tj
0 -20 Td
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000291 00000 n 
0000000370 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${500 + JSON.stringify(sessionData).length}
%%EOF`

  return new TextEncoder().encode(content)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the session ID from the URL
    const url = new URL(req.url)
    const sessionId = url.pathname.split('/').pop()
    
    if (!sessionId) {
      return new Response('Session ID is required', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response('Authorization header is required', { 
        status: 401,
        headers: corsHeaders 
      })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          authorization: authHeader,
        },
      },
    })

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      })
    }

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return new Response('Session not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }

    // Get summary content if available
    let summaryContent = 'Summary not yet generated'
    if (session.summary_url && session.summary_status === 'completed') {
      try {
        const summaryResponse = await fetch(session.summary_url)
        if (summaryResponse.ok) {
          summaryContent = await summaryResponse.text()
        }
      } catch (error) {
        console.error('Error fetching summary:', error)
      }
    }

    // Prepare session data for PDF
    const sessionData: SessionData = {
      id: session.id,
      title: session.title || `Session ${session.id}`,
      created_at: session.created_at,
      duration: session.duration,
      participants: session.participants,
      summary: summaryContent
    }

    // Generate PDF
    const pdfBuffer = generateSimplePDF(sessionData)
    
    // Return PDF
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sessionData.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})