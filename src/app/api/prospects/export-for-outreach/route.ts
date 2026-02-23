import { NextRequest, NextResponse } from 'next/server';

/**
 * GET endpoint to export prospects for outreach system
 * Called directly by outreach dashboard - no manual export needed
 */
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd fetch from database
    // For now, we'll return empty array since prospects are in localStorage
    // The outreach dashboard will handle the client-side fetch

    return NextResponse.json({
      success: true,
      prospects: [],
      message: 'Use POST endpoint with prospects data from client'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to export prospects' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to receive prospects from Elevates frontend
 * Frontend will send localStorage data here
 */
export async function POST(request: NextRequest) {
  try {
    const { prospects } = await request.json();

    if (!prospects || !Array.isArray(prospects)) {
      return NextResponse.json(
        { success: false, error: 'Invalid prospects data' },
        { status: 400 }
      );
    }

    // Map Elevates prospects to outreach format
    const outreachProspects = prospects.map((prospect: any) => {
      // Map stage to status
      let status = 'New';
      if (prospect.stage === 'invited') status = 'Contacted';
      if (prospect.stage === 'connected') status = 'Replied';
      if (prospect.stage === 'meeting-scheduled') status = 'Meeting';
      if (prospect.stage === 'proposal-sent') status = 'Qualified';
      if (prospect.stage === 'closed-won') status = 'Won';
      if (prospect.stage === 'closed-lost') status = 'Lost';

      // Parse name
      const nameParts = (prospect.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        prospect_id: prospect.id || `ELEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        first_name: firstName,
        last_name: lastName,
        email: prospect.email || '',
        company: prospect.company || '',
        title: prospect.title || '',
        linkedin_url: prospect.linkedin || '',
        industry: prospect.industry || '',
        company_size: '',
        location: prospect.location || '',
        status: status,
        source: 'Elevates CRM',
        date_added: prospect.dateAdded || new Date().toISOString().split('T')[0],
        last_updated: new Date().toISOString().split('T')[0],

        // Email tracking
        email_1_sent: prospect.dateInvited || '',
        email_1_opened: false,
        email_2_sent: '',
        email_2_opened: false,
        email_3_sent: '',
        email_3_opened: false,

        // Engagement
        replied: prospect.stage === 'connected' || prospect.stage === 'meeting-scheduled' || prospect.stage === 'proposal-sent',
        reply_date: prospect.dateConnected || '',
        reply_type: prospect.stage === 'connected' ? 'interested' : '',
        meeting_booked: prospect.stage === 'meeting-scheduled' || prospect.stage === 'proposal-sent',
        meeting_date: prospect.dateMeetingScheduled || '',

        // Notes
        notes: prospect.notes || '',
        next_step: '',

        // Value
        deal_value: prospect.value || 0,
        priority: prospect.priority || 'medium'
      };
    });

    return NextResponse.json({
      success: true,
      prospects: outreachProspects,
      count: outreachProspects.length
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process prospects' },
      { status: 500 }
    );
  }
}
