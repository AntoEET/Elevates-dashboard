import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { clientMeetingSchema } from '@/shared/schemas/client-portfolio';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id]/meetings - Get all meetings for a client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const meetingsPath = path.join(DATA_DIR, id, 'meetings.json');
    const meetingsData = await fs.readFile(meetingsPath, 'utf-8');
    const { meetings } = JSON.parse(meetingsData);

    return NextResponse.json({ meetings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/meetings - Create a new meeting
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const meetingsPath = path.join(DATA_DIR, id, 'meetings.json');

    // Validate the meeting
    const meetingData = clientMeetingSchema.parse({
      ...body,
      id: `meeting-${Date.now()}`,
      clientId: id,
      createdAt: new Date().toISOString(),
    });

    // Read existing meetings
    const meetingsFileData = await fs.readFile(meetingsPath, 'utf-8');
    const meetingsFile = JSON.parse(meetingsFileData);

    // Add new meeting
    meetingsFile.meetings.unshift(meetingData);

    // Write back
    await fs.writeFile(meetingsPath, JSON.stringify(meetingsFile, null, 2));

    // Log activity
    await logActivity(id, {
      type: 'meeting-scheduled',
      description: `Meeting '${meetingData.title}' scheduled`,
      metadata: { meetingId: meetingData.id, type: meetingData.type, date: meetingData.date },
    });

    return NextResponse.json({ meeting: meetingData }, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}

// Helper function for activity logging
async function logActivity(
  clientId: string,
  activity: { type: string; description: string; metadata?: Record<string, unknown> }
) {
  try {
    const activityPath = path.join(DATA_DIR, clientId, 'activity.json');
    const activityData = await fs.readFile(activityPath, 'utf-8');
    const activities = JSON.parse(activityData);

    activities.activities.unshift({
      id: `activity-${Date.now()}`,
      clientId,
      type: activity.type,
      description: activity.description,
      metadata: activity.metadata,
      timestamp: new Date().toISOString(),
    });

    await fs.writeFile(activityPath, JSON.stringify(activities, null, 2));
  } catch {
    console.error('Failed to log activity:', activity);
  }
}
