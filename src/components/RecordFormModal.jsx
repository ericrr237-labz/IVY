import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function RecordFormModal({ isOpen, onClose, type, onSave }) {
  const today = new Date().toISOString().slice(0,10);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState('Uncategorized');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(today);
      setCategory('Uncategorized');
      setNote('');
    }
  }, [isOpen, today]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return alert('Enter valid amount');
   await onSave({
  key: type,
  type, // 'expenses', 'cogs', etc.
  value: n,
  category: type === 'revenue' ? '' : category,
  note,
  createdAt: new Date(date),
});
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1e27] p-6 rounded-2xl shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="text-gray-400 hover:text-white" />
        </button>
        <h3 className="text-xl font-semibold mb-4 text-white">
          {type==='expenses' ? 'Add Expense' : type==='cogs' ? 'Add COGS' : 'Add Revenue'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300">Amount</label>
            <input type="number" step="0.01"
              className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
              value={amount} onChange={e=>setAmount(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Date</label>
            <input type="date"
              className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
              value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          {type!=='revenue' && (
            <div>
              <label className="block text-sm text-gray-300">Category</label>
              <select className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
                value={category} onChange={e=>setCategory(e.target.value)}>
                <option>Uncategorized</option>
                <option>Inventory / Ingredients</option>
                <option>Equipment</option>
                <option>Payroll / Labor</option>
                <option>Advertising / Marketing</option>
                <option>Software / Subscriptions</option>
                <option>Rent / Utilities</option>
                <option>Fees / Transaction Costs</option>
                <option>Miscellaneous</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-300">Notes (optional)</label>
            <textarea rows={3}
              className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
              value={note} onChange={e=>setNote(e.target.value)} />
          </div>
          <button type="submit"
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition font-semibold text-white">
            Save {type==='revenue'?'Revenue':type==='expenses'?'Expense':'COGS'}
          </button>
        </form>
      </div>
    </div>
  );
}