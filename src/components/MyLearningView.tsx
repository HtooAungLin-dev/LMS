import React, { useState } from 'react';
import { Course, Enrollment, User } from '../types';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award, 
  Calendar, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface MyLearningViewProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  onLaunchCourse: (course: Course, enrollment: Enrollment) => void;
  onViewCertificate: (certId: string, course: Course, enrollment: Enrollment) => void;
  onNavigateToCatalog: () => void;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  currentUser,
  courses,
  enrollments,
  onLaunchCourse,
  onViewCertificate,
  onNavigateToCatalog
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Mandatory' | 'InProgress' | 'Completed'>('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Enrollments for this user
  const userEnrollments = enrollments.filter(e => e.userId === currentUser.id);

  const enrichedItems = userEnrollments.map(enr => {
    const course = courses.find(c => c.id === enr.courseId);
    return {
      enrollment: enr,
      course: course!
    };
  }).filter(item => item.course !== undefined);

  // Filter items
  const filteredItems = enrichedItems.filter(({ enrollment, course }) => {
    if (filterTab === 'Mandatory' && !course.isMandatory) return false;
    if (filterTab === 'InProgress' && enrollment.status !== 'In Progress') return false;
    if (filterTab === 'Completed' && enrollment.status !== 'Completed') return false;

    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.itemId.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate metrics
  const totalAssigned = userEnrollments.length;
  const completedCount = userEnrollments.filter(e => e.status === 'Completed').length;
  const overdueCount = userEnrollments.filter(e => e.status === 'Overdue').length;
  const mandatoryCount = enrichedItems.filter(i => i.course.isMandatory && i.enrollment.status !== 'Completed').length;
  const earnedCredits = enrichedItems
    .filter(i => i.enrollment.status === 'Completed')
    .reduce((sum, i) => sum + i.course.creditHours, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Fiori Horizon Welcome Header */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
            <span>EMPLOYEE WORKSPACE</span>
            <span>•</span>
            <span className="text-[#0070F2] font-semibold">{currentUser.sapId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            You have <strong className="text-slate-900">{mandatoryCount} required compliance items</strong> pending. Review your training curricula and certification milestones below.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToCatalog}
            className="px-4 py-2 bg-[#0070F2] hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-xs flex items-center space-x-2 transition"
          >
            <span>Explore Course Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SAP Fiori KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Required Compliance</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{mandatoryCount}</div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            {overdueCount > 0 ? `${overdueCount} Overdue Item!` : 'All deadlines active'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">In-Progress Programs</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {userEnrollments.filter(e => e.status === 'In Progress').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active syllabus modules
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Completed Programs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {Math.round((completedCount / (totalAssigned || 1)) * 100)}% Curricula Fulfillment
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">CPE Credits Earned</span>
            <Award className="w-4 h-4 text-[#0070F2]" />
          </div>
          <div className="text-2xl font-bold text-[#0070F2]">{earnedCredits.toFixed(1)} hrs</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Official credit recorded
          </div>
        </div>
      </div>

      {/* Main Section: My Learning Curriculum & To-Do List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table/List Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab('All')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${
                filterTab === 'All'
                  ? 'bg-white text-[#0070F2] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Curricula ({enrichedItems.length})
            </button>
            <button
              onClick={() => setFilterTab('Mandatory')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${
                filterTab === 'Mandatory'
                  ? 'bg-white text-red-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mandatory Compliance
            </button>
            <button
              onClick={() => setFilterTab('InProgress')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${
                filterTab === 'InProgress'
                  ? 'bg-white text-amber-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterTab('Completed')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${
                filterTab === 'Completed'
                  ? 'bg-white text-emerald-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed & Certificates
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter my assignments..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
            />
          </div>
        </div>

        {/* Learning Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No learning items in this category</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Explore the HAL Enterprise Catalog to enroll in continuous development and technical specializations.
            </p>
            <button
              onClick={onNavigateToCatalog}
              className="mt-4 px-4 py-1.5 bg-[#0070F2] text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map(({ enrollment, course }) => {
              const isOverdue = enrollment.status === 'Overdue';
              const isDone = enrollment.status === 'Completed';

              return (
                <div
                  key={enrollment.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200 shadow-xs"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                        <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {course.itemId}
                        </span>
                        {course.isMandatory && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Mandatory Compliance
                          </span>
                        )}
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {course.deliveryMethod}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {course.title}
                      </h3>

                      <div className="mt-1.5 flex items-center space-x-4 text-xs text-slate-500 flex-wrap gap-y-1">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Due: <strong className={`ml-1 ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>{enrollment.dueDate}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {course.creditHours} hrs credit
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-400">
                          Assigned via: {enrollment.assignedBy}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2.5 max-w-md">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>Curriculum Progress</span>
                          <span className="font-semibold text-slate-700">{enrollment.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-600' : isOverdue ? 'bg-red-500' : 'bg-[#0070F2]'
                            }`}
                            style={{ width: `${enrollment.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 space-y-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isOverdue
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-[#0070F2] border border-blue-200'
                    }`}>
                      {enrollment.status}
                    </span>

                    <div className="flex items-center space-x-2">
                      {isDone && enrollment.certificateId && (
                        <button
                          id={`view-cert-btn-${enrollment.id}`}
                          onClick={() => onViewCertificate(enrollment.certificateId!, course, enrollment)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center space-x-1 transition"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Certificate</span>
                        </button>
                      )}

                      <button
                        id={`launch-course-btn-${enrollment.id}`}
                        onClick={() => onLaunchCourse(course, enrollment)}
                        className="px-4 py-1.5 bg-[#0070F2] hover:bg-blue-600 text-white text-xs font-semibold rounded shadow-xs flex items-center space-x-1.5 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isDone ? 'Review Course' : enrollment.progressPercent > 0 ? 'Resume' : 'Launch Course'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
