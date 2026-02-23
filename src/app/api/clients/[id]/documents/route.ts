import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { clientDocumentSchema } from '@/shared/schemas/client-portfolio';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id]/documents - Get all documents for a client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const documentsPath = path.join(DATA_DIR, id, 'documents.json');
    const documentsData = await fs.readFile(documentsPath, 'utf-8');
    const { documents } = JSON.parse(documentsData);

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/documents - Add a new document reference
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const documentsPath = path.join(DATA_DIR, id, 'documents.json');

    // Validate the document
    const documentData = clientDocumentSchema.parse({
      ...body,
      id: `doc-${Date.now()}`,
      clientId: id,
      uploadedAt: new Date().toISOString(),
    });

    // Read existing documents
    const documentsFileData = await fs.readFile(documentsPath, 'utf-8');
    const documentsFile = JSON.parse(documentsFileData);

    // Add new document
    documentsFile.documents.unshift(documentData);

    // Write back
    await fs.writeFile(documentsPath, JSON.stringify(documentsFile, null, 2));

    // Log activity
    await logActivity(id, {
      type: 'document-uploaded',
      description: `Document '${documentData.name}' uploaded`,
      metadata: { documentId: documentData.id, type: documentData.type, size: documentData.size },
    });

    return NextResponse.json({ document: documentData }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
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
