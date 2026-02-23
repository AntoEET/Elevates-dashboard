import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { clientNoteSchema } from '@/shared/schemas/client-portfolio';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id]/notes - Get all notes for a client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const notesPath = path.join(DATA_DIR, id, 'notes.json');
    const notesData = await fs.readFile(notesPath, 'utf-8');
    const { notes } = JSON.parse(notesData);

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/notes - Create a new note
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const notesPath = path.join(DATA_DIR, id, 'notes.json');

    // Validate the note
    const noteData = clientNoteSchema.parse({
      ...body,
      id: `note-${Date.now()}`,
      clientId: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Read existing notes
    const notesFileData = await fs.readFile(notesPath, 'utf-8');
    const notesFile = JSON.parse(notesFileData);

    // Add new note
    notesFile.notes.unshift(noteData);

    // Write back
    await fs.writeFile(notesPath, JSON.stringify(notesFile, null, 2));

    // Log activity
    await logActivity(id, {
      type: 'note-created',
      description: `Note '${noteData.title}' created`,
      metadata: { noteId: noteData.id, category: noteData.category },
    });

    return NextResponse.json({ note: noteData }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
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
