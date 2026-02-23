'use client';

import { useEffect, useState } from 'react';

/**
 * Auto-export page for outreach system
 * This page automatically exports prospects when opened
 */
export default function ExportToOutreach() {
  const [status, setStatus] = useState('Exporting prospects...');
  const [error, setError] = useState('');

  useEffect(() => {
    async function exportProspects() {
      try {
        // Read prospects from localStorage
        const data = localStorage.getItem('elevates-prospects');

        if (!data) {
          throw new Error('No prospects found in Elevates Dashboard');
        }

        const parsed = JSON.parse(data);
        const prospects = parsed?.state?.prospects || [];

        if (prospects.length === 0) {
          throw new Error('No prospects to export');
        }

        // Send to API endpoint
        const response = await fetch('/api/prospects/export-for-outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prospects })
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Export failed');
        }

        // Send data back to opener window (outreach dashboard)
        if (window.opener) {
          window.opener.postMessage({
            type: 'ELEVATES_EXPORT',
            prospects: result.prospects,
            count: result.count
          }, '*');
        }

        setStatus(`✓ Successfully exported ${result.count} prospects!`);

        // Auto-close after 1 second
        setTimeout(() => {
          window.close();
        }, 1000);

      } catch (err: any) {
        setError(err.message);
        setStatus('Export failed');

        // Send error to opener
        if (window.opener) {
          window.opener.postMessage({
            type: 'ELEVATES_EXPORT_ERROR',
            error: err.message
          }, '*');
        }
      }
    }

    exportProspects();
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>
          {error ? '⚠️' : '🔄'} Export to Outreach
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          {status}
        </p>
        {error && (
          <p style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255, 0, 0, 0.2)',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </p>
        )}
        {!error && (
          <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
            This window will close automatically...
          </p>
        )}
      </div>
    </div>
  );
}
