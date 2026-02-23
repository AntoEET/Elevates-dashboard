'use client';

import * as React from 'react';
import * as XLSX from 'xlsx';
import { useProspectStore, type Prospect, type ProspectStage } from '@/store/prospect.store';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { Upload, X, Check, AlertCircle, Download } from 'lucide-react';

interface ImportProspectsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExcelRow {
  [key: string]: any;
}

interface ColumnMapping {
  excelColumn: string;
  prospectField: keyof Prospect | 'skip';
}

const PROSPECT_FIELDS = [
  { value: 'name', label: 'Name *' },
  { value: 'company', label: 'Company' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'linkedinProfile', label: 'LinkedIn Profile' },
  { value: 'twitterProfile', label: 'Twitter Profile' },
  { value: 'instagramProfile', label: 'Instagram Profile' },
  { value: 'otherProfile', label: 'Other Profile/Website' },
  { value: 'source', label: 'Source' },
  { value: 'tags', label: 'Tags (comma-separated)' },
  { value: 'priority', label: 'Priority (low/medium/high)' },
  { value: 'notes', label: 'Notes' },
  { value: 'dateAdded', label: 'Date of Adding (YYYY-MM-DD)' },
  { value: 'accepted', label: 'Accepted? (yes/no/true/false)' },
  { value: 'firstEmailDate', label: '1st Email Date (YYYY-MM-DD)' },
  { value: 'followUp1Date', label: 'Follow up 1 Date (YYYY-MM-DD)' },
  { value: 'followUp2Date', label: 'Follow up 2 Date (YYYY-MM-DD)' },
  { value: 'followUp3Date', label: 'Follow up 3 Date (YYYY-MM-DD)' },
  { value: 'followUp4Date', label: 'Follow up 4 Date (YYYY-MM-DD)' },
  { value: 'skip', label: '-- Skip this column --' },
];

