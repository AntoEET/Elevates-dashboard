import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { clientTaskSchema } from '@/shared/schemas/client-portfolio';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

interface RouteParams {
  params: Promise<{ id: string; taskId: string }>;
}

// PUT /api/clients/[id]/tasks/[taskId] - Update a task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, taskId } = await params;
    const body = await request.json();
    const tasksPath = path.join(DATA_DIR, id, 'tasks.json');

    // Read existing tasks
    const tasksData = await fs.readFile(tasksPath, 'utf-8');
    const tasksFile = JSON.parse(tasksData);

    // Find and update task
    const taskIndex = tasksFile.tasks.findIndex((t: { id: string }) => t.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const existingTask = tasksFile.tasks[taskIndex];
    const wasCompleted = existingTask.status === 'completed';
    const isNowCompleted = body.status === 'completed';

    const updatedTask = clientTaskSchema.parse({
      ...existingTask,
      ...body,
      id: taskId, // Ensure ID can't be changed
      clientId: id, // Ensure clientId can't be changed
      createdAt: existingTask.createdAt, // Preserve original creation date
      updatedAt: new Date().toISOString(),
      completedAt: isNowCompleted && !wasCompleted
        ? new Date().toISOString()
        : isNowCompleted
          ? existingTask.completedAt
          : undefined,
    });

    tasksFile.tasks[taskIndex] = updatedTask;

    // Write back
    await fs.writeFile(tasksPath, JSON.stringify(tasksFile, null, 2));

    // Log activity based on what changed
    if (isNowCompleted && !wasCompleted) {
      await logActivity(id, {
        type: 'task-completed',
        description: `Task '${updatedTask.title}' marked as completed`,
        metadata: { taskId },
      });
    } else {
      await logActivity(id, {
        type: 'task-updated',
        description: `Task '${updatedTask.title}' updated`,
        metadata: { taskId, updatedFields: Object.keys(body) },
      });
    }

    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id]/tasks/[taskId] - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, taskId } = await params;
    const tasksPath = path.join(DATA_DIR, id, 'tasks.json');

    // Read existing tasks
    const tasksData = await fs.readFile(tasksPath, 'utf-8');
    const tasksFile = JSON.parse(tasksData);

    // Find task to delete
    const taskIndex = tasksFile.tasks.findIndex((t: { id: string }) => t.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const deletedTask = tasksFile.tasks[taskIndex];
    tasksFile.tasks.splice(taskIndex, 1);

    // Write back
    await fs.writeFile(tasksPath, JSON.stringify(tasksFile, null, 2));

    // Log activity
    await logActivity(id, {
      type: 'task-deleted',
      description: `Task '${deletedTask.title}' deleted`,
      metadata: { taskId },
    });

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
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
