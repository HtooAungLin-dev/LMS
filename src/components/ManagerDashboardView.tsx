import React, { useState } from 'react';
import { User, Course, Enrollment, ApprovalRequest } from '../types';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  XCircle, 
  ChevronRight, 
  Send,
  UserCheck,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';

interface ManagerDashboardViewProps {
  currentUser: User;
  allUsers: User[];
  courses: Course[];
  enrollments: Enrollment[];
  approvals: ApprovalRequest[];
  onDecideApproval: (id: string, decision: 'Approved' | 'Rejected') => Promise<void>;
  onOpenAssignModal: (course?: Course) => void;
  onLaunchCourse: (course: Course, enr: Enrollment) => void;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({
  currentUser,
  allUsers,
  courses,
  enrollments,
  approvals,
  onDecideApproval,
  onOpenAssignModal,
  onLaunchCourse
}) => {
  // Direct reports (or same department learners)
  const teamMembers = allUsers.filter(u => u.role === 'learner' && (u.managerId === currentUser.id || u.department === currentUser.department));

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprovalAction = async (id: string, decision: 'Approved' | 'Rejected') => {
    setProcessingId(id);
    await onDecideApproval(id, decision);
    setProcessingId(null);
  };

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
            <span>HAL SUCCESSFACTORS</span>
            <span>•</span>
            <span className="text-[#0070F2] font-semibold">PEOPLE MANAGER COCKPIT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Team Compliance & Approval Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Monitor direct reports in {currentUser.department}, approve sponsored external courses, and enforce mandatory compliance rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="manager-assign-training-btn"
            onClick={() => onOpenAssignModal()}
            className="px-4 py-2 bg-[#0070F2] hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-xs flex items-center space-x-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>Assign Training to Team</span>
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Direct Reports</span>
            <Users className="w-4 h-4 text-[#0070F2]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{teamMembers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active employees under supervision
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requests awaiting your manager authorization
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Department Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">92.4%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Exceeding 90% SLA target
          </div>
        </div>
      </div>

      {/* Section 1: Pending Approvals Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Pending Course Enrollment & Tuition Approvals ({pendingApprovals.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Workflow Engine 2H 2026</span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-slate-700">No pending approval requests</p>
            <p className="text-slate-400 mt-0.5">All direct report requests have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{req.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({req.userDepartment})</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.2 rounded-full">
                      Requested: {req.requestDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#0070F2]">{req.courseTitle}</h4>
                  <div className="text-[11px] text-slate-500">
                    Budget Impact: <strong className="text-slate-700">{req.cost}</strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    disabled={processingId === req.id}
                    onClick={() => handleApprovalAction(req.id, 'Approved')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-xs flex items-center space-x-1 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    disabled={processingId === req.id}
                    onClick={() => handleApprovalAction(req.id, 'Rejected')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Team Members & Direct Reports Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Supervised Team Members ({teamMembers.length})
            </h3>
            <p className="text-xs text-slate-500">
              Individual compliance radar and curriculum progression.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {teamMembers.map((member) => {
            const memberEnr = enrollments.filter(e => e.userId === member.id);
            const completedCount = memberEnr.filter(e => e.status === 'Completed').length;
            const overdueCount = memberEnr.filter(e => e.status === 'Overdue').length;
            const inProgressCount = memberEnr.filter(e => e.status === 'In Progress').length;
            const compRate = memberEnr.length > 0 ? Math.round((completedCount / memberEnr.length) * 100) : 100;

            return (
              <div
                key={member.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{member.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{member.jobTitle}</p>
                    <span className="text-[10px] font-mono text-[#0070F2]">{member.sapId}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Curricula Compliance:</span>
                    <strong className={compRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                      {compRate}%
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${compRate >= 80 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${compRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{completedCount} Done</span>
                    <span>{inProgressCount} Active</span>
                    <span className={overdueCount > 0 ? 'text-red-600 font-bold' : ''}>
                      {overdueCount} Overdue
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAssignModal()}
                  className="w-full py-1 text-center text-xs font-medium text-[#0070F2] bg-blue-50/60 hover:bg-blue-100/80 rounded border border-blue-200 transition"
                >
                  Assign Target Course
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
