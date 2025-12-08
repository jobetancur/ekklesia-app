import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BatchList from '@/features/finance/tithes/components/BatchList';
import BatchEditor from '@/features/finance/tithes/components/BatchEditor';

export default function TithesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Routes>
        <Route index element={<BatchList />} />
        <Route path=":batchId" element={<BatchEditor />} />
      </Routes>
    </div>
  );
}
