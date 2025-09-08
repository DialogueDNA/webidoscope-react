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

function generatePDFContent(sessionData: SessionData): string {
  const title = sessionData.title || 'Session Summary'
  const date = new Date(sessionData.created_at).toLocaleDateString()
  const duration = sessionData.duration ? `${Math.floor(sessionData.duration / 60)} minutes` : 'Unknown'
  const participants = sessionData.participants?.join(', ') || 'Unknown'
  
  // Clean summary text for PDF
  const cleanSummary = sessionData.summary.replace(/[^\x20-\x7E\n]/g, ' ').substring(0, 2000)
  
  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R  
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >>
>>
endobj

4 0 obj
<< /Length 7 0 R >>
stream
BT
/F2 16 Tf
50 720 Td
(${title}) Tj
0 -30 Td
/F1 12 Tf
(Date: ${date}) Tj
0 -20 Td
(Duration: ${duration}) Tj
0 -20 Td
(Participants: ${participants}) Tj
0 -40 Td
/F2 14 Tf
(Summary:) Tj
0 -25 Td
/F1 11 Tf
(${cleanSummary.replace(/\n/g, ') Tj\n0 -15 Td\n(')}) Tj
ET
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

6 0 obj  
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj

7 0 obj
${1000 + cleanSummary.length}
endobj

xref
0 8
0000000000 65535 f
0000000015 00000 n
0000000074 00000 n
0000000120 00000 n
0000000179 00000 n
0000000364 00000 n
0000000445 00000 n
0000000527 00000 n
trailer
<< /Size 8 /Root 1 0 R >>
startxref
550
%%EOF`
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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Valid Authorization header is required', { 
        status: 401,
        headers: corsHeaders 
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
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
        // The summary_url from database is just the relative path, construct proper storage path
        const summaryBlobPath = `sessions/${session.summary_url}`
        console.log('Summary blob path:', summaryBlobPath)
        
        // Use Supabase client to get the signed URL for the blob
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from('audio-sessions')
          .createSignedUrl(summaryBlobPath, 3600) // 1 hour expiry
          
        if (urlError) {
          console.error('Error creating signed URL:', urlError)
        } else if (signedUrl) {
          console.log('Generated signed URL for summary')
          const summaryResponse = await fetch(signedUrl.signedUrl)
          if (summaryResponse.ok) {
            summaryContent = await summaryResponse.text()
            console.log('Successfully fetched summary content, length:', summaryContent.length)
          } else {
            console.error('Summary fetch failed with status:', summaryResponse.status)
          }
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
    const pdfContent = generatePDFContent(sessionData)
    const pdfBuffer = new TextEncoder().encode(pdfContent)
    
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