export function ImportProspects({ isOpen, onClose }: ImportProspectsProps) {
  const { addProspect } = useProspectStore();
  const [step, setStep] = React.useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [excelData, setExcelData] = React.useState<ExcelRow[]>([]);
  const [excelColumns, setExcelColumns] = React.useState<string[]>([]);
  const [columnMappings, setColumnMappings] = React.useState<Record<string, keyof Prospect | 'skip'>>({});
  const [errors, setErrors] = React.useState<string[]>([]);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importedCount, setImportedCount] = React.useState(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

        if (json.length === 0) {
          setErrors(['The Excel file is empty or has no valid data.']);
          return;
        }

        // Get column names from first row
        const columns = Object.keys(json[0]);
        setExcelColumns(columns);
        setExcelData(json);

        // Auto-map columns based on common names
        const autoMappings: Record<string, keyof Prospect | 'skip'> = {};
        columns.forEach((col) => {
          const lowerCol = col.toLowerCase().trim();
          if (lowerCol === 'name' || lowerCol === 'full name' || lowerCol === 'prospect name') {
            autoMappings[col] = 'name';
          } else if (lowerCol === 'company' || lowerCol === 'organization') {
            autoMappings[col] = 'company';
          } else if (lowerCol === 'email' || lowerCol === 'email address') {
            autoMappings[col] = 'email';
          } else if (lowerCol === 'phone' || lowerCol === 'phone number' || lowerCol === 'tel') {
            autoMappings[col] = 'phone';
          } else if (lowerCol === 'linkedin' || lowerCol === 'linkedin profile' || lowerCol === 'linkedin url') {
            autoMappings[col] = 'linkedinProfile';
          } else if (lowerCol === 'twitter' || lowerCol === 'twitter profile') {
            autoMappings[col] = 'twitterProfile';
          } else if (lowerCol === 'instagram' || lowerCol === 'instagram profile') {
            autoMappings[col] = 'instagramProfile';
          } else if (lowerCol === 'other profile' || lowerCol === 'website' || lowerCol === 'other' || lowerCol === 'url') {
            autoMappings[col] = 'otherProfile';
          } else if (lowerCol === 'source' || lowerCol === 'lead source') {
            autoMappings[col] = 'source';
          } else if (lowerCol === 'tags' || lowerCol === 'categories') {
            autoMappings[col] = 'tags';
          } else if (lowerCol === 'priority') {
            autoMappings[col] = 'priority';
          } else if (lowerCol === 'notes' || lowerCol === 'description' || lowerCol === 'comments') {
            autoMappings[col] = 'notes';
          } else if (lowerCol === 'date of adding' || lowerCol === 'date added' || lowerCol === 'added date' || lowerCol === 'dateadded') {
            autoMappings[col] = 'dateAdded';
          } else if (lowerCol === 'accepted' || lowerCol === 'accepted?') {
            autoMappings[col] = 'accepted';
          } else if (lowerCol === '1st email' || lowerCol === 'first email' || lowerCol === 'first email date') {
            autoMappings[col] = 'firstEmailDate';
          } else if (lowerCol === 'follow up 1' || lowerCol === 'followup 1' || lowerCol === 'follow up 1 date') {
            autoMappings[col] = 'followUp1Date';
          } else if (lowerCol === 'follow up 2' || lowerCol === 'followup 2' || lowerCol === 'follow up 2 date') {
            autoMappings[col] = 'followUp2Date';
          } else if (lowerCol === 'follow up 3' || lowerCol === 'followup 3' || lowerCol === 'follow up 3 date') {
            autoMappings[col] = 'followUp3Date';
          } else if (lowerCol === 'follow up 4' || lowerCol === 'followup 4' || lowerCol === 'follow up 4 date') {
            autoMappings[col] = 'followUp4Date';
          } else {
            autoMappings[col] = 'skip';
          }
        });

        setColumnMappings(autoMappings);
        setStep('mapping');
        setErrors([]);
      } catch (error) {
        setErrors(['Failed to parse Excel file. Please ensure it\'s a valid .xlsx or .xls file.']);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleMappingChange = (excelColumn: string, prospectField: keyof Prospect | 'skip') => {
    setColumnMappings((prev) => ({
      ...prev,
      [excelColumn]: prospectField,
    }));
  };

  const validateMappings = () => {
    const newErrors: string[] = [];

    // Check if 'name' field is mapped
    const hasNameMapping = Object.values(columnMappings).includes('name' as keyof Prospect);
    if (!hasNameMapping) {
      newErrors.push('You must map at least one column to "Name" field.');
    }

    // Check for duplicate mappings (excluding 'skip')
    const mappedFields = Object.values(columnMappings).filter((field) => field !== 'skip');
    const uniqueFields = new Set(mappedFields);
    if (mappedFields.length !== uniqueFields.size) {
      newErrors.push('Each field can only be mapped once. Please check for duplicate mappings.');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handlePreview = () => {
    if (validateMappings()) {
      setStep('preview');
    }
  };

  const convertExcelRowToProspect = (row: ExcelRow): Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'> | null => {
    const prospect: any = {
      stage: 'new-lead' as ProspectStage,
      dateAdded: new Date().toISOString(),
      followUps: [],
      notes: '',
      tags: [],
      priority: 'medium',
    };

    // Map fields from Excel row
    Object.entries(columnMappings).forEach(([excelCol, prospectField]) => {
      if (prospectField === 'skip') return;

      const value = row[excelCol];
      if (value === null || value === undefined || value === '') return;

      if (prospectField === 'tags') {
        // Split tags by comma
        prospect.tags = String(value)
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
      } else if (prospectField === 'priority') {
        // Validate priority value
        const priorityValue = String(value).toLowerCase();
        if (['low', 'medium', 'high'].includes(priorityValue)) {
          prospect.priority = priorityValue;
        } else {
          prospect.priority = 'medium';
        }
      } else if (prospectField === 'accepted') {
        // Handle boolean accepted field
        const acceptedValue = String(value).toLowerCase().trim();
        if (acceptedValue === 'yes' || acceptedValue === 'true' || acceptedValue === '1') {
          prospect.accepted = true;
        } else if (acceptedValue === 'no' || acceptedValue === 'false' || acceptedValue === '0') {
          prospect.accepted = false;
        }
      } else if (
        prospectField === 'dateAdded' ||
        prospectField === 'firstEmailDate' ||
        prospectField === 'followUp1Date' ||
        prospectField === 'followUp2Date' ||
        prospectField === 'followUp3Date' ||
        prospectField === 'followUp4Date'
      ) {
        // Handle date fields - try to parse as date
        try {
          const dateValue = new Date(value);
          if (!isNaN(dateValue.getTime())) {
            if (prospectField === 'dateAdded') {
              prospect[prospectField] = dateValue.toISOString();
            } else {
              prospect[prospectField] = dateValue.toISOString().split('T')[0];
            }
          }
        } catch {
          // Invalid date, skip
        }
      } else {
        prospect[prospectField] = String(value).trim();
      }
    });

    // Validate required fields
    if (!prospect.name || prospect.name === '') {
      return null;
    }

    return prospect;
  };

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);
    setImportedCount(0);

    let successCount = 0;
    const failedRows: number[] = [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const prospect = convertExcelRowToProspect(row);

      if (prospect) {
        try {
          addProspect(prospect);
          successCount++;
        } catch (error) {
          failedRows.push(i + 1);
        }
      } else {
        failedRows.push(i + 1);
      }

      setImportProgress(((i + 1) / excelData.length) * 100);
      setImportedCount(successCount);

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    if (failedRows.length > 0) {
      setErrors([
        `${successCount} prospects imported successfully.`,
        `${failedRows.length} rows failed to import (missing required fields or invalid data).`,
      ]);
    }

    setStep('complete');
  };

  const handleReset = () => {
    setStep('upload');
    setExcelData([]);
    setExcelColumns([]);
    setColumnMappings({});
    setErrors([]);
    setImportProgress(0);
    setImportedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: 'John Doe',
        Company: 'Acme Inc',
        Email: 'john@acme.com',
        Phone: '+1 234 567 890',
        'LinkedIn Profile': 'https://linkedin.com/in/johndoe',
        'Twitter Profile': 'https://twitter.com/johndoe',
        'Instagram Profile': 'https://instagram.com/johndoe',
        'Other Profile': 'https://johndoe.com',
        Source: 'LinkedIn',
        Tags: 'enterprise, warm-lead',
        Priority: 'high',
        Notes: 'Met at conference',
        'Date of Adding': '2026-01-10',
        'Accepted?': 'yes',
        '1st Email': '2026-01-15',
        'Follow up 1': '2026-01-20',
        'Follow up 2': '2026-01-25',
        'Follow up 3': '',
        'Follow up 4': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prospects');
    XLSX.writeFile(wb, 'prospects_template.xlsx');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="glass border-glass-border rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-xl">Import Prospects from Excel</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload an Excel file to import multiple prospects at once
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            <div className="h-px flex-1 bg-glass-border" />
            <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'mapping' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-sm font-medium">Map Columns</span>
            </div>
            <div className="h-px flex-1 bg-glass-border" />
            <div className={`flex items-center gap-2 ${['preview', 'importing', 'complete'].includes(step) ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['preview', 'importing', 'complete'].includes(step) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="text-sm font-medium">Import</span>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-500">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <GlassCard size="md">
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-semibold text-lg mb-2">Upload Excel File</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select an .xlsx or .xls file containing your prospect data
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload">
                    <Button asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                </div>
              </GlassCard>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Need a template?</p>
                    <p className="text-xs text-muted-foreground">
                      Download a sample Excel file with the correct format
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <GlassCard size="md">
                <h4 className="font-semibold mb-4">Map Excel Columns to Prospect Fields</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Found {excelColumns.length} columns in your Excel file with {excelData.length} rows
                </p>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {excelColumns.map((col) => (
                    <div key={col} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{col}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sample: {String(excelData[0][col]).slice(0, 50)}
                          {String(excelData[0][col]).length > 50 ? '...' : ''}
                        </p>
                      </div>
                      <select
                        value={columnMappings[col] || 'skip'}
                        onChange={(e) => handleMappingChange(col, e.target.value as keyof Prospect | 'skip')}
                        className="px-3 py-2 rounded-lg bg-muted/50 border border-glass-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {PROSPECT_FIELDS.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
                <Button onClick={handlePreview}>
                  Continue to Preview
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <GlassCard size="md">
                <h4 className="font-semibold mb-4">Preview Import</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Ready to import {excelData.length} prospects. Review the first few entries:
                </p>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {excelData.slice(0, 5).map((row, index) => {
                    const prospect = convertExcelRowToProspect(row);
                    return (
                      <div key={index} className="p-4 rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{prospect?.name || 'Missing Name'}</p>
                            {prospect?.company && (
                              <p className="text-sm text-muted-foreground">{prospect.company}</p>
                            )}
                            {prospect?.email && (
                              <p className="text-sm text-muted-foreground">{prospect.email}</p>
                            )}
                            {prospect?.tags && prospect.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {prospect.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {prospect ? (
                            <Check className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {excelData.length > 5 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    ... and {excelData.length - 5} more prospects
                  </p>
                )}
              </GlassCard>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Back to Mapping
                </Button>
                <Button onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {excelData.length} Prospects
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Importing */}
          {step === 'importing' && (
            <div className="space-y-4">
              <GlassCard size="md">
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Importing Prospects...</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Imported {importedCount} of {excelData.length} prospects
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && (
            <div className="space-y-4">
              <GlassCard size="md">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Import Complete!</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Successfully imported {importedCount} prospects
                  </p>
                </div>
              </GlassCard>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleReset}>
                  Import More
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
