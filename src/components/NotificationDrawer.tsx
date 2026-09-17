import React from 'react';
import { User, Enrollment, Course, ApprovalRequest } from '../types';
import { X, Bell, AlertTriangle, CheckCircle2, Clock, Award, ChevronRight } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  enrollments: Enrollment[];
  courses: Course[];
  approvals: ApprovalRequest[];
  onNavigateTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  enrollments,
  courses,
  approvals,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  // Build notifications
  const userOverdue = enrollments.filter(e => e.userId === currentUser.id && e.status === 'Overdue');
  const userCompleted = enrollments.filter(e => e.userId === currentUser.id && e.status === 'Completed' && e.certificateId);
  const managerPending = (currentUser.role === 'manager' || currentUser.role === 'admin') 
    ? approvals.filter(a => a.status === 'Pending') 
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-[#1b2a3a] text-white p-4 flex items-center justify-between border-b border-[#2a3f55]">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#0070F2]" />
            <h3 className="font-bold text-sm">HAL Notification Center</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {/* Overdue Alerts */}
          {userOverdue.map(enr => {
            const course = courses.find(c => c.id === enr.courseId);
            return (
              <div key={enr.id} className="p-3.5 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-red-900">Overdue Mandatory Training</div>
                    <p className="text-slate-700 mt-0.5">{course?.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-red-700">
                      <span>Due Date: {enr.dueDate}</span>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab('my-learning');
                        }}
                        className="font-semibold underline"
                      >
                        Take Action
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Manager Pending Approvals */}
          {managerPending.map(appr => (
            <div key={appr.id} className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-amber-900">Approval Required</div>
                  <p className="text-slate-700 mt-0.5">
                    <strong>{appr.userName}</strong> requested enrollment for <em>{appr.courseTitle}</em>
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-amber-800">
                    <span>Cost: {appr.cost}</span>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('manager');
                      }}
                      className="font-semibold underline"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Certificate Awarded */}
          {userCompleted.map(enr => {
            const course = courses.find(c => c.id === enr.courseId);
            return (
              <div key={enr.id} className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start space-x-2.5">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-emerald-900">Certificate Credential Issued</div>
                    <p className="text-slate-700 mt-0.5">{course?.title}</p>
                    <div className="mt-1 text-[11px] font-mono text-emerald-700">
                      ID: {enr.certificateId}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {userOverdue.length === 0 && managerPending.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No critical action items at this moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
