'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useClientPortfolioStore } from '@/store/client-portfolio.store';
import { Loader2, X } from 'lucide-react';
import type { ClientProfile, ClientTier, ContractStatus } from '@/shared/schemas/client-portfolio';

interface ClientFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  client?: ClientProfile;
  onClose: () => void;
}

const tiers: ClientTier[] = ['enterprise', 'growth', 'starter'];
const contractStatuses: ContractStatus[] = ['active', 'pending', 'expired', 'cancelled'];

export function ClientFormModal({ open, mode, client, onClose }: ClientFormModalProps) {
  const { createClient, updateClient } = useClientPortfolioStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');

  const [formData, setFormData] = React.useState({
    name: '',
    industry: '',
    tier: 'growth' as ClientTier,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactRole: '',
    contractValue: '',
    contractStartDate: '',
    contractEndDate: '',
    contractStatus: 'active' as ContractStatus,
    tags: [] as string[],
  });

  React.useEffect(() => {
    if (mode === 'edit' && client) {
      setFormData({
        name: client.name,
        industry: client.industry,
        tier: client.tier,
        contactName: client.contact.name,
        contactEmail: client.contact.email,
        contactPhone: client.contact.phone || '',
        contactRole: client.contact.role || '',
        contractValue: client.contract.value.toString(),
        contractStartDate: client.contract.startDate.split('T')[0],
        contractEndDate: client.contract.endDate.split('T')[0],
        contractStatus: client.contract.status,
        tags: client.tags,
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        tier: 'growth',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactRole: '',
        contractValue: '',
        contractStartDate: '',
        contractEndDate: '',
        contractStatus: 'active',
        tags: [],
      });
    }
  }, [mode, client, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const clientData = {
      name: formData.name,
      industry: formData.industry,
      tier: formData.tier,
      contact: {
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone || undefined,
        role: formData.contactRole || undefined,
      },
      contract: {
        value: parseFloat(formData.contractValue) || 0,
        startDate: formData.contractStartDate,
        endDate: formData.contractEndDate,
        status: formData.contractStatus,
      },
      tags: formData.tags,
    };

    try {
      if (mode === 'edit' && client) {
        await updateClient(client.id, clientData);
      } else {
        await createClient(clientData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Client' : 'Edit Client'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new client to your portfolio.'
              : 'Update the client details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Client Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium">
                    Industry *
                  </label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Technology"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="tier" className="text-sm font-medium">
                  Tier *
                </label>
                <select
                  id="tier"
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {tiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contactName" className="text-sm font-medium">
                    Contact Name *
                  </label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="text-sm font-medium">
                    Email *
                  </label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="john@acme.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="text-sm font-medium">
                    Phone
                  </label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactRole" className="text-sm font-medium">
                    Role
                  </label>
                  <Input
                    id="contactRole"
                    name="contactRole"
                    value={formData.contactRole}
                    onChange={handleChange}
                    placeholder="VP of Operations"
                  />
                </div>
              </div>
            </div>

            {/* Contract Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Contract Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contractValue" className="text-sm font-medium">
                    Contract Value *
                  </label>
                  <Input
                    id="contractValue"
                    name="contractValue"
                    type="number"
                    value={formData.contractValue}
                    onChange={handleChange}
                    placeholder="100000"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contractStatus" className="text-sm font-medium">
                    Status *
                  </label>
                  <select
                    id="contractStatus"
                    name="contractStatus"
                    value={formData.contractStatus}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    {contractStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="contractStartDate" className="text-sm font-medium">
                    Start Date *
                  </label>
                  <Input
                    id="contractStartDate"
                    name="contractStartDate"
                    type="date"
                    value={formData.contractStartDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contractEndDate" className="text-sm font-medium">
                    End Date *
                  </label>
                  <Input
                    id="contractEndDate"
                    name="contractEndDate"
                    type="date"
                    value={formData.contractEndDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
              <div className="space-y-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and press Enter"
                />
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Client' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
