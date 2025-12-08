import React, { useState, useRef } from 'react';
import { useTitheMutations } from '../hooks/useTitheBatch';
import ContributorSelect from '../../shared/components/ContributorSelect';
import { Plus, Loader2 } from 'lucide-react';

export default function EntryForm({ batchId, siteId, organizationId }) {
  const [contributor, setContributor] = useState(null);
  const [amount, setAmount] = useState('');
  const amountInputRef = useRef(null);
  
  const { addTitheEntry } = useTitheMutations();
  const { mutate: addEntry, isPending } = addTitheEntry;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contributor || !amount) return;

    addEntry(
      {
        batch_id: batchId,
        contributor_id: contributor.id,
        amount: parseFloat(amount),
      },
      {
        onSuccess: () => {
          // Clear form and refocus for rapid entry
          setContributor(null);
          setAmount('');
          // Optional: Focus back to contributor logic handled via state clear if component supports it
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        handleSubmit(e);
    }
  }

  return (
    <div className="bg-white p-4 items-end gap-4 rounded-lg border shadow-sm flex flex-col md:flex-row">
      <div className="flex-1 w-full relative z-20">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contribuyente
        </label>
        <ContributorSelect 
            value={contributor} 
            onChange={(c) => {
                setContributor(c);
                if (c) {
                    setTimeout(() => amountInputRef.current?.focus(), 100);
                }
            }} 
            siteId={siteId}
            organizationId={organizationId}
        />
      </div>

      <div className="w-full md:w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto
        </label>
        <input
          ref={amountInputRef}
          type="number"
          step="0.01"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!contributor || !amount || isPending}
        className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Agregar
      </button>
    </div>
  );
}
