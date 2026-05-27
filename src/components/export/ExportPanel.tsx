import { useState } from 'react';
import type { BillOfMaterials } from '../../types/bom.types';
import type { DeckInput } from '../../types/deck.types';

interface ExportPanelProps {
  bom: BillOfMaterials;
  rawInput: DeckInput;
}

export function ExportPanel({ bom, rawInput }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const payload = {
    company: '4X4 Decks' as const,
    version: '1.0.0',
    bom,
    rawInput,
  };

  const json = JSON.stringify(payload, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSend() {
    const apiUrl = import.meta.env.VITE_PRICING_API_URL as string | undefined;
    if (!apiUrl) {
      console.log('[4X4 Decks] Export payload (set VITE_PRICING_API_URL to send automatically):', payload);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Export / Send to Pricing App</h3>
        <button
          onClick={() => setShowJson(v => !v)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {showJson ? 'Hide' : 'Show'} JSON preview
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            copied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        <button
          onClick={handleSend}
          disabled={sending}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-60 ${
            sent ? 'bg-green-600 text-white' : 'bg-yellow-400 text-black hover:bg-yellow-500'
          }`}
        >
          {sending ? 'Sending...' : sent ? 'Sent!' : 'Send to Pricing App'}
        </button>
      </div>

      {!import.meta.env.VITE_PRICING_API_URL && (
        <p className="text-xs text-gray-400">
          Set the <code className="bg-gray-100 px-1 rounded">VITE_PRICING_API_URL</code> environment variable to auto-send. Currently logs to browser console.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
      )}

      {showJson && (
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-64 font-mono">
          {json}
        </pre>
      )}
    </div>
  );
}
