import { NextResponse } from 'next/server';

/**
 * Proxy endpoint to import prospects from Outreach System
 * This avoids CSP issues by fetching server-side
 */
export async function GET() {
  try {
    // Fetch from Outreach System (server-side, no CSP issues)
    const response = await fetch('http://localhost:5000/api/prospects', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Outreach System' },
        { status: 500 }
      );
    }

    const outreachProspects = await response.json();

    // Map to Elevates format
    const elevatesProspects = outreachProspects.map((p: any) => {
      // Map status to stage
      let stage = 'new-lead';
      if (p.status === 'Contacted') stage = 'invited';
      if (p.status === 'Replied') stage = 'connected';
      if (p.status === 'Meeting') stage = 'meeting-scheduled';
      if (p.status === 'Qualified') stage = 'proposal-sent';
      if (p.status === 'Won') stage = 'closed-won';
      if (p.status === 'Lost') stage = 'closed-lost';

      // Priority
      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (p.reply_type === 'interested' || p.meeting_booked) priority = 'high';

      return {
        id: p.prospect_id || `P${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
        company: p.company || '',
        email: p.email || '',
        phone: p.phone || '',
        linkedinProfile: p.linkedin_url || '',
        twitterProfile: '',
        instagramProfile: '',
        otherProfile: '',

        stage: stage,
        dateAdded: p.date_added || new Date().toISOString(),
        dateInvited: p.email_1_sent || undefined,
        dateConnected: p.reply_date || undefined,
        dateFirstMessage: p.email_1_sent || undefined,
        dateMeetingScheduled: p.meeting_date || undefined,

        accepted: p.replied === 1 || p.replied === true,
        firstEmailDate: p.email_1_sent || undefined,

        followUps: [],
        notes: p.notes || '',
        tags: [p.industry, p.source].filter(Boolean),
        priority: priority,
        source: p.source || 'Outreach System',

        createdAt: p.date_added || new Date().toISOString(),
        updatedAt: p.last_updated || new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      prospects: elevatesProspects,
      count: elevatesProspects.length
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: 'Failed to import prospects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
