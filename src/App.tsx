/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Course, Enrollment, AuditLog, ApprovalRequest, DepartmentCompliance, UserRole } from './types';
import { api } from './lib/api';
import { SapShellBar } from './components/SapShellBar';
import { MyLearningView } from './components/MyLearningView';
import { CourseCatalogView } from './components/CourseCatalogView';
import { AdvancedReportingView } from './components/AdvancedReportingView';
import { ManagerDashboardView } from './components/ManagerDashboardView';
import { AdminSystemView } from './components/AdminSystemView';
import { CoursePlayerModal } from './components/CoursePlayerModal';
import { CourseEditorModal } from './components/CourseEditorModal';
import { CertificateModal } from './components/CertificateModal';
import { AssignTrainingModal } from './components/AssignTrainingModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departmentReports, setDepartmentReports] = useState<DepartmentCompliance[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>('my-learning');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Active Modals
  const [activePlayerCourse, setActivePlayerCourse] = useState<{ course: Course; enrollment?: Enrollment } | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<{ course: Course; enrollment: Enrollment } | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null | undefined>(undefined); // undefined means closed, null means create new
  const [assignModalCourse, setAssignModalCourse] = useState<Course | null | undefined>(undefined);

  // Load initial data from Express backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [uList, cList, eList, aList, dList, logs] = await Promise.all([
        api.getUsers(),
        api.getCourses(),
        api.getEnrollments(),
        api.getApprovals(),
        api.getDepartmentReports(),
        api.getAuditLogs()
      ]);

      setUsers(uList);
      setCourses(cList);
      setEnrollments(eList);
      setApprovals(aList);
      setDepartmentReports(dList);
      setAuditLogs(logs);

      // Default to Sophia Chen (learner) or keep current selected user
      if (!currentUser && uList.length > 0) {
        const defaultUser = uList.find(u => u.id === 'usr-4') || uList[0];
        setCurrentUser(defaultUser);
      }
    } catch (err) {
      console.error('Failed to load LMS data from Express backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When switching user role, make sure active tab is appropriate
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'learner' && (activeTab === 'manager' || activeTab === 'admin')) {
      setActiveTab('my-learning');
    } else if (user.role === 'manager' && activeTab === 'admin') {
      setActiveTab('manager');
    }
  };

  // Launch Course Player
  const handleLaunchCourse = (course: Course, enrollment?: Enrollment) => {
    // If user is not yet enrolled, create enrollment first
    if (!enrollment && currentUser) {
      handleSelfEnroll(course.id).then(() => {
        // Find newly created enrollment
        const enr = enrollments.find(e => e.courseId === course.id && e.userId === currentUser.id);
        setActivePlayerCourse({ course, enrollment: enr });
      });
      return;
    }
    setActivePlayerCourse({ course, enrollment });
  };

  // Self-enroll action
  const handleSelfEnroll = async (courseId: string) => {
    if (!currentUser) return;
    try {
      await api.assignCourse({
        courseId,
        userIds: [currentUser.id],
        assignedBy: 'Self-Enrollment',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      await loadData();
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  // Update Progress in active player
  const handleUpdateProgress = async (enrollmentId: string, moduleId: string, quizScore?: number, isFinal?: boolean) => {
    try {
      const updated = await api.updateProgress(enrollmentId, { moduleId, quizScore, isFinal });
      setEnrollments(prev => prev.map(e => e.id === updated.id ? updated : e));
      if (activePlayerCourse) {
        setActivePlayerCourse({
          ...activePlayerCourse,
          enrollment: updated
        });
      }
      // Reload reporting and department metrics
      const [dList, logs] = await Promise.all([
        api.getDepartmentReports(),
        api.getAuditLogs()
      ]);
      setDepartmentReports(dList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Update progress error:', err);
    }
  };

  // Save or Update Course in catalog
  const handleSaveCourse = async (courseData: Partial<Course>) => {
    try {
      if (editingCourse?.id) {
        await api.updateCourse(editingCourse.id, {
          ...courseData,
          actorName: currentUser?.name || 'Administrator',
          actorRole: currentUser?.role || 'admin'
        });
      } else {
        await api.createCourse({
          ...courseData,
          actorName: currentUser?.name || 'Administrator',
          actorRole: currentUser?.role || 'admin'
        });
      }
      setEditingCourse(undefined);
      await loadData();
    } catch (err) {
      console.error('Save course error:', err);
      throw err;
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to retire and remove this learning item from the SAP catalog?')) return;
    try {
      await api.deleteCourse(courseId);
      await loadData();
    } catch (err) {
      console.error('Delete course error:', err);
    }
  };

  // Manager Approval decision
  const handleDecideApproval = async (id: string, decision: 'Approved' | 'Rejected') => {
    try {
      await api.decideApproval(id, decision);
      await loadData();
    } catch (err) {
      console.error('Approval decision error:', err);
    }
  };

  // Assign Course action from modal
  const handleAssignCourse = async (courseId: string, userIds: string[], dueDate: string) => {
    try {
      await api.assignCourse({
        courseId,
        userIds,
        assignedBy: `${currentUser?.name} (${currentUser?.jobTitle})`,
        dueDate
      });
      await loadData();
      setAssignModalCourse(undefined);
    } catch (err) {
      console.error('Assign course error:', err);
      throw err;
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md text-center max-w-sm">
          <div className="w-10 h-10 border-3 border-[#0070F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h2 className="text-sm font-bold text-slate-800">Connecting to HAL SuccessFactors Learning</h2>
          <p className="text-xs text-slate-500 mt-1">Initializing Express REST services & enterprise tenant credentials...</p>
        </div>
      </div>
    );
  }

  // Count unread alerts
  const userOverdue = enrollments.filter(e => e.userId === currentUser.id && e.status === 'Overdue');
  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const unreadAlertsCount = userOverdue.length + ((currentUser.role === 'manager' || currentUser.role === 'admin') ? pendingApprovals.length : 0);

  // Tab permissions
  const showManagerTab = currentUser.role === 'manager' || currentUser.role === 'admin';
  const showAdminTab = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-800 flex flex-col font-sans">
      {/* 1. SAP Shell Bar (Enterprise Top Navigation) */}
      <SapShellBar
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        unreadAlertsCount={unreadAlertsCount}
        onOpenNotifications={() => setNotificationOpen(true)}
      />

      {/* 2. RBAC Persona Simulation Notice Bar */}
      <div className="bg-[#eef5fd] border-b border-[#c2ddf9] px-4 py-2 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#0070F2] shrink-0" />
            <span>
              <strong>Active RBAC Persona:</strong> {currentUser.name} ({currentUser.role.toUpperCase()}) • {currentUser.jobTitle}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] overflow-x-auto pb-0.5 sm:pb-0">
            <span className="text-slate-500 font-medium">Quick Persona Switch:</span>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className={`px-2 py-0.5 rounded border transition whitespace-nowrap ${
                  u.id === currentUser.id 
                    ? 'bg-[#0070F2] text-white border-[#0070F2] font-semibold' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {u.name.split(' ')[0]} ({u.role})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. HAL Sub-Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto">
            <button
              id="tab-my-learning"
              onClick={() => setActiveTab('my-learning')}
              className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 whitespace-nowrap transition ${
                activeTab === 'my-learning'
                  ? 'border-[#0070F2] text-[#0070F2] font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>My Learning</span>
              {userOverdue.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {userOverdue.length}
                </span>
              )}
            </button>

            <button
              id="tab-course-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 whitespace-nowrap transition ${
                activeTab === 'catalog'
                  ? 'border-[#0070F2] text-[#0070F2] font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Catalog & Management</span>
              <span className="text-[11px] text-slate-400 font-mono">({courses.length})</span>
            </button>

            <button
              id="tab-advanced-reporting"
              onClick={() => setActiveTab('reporting')}
              className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 whitespace-nowrap transition ${
                activeTab === 'reporting'
                  ? 'border-[#0070F2] text-[#0070F2] font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Advanced Analytics & Reports</span>
            </button>

            {showManagerTab && (
              <button
                id="tab-manager-approvals"
                onClick={() => setActiveTab('manager')}
                className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 whitespace-nowrap transition ${
                  activeTab === 'manager'
                    ? 'border-[#0070F2] text-[#0070F2] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team & Approvals</span>
                {pendingApprovals.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}

            {showAdminTab && (
              <button
                id="tab-admin-system"
                onClick={() => setActiveTab('admin')}
                className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 whitespace-nowrap transition ${
                  activeTab === 'admin'
                    ? 'border-[#0070F2] text-[#0070F2] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>System Admin & RBAC</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 4. Main Views Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'my-learning' && (
          <MyLearningView
            currentUser={currentUser}
            courses={courses}
            enrollments={enrollments}
            onLaunchCourse={handleLaunchCourse}
            onViewCertificate={(certId, course, enr) => setActiveCertificate({ course, enrollment: enr })}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'catalog' && (
          <CourseCatalogView
            currentUser={currentUser}
            courses={courses}
            enrollments={enrollments}
            onLaunchCourse={handleLaunchCourse}
            onOpenCreateCourse={() => setEditingCourse(null)}
            onOpenEditCourse={(course) => setEditingCourse(course)}
            onDeleteCourse={handleDeleteCourse}
            onEnroll={handleSelfEnroll}
            onOpenAssignModal={(course) => setAssignModalCourse(course)}
          />
        )}

        {activeTab === 'reporting' && (
          <AdvancedReportingView
            courses={courses}
            enrollments={enrollments}
            users={users}
            departmentReports={departmentReports}
          />
        )}

        {activeTab === 'manager' && showManagerTab && (
          <ManagerDashboardView
            currentUser={currentUser}
            allUsers={users}
            courses={courses}
            enrollments={enrollments}
            approvals={approvals}
            onDecideApproval={handleDecideApproval}
            onOpenAssignModal={(course) => setAssignModalCourse(course || null)}
            onLaunchCourse={handleLaunchCourse}
          />
        )}

        {activeTab === 'admin' && showAdminTab && (
          <AdminSystemView
            users={users}
            auditLogs={auditLogs}
          />
        )}
      </main>

      {/* 5. Modals & Overlay Workflows */}

      {/* Course Player Modal */}
      {activePlayerCourse && (
        <CoursePlayerModal
          course={activePlayerCourse.course}
          enrollment={activePlayerCourse.enrollment}
          onClose={() => setActivePlayerCourse(null)}
          onUpdateProgress={handleUpdateProgress}
          onViewCertificate={(certId) => {
            if (activePlayerCourse.enrollment) {
              setActiveCertificate({
                course: activePlayerCourse.course,
                enrollment: activePlayerCourse.enrollment
              });
            }
          }}
        />
      )}

      {/* Verified Certificate Modal */}
      {activeCertificate && (
        <CertificateModal
          course={activeCertificate.course}
          enrollment={activeCertificate.enrollment}
          user={currentUser}
          onClose={() => setActiveCertificate(null)}
        />
      )}

      {/* Course Authoring / Editor Modal */}
      {editingCourse !== undefined && (
        <CourseEditorModal
          course={editingCourse}
          currentUserRole={currentUser.role}
          onClose={() => setEditingCourse(undefined)}
          onSave={handleSaveCourse}
        />
      )}

      {/* Bulk Assign Training Modal */}
      {assignModalCourse !== undefined && (
        <AssignTrainingModal
          initialCourse={assignModalCourse}
          courses={courses}
          users={users}
          currentUser={currentUser}
          onClose={() => setAssignModalCourse(undefined)}
          onAssign={handleAssignCourse}
        />
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        currentUser={currentUser}
        enrollments={enrollments}
        courses={courses}
        approvals={approvals}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setNotificationOpen(false);
        }}
      />
    </div>
  );
}
