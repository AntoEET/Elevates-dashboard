import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id]/activity - Get activity log for a client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const activityPath = path.join(DATA_DIR, id, 'activity.json');
    const activityData = await fs.readFile(activityPath, 'utf-8');
    const { activities } = JSON.parse(activityData);

    // Sort by timestamp (newest first) and limit
    const sortedActivities = activities
      .sort((a: { timestamp: string }, b: { timestamp: string }) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    return NextResponse.json({ activities: sortedActivities }, { status: 200 });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
