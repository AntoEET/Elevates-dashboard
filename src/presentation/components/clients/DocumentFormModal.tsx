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
import { useClientPortfolioStore } from '@/store/client-portfolio.store';
import { Loader2, FileText, Link } from 'lucide-react';
import type { DocumentType } from '@/shared/schemas/client-portfolio';

interface DocumentFormModalProps {
  open: boolean;
  clientId: string;
  onClose: () => void;
}

const documentTypes: DocumentType[] = ['contract', 'proposal', 'report', 'presentation', 'other'];

const documentTypeDescriptions: Record<DocumentType, string> = {
  contract: 'Legal contracts and agreements',
  proposal: 'Business proposals and quotes',
  report: 'Reports and analysis documents',
  presentation: 'Slide decks and presentations',
  other: 'Other document types',
};

export function DocumentFormModal({ open, clientId, onClose }: DocumentFormModalProps) {
  const { createDocument } = useClientPortfolioStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    type: 'other' as DocumentType,
    url: '',
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        type: 'other',
        url: '',
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const documentData = {
      name: formData.name,
      type: formData.type,
      url: formData.url || undefined,
    };

    try {
      await createDocument(clientId, documentData);
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Document Reference</DialogTitle>
          <DialogDescription>
            Add a reference to a document for this client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Document Name *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Q4 Contract Renewal"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Document Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                {documentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)} - {documentTypeDescriptions[t]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Document URL
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/..."
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Link to the document in Google Drive, SharePoint, or other storage service.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
