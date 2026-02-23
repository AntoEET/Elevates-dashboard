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
import { Loader2 } from 'lucide-react';
import type { ClientNote, NoteCategory } from '@/shared/schemas/client-portfolio';

interface NoteFormModalProps {
  open: boolean;
  clientId: string;
  note?: ClientNote;
  onClose: () => void;
}

const categories: NoteCategory[] = ['general', 'issue', 'opportunity', 'feedback'];

const categoryDescriptions: Record<NoteCategory, string> = {
  general: 'General notes and observations',
  issue: 'Problems or concerns to address',
  opportunity: 'Potential upsell or expansion opportunities',
  feedback: 'Client feedback and suggestions',
};

export function NoteFormModal({ open, clientId, note, onClose }: NoteFormModalProps) {
  const { createNote } = useClientPortfolioStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!note;

  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    category: 'general' as NoteCategory,
  });

  React.useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'general',
      });
    }
  }, [note, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const noteData = {
      title: formData.title,
      content: formData.content,
      category: formData.category,
    };

    try {
      await createNote(clientId, noteData);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'View Note' : 'Add New Note'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'View the note details.'
              : 'Add a new note for this client.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Note title"
                required
                disabled={isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
                disabled={isEditing}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)} - {categoryDescriptions[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your note here..."
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isEditing}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {isEditing ? 'Close' : 'Cancel'}
            </Button>
            {!isEditing && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Note
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
