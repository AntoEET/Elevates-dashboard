import { NextRequest, NextResponse } from 'next/server';

// POST /api/prospects/sync - Sync prospects from outreach system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospects } = body;

    if (!Array.isArray(prospects)) {
      return NextResponse.json(
        { error: 'Invalid request: prospects must be an array' },
        { status: 400 }
      );
    }

    // Map outreach data to Elevates prospect format
    const mappedProspects = prospects.map((outreachProspect: any) => {
      // Map status to stage
      let stage: string = 'new-lead';
      if (outreachProspect.status === 'Contacted') stage = 'invited';
      if (outreachProspect.status === 'Replied') stage = 'connected';
      if (outreachProspect.status === 'Meeting') stage = 'meeting-scheduled';
      if (outreachProspect.status === 'Qualified') stage = 'proposal-sent';
      if (outreachProspect.status === 'Won') stage = 'closed-won';
      if (outreachProspect.status === 'Lost') stage = 'closed-lost';

      // Determine priority based on reply type and status
      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (outreachProspect.reply_type === 'interested') priority = 'high';
      if (outreachProspect.meeting_booked) priority = 'high';
      if (outreachProspect.status === 'Nurture') priority = 'low';

      return {
        id: outreachProspect.prospect_id || `prospect-${Date.now()}-${Math.random()}`,
        name: `${outreachProspect.first_name || ''} ${outreachProspect.last_name || ''}`.trim(),
        company: outreachProspect.company || '',
        email: outreachProspect.email || '',
        phone: outreachProspect.phone || undefined,
        linkedinProfile: outreachProspect.linkedin_url || undefined,

        // Pipeline tracking
        stage,
        dateAdded: outreachProspect.date_added || outreachProspect.email_1_sent || new Date().toISOString(),
        dateInvited: outreachProspect.email_1_sent || undefined,
        dateConnected: outreachProspect.reply_date || undefined,
        dateFirstMessage: outreachProspect.email_1_sent || undefined,
        dateMeetingScheduled: outreachProspect.meeting_date || undefined,
        dateProposalSent: undefined,
        dateClosed: outreachProspect.status === 'Won' || outreachProspect.status === 'Lost'
          ? outreachProspect.last_updated || new Date().toISOString()
          : undefined,

        // Quick tracking
        accepted: outreachProspect.replied || false,
        firstEmailDate: outreachProspect.email_1_sent || undefined,
        followUp1Date: outreachProspect.email_2_sent || undefined,
        followUp2Date: outreachProspect.email_3_sent || undefined,
        followUp3Date: outreachProspect.email_4_sent || undefined,

        // Follow-ups
        followUps: [],

        // Additional info
        notes: outreachProspect.notes || '',
        tags: [
          outreachProspect.industry || 'Unknown',
          outreachProspect.campaign_name || 'Outreach',
          outreachProspect.list_source || 'Unknown'
        ].filter(Boolean),
        priority,
        source: outreachProspect.list_source || 'Outreach System',

        // Metadata
        createdAt: outreachProspect.date_added || new Date().toISOString(),
        updatedAt: outreachProspect.last_updated || new Date().toISOString(),
      };
    });

    // In a real implementation, you would save these to the database
    // For now, we'll just return them with a success message
    // The frontend will handle adding them to the Zustand store

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${mappedProspects.length} prospects`,
      prospects: mappedProspects,
      syncedAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Error syncing prospects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync prospects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/prospects/sync - Get sync status
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/prospects/sync',
    method: 'POST',
    expectedFormat: {
      prospects: [
        {
          prospect_id: 'string',
          first_name: 'string',
          last_name: 'string',
          email: 'string',
          company: 'string',
          title: 'string',
          status: 'Contacted | Replied | Meeting | Qualified | Won | Lost',
          // ... other fields
        }
      ]
    }
  });
}
