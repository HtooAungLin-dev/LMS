import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Bell, 
  Search, 
  Shield, 
  UserCheck, 
  BookOpen, 
  GraduationCap, 
  ChevronDown, 
  Building2, 
  Globe, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SapShellBarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadAlertsCount: number;
  onOpenNotifications: () => void;
}

export const SapShellBar: React.FC<SapShellBarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  searchQuery,
  onSearchChange,
  unreadAlertsCount,
  onOpenNotifications
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator (Global)', bg: 'bg-purple-900 text-purple-200 border-purple-700', icon: Shield };
      case 'manager':
        return { label: 'People Manager', bg: 'bg-emerald-900 text-emerald-200 border-emerald-700', icon: UserCheck };
      case 'instructor':
        return { label: 'HAL Instructor / Author', bg: 'bg-blue-900 text-blue-200 border-blue-700', icon: BookOpen };
      case 'learner':
      default:
        return { label: 'Employee / Learner', bg: 'bg-sky-900 text-sky-200 border-sky-700', icon: GraduationCap };
    }
  };

  const badgeInfo = getRoleBadge(currentUser.role);
  const BadgeIcon = badgeInfo.icon;

  return (
    <header className="bg-[#1b2a3a] text-slate-100 border-b border-[#2a3f55] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand & System ID */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="bg-[#0070F2] text-white font-black text-xs px-2 py-1 rounded tracking-wider shadow-inner">
                HAL
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-sm tracking-tight text-white">SuccessFactors</span>
                  <span className="text-slate-400 text-xs font-normal">|</span>
                  <span className="text-[#64b5f6] text-xs font-semibold uppercase tracking-wider">Learning</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  PRD-EMEA-042 • Release 2H 2026
                </span>
              </div>
            </div>
          </div>

          {/* Enterprise Global Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="hal-global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search catalog, curricula, Item IDs, competencies..."
                className="block w-full pl-9 pr-3 py-1.5 border border-[#374f68] rounded-md text-xs bg-[#13202e] text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Header Actions: RBAC Switcher, Notifications, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* RBAC Role Switcher Button */}
            <div className="relative">
              <button
                id="rbac-role-switcher-btn"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs border transition ${badgeInfo.bg} hover:brightness-110`}
                title="Switch role to simulate permissions"
              >
                <BadgeIcon className="w-3.5 h-3.5" />
                <span className="font-medium hidden sm:inline">{badgeInfo.label}</span>
                <span className="font-medium sm:hidden uppercase">{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
              </button>

              {/* Role Dropdown */}
              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Role-Based Access Control (RBAC)
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Select a role persona to test permission scopes:
                    </p>
                  </div>
                  <div className="py-1">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                            isSelected ? 'bg-blue-50/70 border-l-4 border-[#0070F2]' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-semibold text-slate-900">{u.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-100 text-slate-600">
                                  {u.role.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{u.jobTitle}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0070F2] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              id="hal-shell-notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded text-slate-300 hover:text-white hover:bg-[#25394d] transition"
              title="HAL Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d9383a] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#1b2a3a]">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with dropdown */}
            <div className="relative">
              <button
                id="hal-user-profile-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 pl-1 pr-2 py-1 rounded hover:bg-[#25394d] transition text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-400"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{currentUser.sapId}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
              </button>

              {profileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-3 z-50 text-slate-800"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <div className="px-4 pb-3 border-b border-slate-100 flex items-center space-x-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{currentUser.name}</h4>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono bg-blue-50 text-[#0070F2] font-semibold px-1.5 py-0.5 rounded border border-blue-200">
                        {currentUser.sapId}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 text-xs text-slate-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentUser.department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentUser.location}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 px-2">
                    <div className="px-2 py-1 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Enterprise Permissions
                    </div>
                    <div className="px-2 py-1 text-xs text-slate-600 bg-slate-50 rounded mx-1">
                      {currentUser.role === 'admin' && 'Full write permissions on catalogs, users, compliance rules & schemas.'}
                      {currentUser.role === 'manager' && 'Permissions to view team compliance, approve enrollment requests, & assign curricula.'}
                      {currentUser.role === 'instructor' && 'Permissions to author courses, edit syllabi, and grade quiz submissions.'}
                      {currentUser.role === 'learner' && 'Standard learner access: enroll, launch courses, complete quizzes & print certificates.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
