import { NextRequest, NextResponse } from 'next/server';

// GET /api/prospects/export - Export all prospects for outreach system
export async function GET(request: NextRequest) {
  try {
    // In production, this would read from your actual database
    // For now, we'll return prospects from localStorage/Zustand
    // The frontend will need to send the prospects via POST or we read from storage

    // Since Zustand data is client-side, we'll create an endpoint that
    // the frontend can POST prospects to, then we format them for export

    return NextResponse.json({
      message: 'Use POST method to export prospects',
      endpoint: '/api/prospects/export',
      method: 'POST',
      instructions: 'Send prospects array in request body'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in export endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to export prospects' },
      { status: 500 }
    );
  }
}

// POST /api/prospects/export - Receive prospects from frontend and format for outreach system
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

    // Map Elevates prospects to Outreach CSV format
    const outreachProspects = prospects.map((prospect: any) => {
      // Map stage to status
      let status = 'Contacted';
      if (prospect.stage === 'invited') status = 'Contacted';
      if (prospect.stage === 'connected') status = 'Replied';
      if (prospect.stage === 'first-message') status = 'Replied';
      if (prospect.stage === 'follow-up') status = 'Replied';
      if (prospect.stage === 'meeting-scheduled') status = 'Meeting';
      if (prospect.stage === 'proposal-sent') status = 'Qualified';
      if (prospect.stage === 'closed-won') status = 'Won';
      if (prospect.stage === 'closed-lost') status = 'Lost';

      // Parse name
      const nameParts = (prospect.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map priority to reply type
      let replyType = '';
      if (prospect.priority === 'high' && (status === 'Replied' || status === 'Meeting' || status === 'Qualified')) {
        replyType = 'interested';
      }

      return {
        prospect_id: prospect.id || `prospect-${Date.now()}`,
        first_name: firstName,
        last_name: lastName,
        email: prospect.email || '',
        company: prospect.company || '',
        title: prospect.title || '',
        industry: prospect.tags?.find((t: string) => !['Outreach', 'Unknown'].includes(t)) || '',

        // Campaign tracking
        list_source: prospect.source || 'Elevates CRM',
        campaign_name: 'CRM Import',
        date_added: prospect.dateAdded || prospect.createdAt || new Date().toISOString(),

        // Email tracking
        email_1_sent: prospect.dateInvited || prospect.firstEmailDate || '',
        email_1_opened: prospect.accepted ? 'True' : 'False',
        email_1_clicked: 'False',
        email_2_sent: prospect.followUp1Date || '',
        email_2_opened: 'False',
        email_3_sent: prospect.followUp2Date || '',
        email_3_opened: 'False',
        email_4_sent: prospect.followUp3Date || '',

        // Response tracking
        replied: (status === 'Replied' || status === 'Meeting' || status === 'Qualified') ? 'True' : 'False',
        reply_date: prospect.dateConnected || '',
        reply_type: replyType,

        // Meeting tracking
        meeting_booked: status === 'Meeting' || status === 'Qualified' || status === 'Won' ? 'True' : 'False',
        meeting_date: prospect.dateMeetingScheduled || '',
        meeting_completed: status === 'Qualified' || status === 'Won' ? 'True' : 'False',

        // Status & deal
        status: status,
        deal_value: 0,
        deal_stage: status === 'Qualified' ? 'Discovery' : status === 'Won' ? 'Closed-Won' : '',

        // LinkedIn
        linkedin_connected: prospect.linkedinProfile ? 'True' : 'False',
        linkedin_engaged: 'False',

        // Notes
        notes: prospect.notes || '',
        next_step: prospect.followUps?.[0]?.notes || '',
        next_step_date: prospect.followUps?.[0]?.date || '',
        last_updated: prospect.updatedAt || new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      count: outreachProspects.length,
      prospects: outreachProspects,
      exportedAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Error exporting prospects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export prospects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
