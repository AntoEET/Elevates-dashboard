import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { clientProfileSchema, clientRegistrySchema } from '@/shared/schemas/client-portfolio';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

// GET /api/clients - List all clients
export async function GET() {
  try {
    // Read the registry
    const registryPath = path.join(DATA_DIR, 'index.json');
    const registryData = await fs.readFile(registryPath, 'utf-8');
    const registry = clientRegistrySchema.parse(JSON.parse(registryData));

    // Read each client's profile
    const clients = await Promise.all(
      registry.clients.map(async (entry) => {
        try {
          const profilePath = path.join(DATA_DIR, entry.id, 'profile.json');
          const profileData = await fs.readFile(profilePath, 'utf-8');
          return clientProfileSchema.parse(JSON.parse(profileData));
        } catch {
          // If profile doesn't exist, return basic info from registry
          return {
            id: entry.id,
            name: entry.name,
            tier: entry.tier,
            industry: 'Unknown',
            contact: { name: '', email: '' },
            contract: { value: 0, startDate: '', endDate: '', status: 'active' as const },
            financials: { arr: 0, nrr: 100, roi: 0, healthScore: 0 },
            contractHealth: 'healthy' as const,
            tags: [],
            createdAt: entry.createdAt,
            updatedAt: entry.createdAt,
          };
        }
      })
    );

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the client profile
    const clientData = clientProfileSchema.parse({
      ...body,
      id: body.id || generateClientId(body.name),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create client directory
    const clientDir = path.join(DATA_DIR, clientData.id);
    await fs.mkdir(clientDir, { recursive: true });

    // Write profile
    await fs.writeFile(
      path.join(clientDir, 'profile.json'),
      JSON.stringify(clientData, null, 2)
    );

    // Initialize empty data files
    await fs.writeFile(
      path.join(clientDir, 'tasks.json'),
      JSON.stringify({ tasks: [] }, null, 2)
    );
    await fs.writeFile(
      path.join(clientDir, 'meetings.json'),
      JSON.stringify({ meetings: [] }, null, 2)
    );
    await fs.writeFile(
      path.join(clientDir, 'notes.json'),
      JSON.stringify({ notes: [] }, null, 2)
    );
    await fs.writeFile(
      path.join(clientDir, 'documents.json'),
      JSON.stringify({ documents: [] }, null, 2)
    );
    await fs.writeFile(
      path.join(clientDir, 'activity.json'),
      JSON.stringify({ activities: [] }, null, 2)
    );

    // Update registry
    const registryPath = path.join(DATA_DIR, 'index.json');
    const registryData = await fs.readFile(registryPath, 'utf-8');
    const registry = JSON.parse(registryData);

    registry.clients.push({
      id: clientData.id,
      name: clientData.name,
      tier: clientData.tier,
      createdAt: clientData.createdAt,
    });
    registry.lastUpdated = new Date().toISOString();

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));

    // Log activity
    await logActivity(clientData.id, {
      type: 'client-created',
      description: `Client '${clientData.name}' created`,
    });

    return NextResponse.json({ client: clientData }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateClientId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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
    // Activity logging is non-critical, don't fail the request
    console.error('Failed to log activity:', activity);
  }
}
