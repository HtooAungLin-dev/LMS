import React, { useState } from 'react';
import { User, AuditLog, UserRole } from '../types';
import { 
  Shield, 
  Users, 
  History, 
  Check, 
  X, 
  Lock, 
  Building2, 
  Globe, 
  Mail, 
  Key,
  ShieldCheck,
  Server
} from 'lucide-react';

interface AdminSystemViewProps {
  users: User[];
  auditLogs: AuditLog[];
}

export const AdminSystemView: React.FC<AdminSystemViewProps> = ({
  users,
  auditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'audit'>('users');

  const permissionsMatrix = [
    {
      feature: 'Catalog & Learning Item Authoring (CRUD)',
      admin: true,
      instructor: true,
      manager: false,
      learner: false,
      notes: 'Ability to create, publish, and delete enterprise courses & syllabi.'
    },
    {
      feature: 'Team Mandatory Course Assignment',
      admin: true,
      instructor: false,
      manager: true,
      learner: false,
      notes: 'Assign curricula to specific employees or whole departments.'
    },
    {
      feature: 'Tuition & External Course Approvals',
      admin: true,
      instructor: false,
      manager: true,
      learner: false,
      notes: 'Review budget impact and authorize employee enrollment requests.'
    },
    {
      feature: 'Organization Compliance Analytics & CSV Export',
      admin: true,
      instructor: false,
      manager: true,
      learner: false,
      notes: 'Access to ISO 27001, GDPR, and divisional SLA matrices.'
    },
    {
      feature: 'Course Launch & Knowledge Check Evaluation',
      admin: true,
      instructor: true,
      manager: true,
      learner: true,
      notes: 'Access interactive course player, take quizzes, & earn credentials.'
    },
    {
      feature: 'Verified Digital Certificate Issuance',
      admin: true,
      instructor: true,
      manager: true,
      learner: true,
      notes: 'Generate and print verified HAL certificates upon passing score.'
    },
    {
      feature: 'System Audit Logs & Security Governance',
      admin: true,
      instructor: false,
      manager: false,
      learner: false,
      notes: 'Strictly restricted to Global LMS Administrators.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
            <span>HAL SECURITY & GOVERNANCE</span>
            <span>•</span>
            <span className="text-purple-600 font-semibold">TENANT PRD-GLOBAL-042</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            System Administration & Role-Based Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Configure HAL identity mappings, inspect role privilege boundaries, and review immutable enterprise audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-white text-[#0070F2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            User Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'rbac' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RBAC Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: User Directory */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#0070F2]" />
              <h3 className="text-sm font-bold text-slate-900">
                Enterprise Personnel & Identity Roster
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Synced with HAL SuccessFactors Employee Central</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1b2a3a] text-slate-200 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">HAL PERNR</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Division / Department</th>
                  <th className="p-3.5">Job Title</th>
                  <th className="p-3.5">Work Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  let roleBadge = 'bg-sky-100 text-sky-800';
                  if (u.role === 'admin') roleBadge = 'bg-purple-100 text-purple-800 font-bold';
                  if (u.role === 'manager') roleBadge = 'bg-emerald-100 text-emerald-800 font-bold';
                  if (u.role === 'instructor') roleBadge = 'bg-blue-100 text-blue-800 font-bold';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 flex items-center space-x-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-600 font-medium">
                        {u.sapId}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${roleBadge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.department}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {u.jobTitle}
                      </td>
                      <td className="p-3.5 text-slate-500 flex items-center space-x-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.location}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Permissions Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Role-Based Access Control (RBAC) Permission Schema
              </h3>
            </div>
            <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Zero-Trust Principle Enforced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1b2a3a] text-slate-200 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Functional Scope</th>
                  <th className="p-3.5 text-center w-28 bg-purple-950/40">Administrator</th>
                  <th className="p-3.5 text-center w-28">Manager</th>
                  <th className="p-3.5 text-center w-28">Instructor</th>
                  <th className="p-3.5 text-center w-28">Learner</th>
                  <th className="p-3.5">Governance Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {permissionsMatrix.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900">
                      {p.feature}
                    </td>
                    <td className="p-3.5 text-center bg-purple-50/30">
                      {p.admin ? (
                        <Check className="w-4 h-4 text-purple-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {p.manager ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {p.instructor ? (
                        <Check className="w-4 h-4 text-blue-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {p.learner ? (
                        <Check className="w-4 h-4 text-sky-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-500">
                      {p.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Security & Configuration Audit Log
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">ISO 27001 Clause 12.4 Compliant</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition flex items-start space-x-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#0070F2] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-mono font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {log.entityType}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      by <strong>{log.actorName}</strong> ({log.actorRole})
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
