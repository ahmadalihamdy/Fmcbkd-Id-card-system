import React, { useState } from 'react';
import { StaffData, IDType, PrintStatus } from '../types/idCard';
import {
  X,
  Search,
  UserCheck,
  Trash2,
  Download,
  Upload,
  Calendar,
  Building,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SavedRecordsModalProps {
  isOpen: boolean;
  records: StaffData[];
  onLoadRecord: (record: StaffData) => void;
  onDeleteRecord: (recordId: string) => void;
  onUpdateRecordStatus: (recordId: string, newStatus: PrintStatus) => void;
  onPrintRecordDirectly: (record: StaffData) => void;
  onImportRecords: (records: StaffData[]) => void;
  onClose: () => void;
}

export const SavedRecordsModal: React.FC<SavedRecordsModalProps> = ({
  isOpen,
  records,
  onLoadRecord,
  onDeleteRecord,
  onUpdateRecordStatus,
  onPrintRecordDirectly,
  onImportRecords,
  onClose,
}) => {
  // Category tabs: All Records, Not Printed, Printed
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOT_PRINTED' | 'PRINTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | IDType>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'dateCreated' | 'lastPrintedDate'>('dateCreated');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  if (!isOpen) return null;

  // Counts for tabs
  const countAll = records.length;
  const countNotPrinted = records.filter(
    (r) => r.printStatus === 'Not Printed' || r.printStatus === 'Not Printed / Updated'
  ).length;
  const countPrinted = records.filter((r) => r.printStatus === 'Printed').length;

  // Unique departments for filter
  const departments = Array.from(new Set(records.map((r) => r.department).filter(Boolean)));

  // Filter logic
  const filtered = records.filter((r) => {
    // Tab filter
    if (activeTab === 'NOT_PRINTED') {
      if (r.printStatus === 'Printed') return false;
    } else if (activeTab === 'PRINTED') {
      if (r.printStatus !== 'Printed') return false;
    }

    // Type filter
    if (typeFilter !== 'ALL' && r.idType !== typeFilter) return false;

    // Dept filter
    if (deptFilter !== 'ALL' && r.department !== deptFilter) return false;

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matches =
        (r.fullName && r.fullName.toLowerCase().includes(q)) ||
        (r.idNumber && r.idNumber.toLowerCase().includes(q)) ||
        (r.department && r.department.toLowerCase().includes(q)) ||
        (r.designation && r.designation.toLowerCase().includes(q));
      if (!matches) return false;
    }

    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    const valA =
      sortBy === 'lastPrintedDate'
        ? a.lastPrintedDate || ''
        : a.dateCreated || '';
    const valB =
      sortBy === 'lastPrintedDate'
        ? b.lastPrintedDate || ''
        : b.dateCreated || '';

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `FMCBKD_Staff_Records_Archive_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportRecords(parsed);
          alert(`Successfully imported ${parsed.length} staff records into archive!`);
        } else {
          alert('Invalid file format: Expected an array of staff records.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                ID Card Archive Record
                <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {records.length} Total
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Track printed vs. not printed cards, reprint, search, and manage staff identities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              disabled={records.length === 0}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-xs"
              title="Backup full archive as JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Export JSON Backup
            </button>

            <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              Import Records
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section 2.B: Archive Management Category Tabs with record counts */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Tab 1: All Records */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-200/80 border border-gray-200'
              }`}
            >
              All Records
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'ALL'
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {countAll}
              </span>
            </button>

            {/* Tab 2: Not Printed */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('NOT_PRINTED');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'NOT_PRINTED'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-200/80 border border-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Not Printed
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'NOT_PRINTED'
                    ? 'bg-amber-800 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {countNotPrinted}
              </span>
            </button>

            {/* Tab 3: Printed */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('PRINTED');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PRINTED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-200/80 border border-gray-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Printed
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'PRINTED'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {countPrinted}
              </span>
            </button>
          </div>

          {/* Quick info note */}
          <span className="text-[11px] text-gray-500 font-medium">
            Showing {sorted.length} matching record{sorted.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Section 2.D: Search and Filters Toolbar */}
        <div className="p-3 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID number, full name, or designation..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            />
          </div>

          {/* Filter by ID Type (SSA, LCM, Intern) */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-semibold text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'ALL' | IDType);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white text-gray-800 focus:outline-hidden"
            >
              <option value="ALL">All Types</option>
              <option value="SSA">SSA Only</option>
              <option value="LCM">LCM Only</option>
              <option value="Intern">Intern Only</option>
            </select>
          </div>

          {/* Filter by Department */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-semibold text-[11px]">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white text-gray-800 max-w-[150px] truncate focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-semibold text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dateCreated' | 'lastPrintedDate')}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-white text-gray-800 focus:outline-hidden"
            >
              <option value="dateCreated">Creation Date</option>
              <option value="lastPrintedDate">Last Printed Date</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
              title={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section 2.C: Archive Table */}
        <div className="flex-1 overflow-y-auto">
          {paginated.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <CreditCard className="w-12 h-12 text-gray-300 mb-2 stroke-[1.2]" />
              <p className="font-bold text-gray-600 text-sm">No Matching ID Records</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                {records.length === 0
                  ? 'No staff records have been saved yet. Save a card from the workstation to add it to this archive.'
                  : 'Try adjusting your search keywords or clearing active filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">ID Number</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">ID Type</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Date Created</th>
                  <th className="py-2.5 px-3">Print Status</th>
                  <th className="py-2.5 px-3">Last Printed</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((rec, index) => {
                  const recordKey = rec.id || `${rec.idNumber}-${index}`;

                  return (
                    <tr
                      key={recordKey}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      {/* ID Number */}
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {rec.idNumber || <span className="text-gray-400">—</span>}
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-3 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{rec.fullName || 'Untitled Staff'}</span>
                          {rec.photoUrl && (
                            <span className="w-2 h-2 rounded-full bg-blue-500" title="Photo attached" />
                          )}
                          {rec.signatureUrl && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Signature attached" />
                          )}
                        </div>
                        <span className="text-[10.5px] text-gray-500 font-normal block">
                          {rec.designation || 'No Designation'}
                        </span>
                      </td>

                      {/* ID Type Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                            rec.idType === 'SSA'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : rec.idType === 'LCM'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {rec.idType}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 text-gray-700 font-medium">
                        {rec.department || <span className="text-gray-400">—</span>}
                      </td>

                      {/* Date Created */}
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                        {rec.dateCreated
                          ? new Date(rec.dateCreated).toLocaleDateString()
                          : '—'}
                      </td>

                      {/* Print Status Badge */}
                      <td className="py-3 px-3">
                        {rec.printStatus === 'Printed' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Printed
                          </span>
                        ) : rec.printStatus === 'Not Printed / Updated' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Updated / Reprint
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Not Printed
                          </span>
                        )}
                      </td>

                      {/* Last Printed Date */}
                      <td className="py-3 px-3 text-gray-500 text-[11px] font-mono">
                        {rec.lastPrintedDate ? (
                          <div>
                            <div>{new Date(rec.lastPrintedDate).toLocaleDateString()}</div>
                            <div className="text-[10px] text-gray-400">
                              {new Date(rec.lastPrintedDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {rec.printCount ? ` • ${rec.printCount}x` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-sans italic">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Load into Workstation */}
                          <button
                            type="button"
                            onClick={() => {
                              onLoadRecord(rec);
                              onClose();
                            }}
                            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-[11px] transition-colors"
                            title="Load record into editor"
                          >
                            <UserCheck className="w-3 h-3" />
                            Edit / Preview
                          </button>

                          {/* Quick Print / Reprint */}
                          <button
                            type="button"
                            onClick={() => {
                              onPrintRecordDirectly(rec);
                            }}
                            className="p-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                            title="Print / Reprint Card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Status (Mark as Printed / Not Printed) */}
                          <button
                            type="button"
                            onClick={() => {
                              const newStatus =
                                rec.printStatus === 'Printed'
                                  ? 'Not Printed'
                                  : 'Printed';
                              if (
                                window.confirm(
                                  `Change status for ${rec.fullName} to "${newStatus}"?`
                                )
                              ) {
                                onUpdateRecordStatus(recordKey, newStatus);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title={
                              rec.printStatus === 'Printed'
                                ? 'Mark as Not Printed'
                                : 'Mark as Printed'
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete the record for "${rec.fullName}" (#${rec.idNumber})?`
                                )
                              ) {
                                onDeleteRecord(recordKey);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 2.D: Pagination & Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <span>•</span>
            <span>{filtered.length} total filtered records</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Close Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
