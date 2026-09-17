import React, { useState } from 'react';
import { Course, User } from '../types';
import { X, Send, Users, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AssignTrainingModalProps {
  initialCourse?: Course | null;
  courses: Course[];
  users: User[];
  onClose: () => void;
  onAssign: (courseId: string, userIds: string[], dueDate: string) => Promise<void>;
  currentUser: User;
}

export const AssignTrainingModal: React.FC<AssignTrainingModalProps> = ({
  initialCourse,
  courses,
  users,
  onClose,
  onAssign,
  currentUser
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourse?.id || courses[0]?.id || '');
  const [targetType, setTargetType] = useState<'users' | 'department'>('users');
  const [selectedDepartment, setSelectedDepartment] = useState('Cloud & Cyber Engineering');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('2026-11-30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const learners = users.filter(u => u.role === 'learner');
  const departments = Array.from(new Set(learners.map(u => u.department)));

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSelectAllInDepartment = () => {
    const deptUserIds = learners.filter(u => u.department === selectedDepartment).map(u => u.id);
    setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...deptUserIds])));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUserIds: string[] = [];

    if (targetType === 'department') {
      finalUserIds = learners.filter(u => u.department === selectedDepartment).map(u => u.id);
    } else {
      finalUserIds = selectedUserIds;
    }

    if (finalUserIds.length === 0) {
      setErrorMsg('Please select at least one recipient or department.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onAssign(selectedCourseId, finalUserIds, dueDate);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1b2a3a] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#2a3f55]">
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-[#0070F2]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                HAL Assignment Profile Wizard
              </h2>
              <p className="text-xs text-slate-300">
                Deploy Curricula to Teams & Direct Reports
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Course */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Enterprise Learning Item *
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] bg-white font-medium text-slate-800"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.itemId}] {c.title} ({c.creditHours} hrs)
                </option>
              ))}
            </select>
            {targetCourse && (
              <div className="mt-1 text-[11px] text-slate-500">
                Category: <strong>{targetCourse.category}</strong> • Method: <strong>{targetCourse.deliveryMethod}</strong>
              </div>
            )}
          </div>

          {/* Target Audience Mode */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Assignment Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('department')}
                className={`py-2 px-3 rounded border text-center font-medium transition ${
                  targetType === 'department'
                    ? 'bg-blue-50 border-[#0070F2] text-[#0070F2]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Entire Division / Dept
              </button>
              <button
                type="button"
                onClick={() => setTargetType('users')}
                className={`py-2 px-3 rounded border text-center font-medium transition ${
                  targetType === 'users'
                    ? 'bg-blue-50 border-[#0070F2] text-[#0070F2]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Specific Learners ({selectedUserIds.length})
              </button>
            </div>
          </div>

          {/* Department Selection */}
          {targetType === 'department' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] bg-white"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Will assign to all {learners.filter(u => u.department === selectedDepartment).length} active employees in this unit.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Select Team Members
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds(learners.map(l => l.id))}
                  className="text-[11px] text-[#0070F2] hover:underline"
                >
                  Select All
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100 p-1">
                {learners.map(l => {
                  const isChecked = selectedUserIds.includes(l.id);
                  return (
                    <label
                      key={l.id}
                      className="flex items-center space-x-2.5 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleUser(l.id)}
                        className="rounded text-[#0070F2] focus:ring-[#0070F2]"
                      />
                      <img src={l.avatar} alt={l.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">{l.name}</div>
                        <div className="text-[10px] text-slate-400">{l.department} • {l.sapId}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Regulatory SLA Due Date *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] bg-white font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0070F2] hover:bg-blue-600 text-white font-semibold rounded shadow-xs flex items-center space-x-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Executing Rule...' : 'Execute Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
