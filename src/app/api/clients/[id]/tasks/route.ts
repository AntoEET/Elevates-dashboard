import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { clientTaskSchema } from '@/shared/schemas/client-portfolio';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id]/tasks - Get all tasks for a client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tasksPath = path.join(DATA_DIR, id, 'tasks.json');
    const tasksData = await fs.readFile(tasksPath, 'utf-8');
    const { tasks } = JSON.parse(tasksData);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/tasks - Create a new task
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tasksPath = path.join(DATA_DIR, id, 'tasks.json');

    // Validate the task
    const taskData = clientTaskSchema.parse({
      ...body,
      id: `task-${Date.now()}`,
      clientId: id,
      status: body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Read existing tasks
    const tasksFileData = await fs.readFile(tasksPath, 'utf-8');
    const tasksFile = JSON.parse(tasksFileData);

    // Add new task
    tasksFile.tasks.unshift(taskData);

    // Write back
    await fs.writeFile(tasksPath, JSON.stringify(tasksFile, null, 2));

    // Log activity
    await logActivity(id, {
      type: 'task-created',
      description: `Task '${taskData.title}' created`,
      metadata: { taskId: taskData.id, priority: taskData.priority },
    });

    return NextResponse.json({ task: taskData }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
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
