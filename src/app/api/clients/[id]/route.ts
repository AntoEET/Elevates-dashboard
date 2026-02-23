import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { clientProfileSchema } from '@/shared/schemas/client-portfolio';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'clients');

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Calculate ROI from revenue and investment
// Formula: ((Revenue Generated - Total Investment) / Total Investment) × 100
function calculateROI(revenueGenerated: number, totalInvestment: number): number {
  if (totalInvestment <= 0) return 0;
  return ((revenueGenerated - totalInvestment) / totalInvestment) * 100;
}

// GET /api/clients/[id] - Get a single client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const profilePath = path.join(DATA_DIR, id, 'profile.json');
    const profileData = await fs.readFile(profilePath, 'utf-8');
    const rawClient = JSON.parse(profileData);

    // Calculate ROI dynamically from revenue and investment
    const calculatedROI = calculateROI(
      rawClient.financials?.revenueGenerated || 0,
      rawClient.financials?.totalInvestment || 1
    );

    // Add calculated ROI to financials
    const clientWithROI = {
      ...rawClient,
      financials: {
        ...rawClient.financials,
        roi: calculatedROI,
      },
    };

    const client = clientProfileSchema.parse(clientWithROI);

    return NextResponse.json({ client }, { status: 200 });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Client not found' },
      { status: 404 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const profilePath = path.join(DATA_DIR, id, 'profile.json');

    // Read existing profile
    const existingData = await fs.readFile(profilePath, 'utf-8');
    const existingProfile = JSON.parse(existingData);

    // Merge with updates
    const updatedProfile = clientProfileSchema.parse({
      ...existingProfile,
      ...body,
      id, // Ensure ID can't be changed
      createdAt: existingProfile.createdAt, // Preserve original creation date
      updatedAt: new Date().toISOString(),
    });

    // Write updated profile
    await fs.writeFile(profilePath, JSON.stringify(updatedProfile, null, 2));

    // Update registry if name or tier changed
    if (body.name || body.tier) {
      const registryPath = path.join(DATA_DIR, 'index.json');
      const registryData = await fs.readFile(registryPath, 'utf-8');
      const registry = JSON.parse(registryData);

      const clientIndex = registry.clients.findIndex((c: { id: string }) => c.id === id);
      if (clientIndex !== -1) {
        if (body.name) registry.clients[clientIndex].name = body.name;
        if (body.tier) registry.clients[clientIndex].tier = body.tier;
        registry.lastUpdated = new Date().toISOString();
        await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
      }
    }

    // Log activity
    await logActivity(id, {
      type: 'client-updated',
      description: `Client '${updatedProfile.name}' updated`,
      metadata: { updatedFields: Object.keys(body) },
    });

    return NextResponse.json({ client: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const clientDir = path.join(DATA_DIR, id);

    // Check if client exists
    try {
      await fs.access(clientDir);
    } catch {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get client name for activity log
    const profilePath = path.join(clientDir, 'profile.json');
    const profileData = await fs.readFile(profilePath, 'utf-8');
    const profile = JSON.parse(profileData);

    // Remove client from registry
    const registryPath = path.join(DATA_DIR, 'index.json');
    const registryData = await fs.readFile(registryPath, 'utf-8');
    const registry = JSON.parse(registryData);

    registry.clients = registry.clients.filter((c: { id: string }) => c.id !== id);
    registry.lastUpdated = new Date().toISOString();
    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));

    // Delete client directory recursively
    await fs.rm(clientDir, { recursive: true, force: true });

    return NextResponse.json(
      { message: `Client '${profile.name}' deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
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
