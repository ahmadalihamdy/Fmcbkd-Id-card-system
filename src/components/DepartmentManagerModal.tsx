import React, { useState } from 'react';
import { DepartmentItem } from '../types/idCard';
import { X, Plus, Edit2, Check, Trash2, RotateCcw, Building2 } from 'lucide-react';
import { INITIAL_DEPARTMENTS } from '../constants/initialData';

interface DepartmentManagerModalProps {
  isOpen: boolean;
  departments: DepartmentItem[];
  onUpdateDepartments: (newDepts: DepartmentItem[]) => void;
  onClose: () => void;
}

export const DepartmentManagerModal: React.FC<DepartmentManagerModalProps> = ({
  isOpen,
  departments,
  onUpdateDepartments,
  onClose,
}) => {
  const [newDeptName, setNewDeptName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const newItem: DepartmentItem = {
      id: `dept-${Date.now()}`,
      name: newDeptName.trim().toUpperCase(),
      isActive: true,
    };
    onUpdateDepartments([...departments, newItem]);
    setNewDeptName('');
  };

  const startEdit = (dept: DepartmentItem) => {
    setEditingId(dept.id);
    setEditingText(dept.name);
  };

  const saveEdit = (id: string) => {
    if (!editingText.trim()) return;
    onUpdateDepartments(
      departments.map((d) =>
        d.id === id ? { ...d, name: editingText.trim().toUpperCase() } : d
      )
    );
    setEditingId(null);
  };

  const toggleActive = (id: string) => {
    onUpdateDepartments(
      departments.map((d) =>
        d.id === id ? { ...d, isActive: !d.isActive } : d
      )
    );
  };

  const deleteDept = (id: string) => {
    onUpdateDepartments(departments.filter((d) => d.id !== id));
  };

  const resetToDefault = () => {
    if (
      window.confirm(
        'Reset department directory to standard FMC Birnin Kudu template list?'
      )
    ) {
      onUpdateDepartments(INITIAL_DEPARTMENTS);
    }
  };

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Department & Unit Directory
              </h3>
              <p className="text-xs text-gray-500">
                Manage FMC Birnin Kudu departments for staff ID cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice on Configurable Directory */}
        <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 text-amber-900 text-xs">
          <strong>Institutional Note:</strong> This is an authorized configurable
          department directory. IT Section operators can add, edit, or deactivate
          options as clinical and administrative units evolve.
        </div>

        {/* Add Department Form */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter new department or unit name..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase bg-white"
            />
            <button
              type="submit"
              disabled={!newDeptName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </button>
          </form>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search departments..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="border border-gray-200 rounded-md px-2.5 py-1 text-xs w-60 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
          <span className="text-xs text-gray-400">
            {filtered.length} department{filtered.length !== 1 ? 's' : ''} listed
          </span>
        </div>

        {/* Department List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No matching departments found.
            </div>
          ) : (
            filtered.map((dept) => (
              <div
                key={dept.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                  dept.isActive
                    ? 'bg-white border-gray-200 shadow-xs'
                    : 'bg-gray-100 border-gray-200 opacity-60'
                }`}
              >
                {editingId === dept.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 border border-blue-500 rounded px-2 py-1 text-xs font-semibold uppercase bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(dept.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-gray-400 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(dept.id)}
                      className={`w-3.5 h-3.5 rounded-full border ${
                        dept.isActive
                          ? 'bg-emerald-500 border-emerald-600'
                          : 'bg-gray-300 border-gray-400'
                      }`}
                      title={dept.isActive ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'}
                    />
                    <span
                      className={`font-semibold ${
                        dept.isActive ? 'text-gray-900' : 'text-gray-500 line-through'
                      }`}
                    >
                      {dept.name}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(dept)}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDept(dept.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={resetToDefault}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Standard FMC List
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
