import React, { useState } from 'react';
import { Course, Enrollment, User, UserRole } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Edit3, 
  Trash2, 
  Clock, 
  Award, 
  BookOpen, 
  Users, 
  LayoutGrid, 
  Table as TableIcon,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface CourseCatalogViewProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  onLaunchCourse: (course: Course, enrollment?: Enrollment) => void;
  onOpenCreateCourse: () => void;
  onOpenEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onEnroll: (courseId: string) => void;
  onOpenAssignModal: (course: Course) => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({
  currentUser,
  courses,
  enrollments,
  onLaunchCourse,
  onOpenCreateCourse,
  onOpenEditCourse,
  onDeleteCourse,
  onEnroll,
  onOpenAssignModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDelivery, setSelectedDelivery] = useState('All');
  const [mandatoryOnly, setMandatoryOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const canAuthor = currentUser.role === 'admin' || currentUser.role === 'instructor';
  const canAssign = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Filter courses
  const filteredCourses = courses.filter(c => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedDelivery !== 'All' && c.deliveryMethod !== selectedDelivery) return false;
    if (mandatoryOnly && !c.isMandatory) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.itemId.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
            <span>HAL SUCCESSFACTORS LEARNING</span>
            <span>•</span>
            <span className="text-[#0070F2] font-semibold">ENTERPRISE COURSE CATALOG</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Course Management & Curriculum Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Browse corporate learning items, manage accredited curricula, inspect syllabus modules, and schedule workforce certifications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canAuthor && (
            <button
              id="catalog-create-course-btn"
              onClick={onOpenCreateCourse}
              className="px-4 py-2 bg-[#0070F2] hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-xs flex items-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Learning Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, HAL Item ID, domain..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
            />
          </div>

          {/* Quick Filter Selects */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:ring-1 focus:ring-[#0070F2]"
            >
              <option value="All">All Domains</option>
              <option value="Compliance">Compliance</option>
              <option value="Technology">Technology</option>
              <option value="Leadership">Leadership</option>
              <option value="Supply Chain">Supply Chain</option>
              <option value="Health & Safety">Health & Safety</option>
            </select>

            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:ring-1 focus:ring-[#0070F2]"
            >
              <option value="All">All Delivery Methods</option>
              <option value="eLearning">eLearning (WBT)</option>
              <option value="ILT">Instructor-Led (ILT)</option>
              <option value="Blended">Blended Learning</option>
              <option value="VirtualClassroom">Virtual Classroom</option>
            </select>

            <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 px-2 py-1 bg-slate-50 rounded border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={mandatoryOnly}
                onChange={(e) => setMandatoryOnly(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-red-700">Mandatory Only</span>
            </label>

            {/* Layout Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 ml-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded transition ${viewMode === 'cards' ? 'bg-white shadow-xs text-[#0070F2]' : 'text-slate-500 hover:text-slate-800'}`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition ${viewMode === 'table' ? 'bg-white shadow-xs text-[#0070F2]' : 'text-slate-500 hover:text-slate-800'}`}
                title="Enterprise Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredCourses.length}</strong> enterprise items</span>
          <span className="text-[11px] font-mono text-slate-400">Tenant: PRD-GLOBAL-042</span>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const userEnr = enrollments.find(e => e.courseId === course.id && e.userId === currentUser.id);

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
              >
                {/* Card Thumbnail Banner */}
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold bg-[#1b2a3a]/90 text-white px-2 py-0.5 rounded backdrop-blur-xs border border-white/20">
                      {course.itemId}
                    </span>
                    {course.isMandatory && (
                      <span className="text-[10px] font-bold bg-red-600/90 text-white px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center shadow-xs">
                        <ShieldAlert className="w-3 h-3 mr-0.5" />
                        Mandatory
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold">{course.category}</span>
                    <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs text-[11px]">
                      {course.deliveryMethod}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0070F2] transition line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center text-slate-500">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Credit:
                      </span>
                      <strong className="text-slate-800">{course.creditHours} CPE Hours</strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Curriculum:
                      </span>
                      <span>{course.modules.length} Modules & Quiz</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center text-slate-500">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Instructor:
                      </span>
                      <span className="text-slate-700 truncate max-w-[140px]">{course.instructorName}</span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Primary Button */}
                    {userEnr ? (
                      <button
                        onClick={() => onLaunchCourse(course, userEnr)}
                        className="flex-1 px-3 py-1.5 bg-[#0070F2] hover:bg-blue-600 text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center space-x-1 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{userEnr.status === 'Completed' ? 'Review Item' : 'Launch Course'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onEnroll(course.id)}
                        className="flex-1 px-3 py-1.5 bg-[#1b2a3a] hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center space-x-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Self-Enroll</span>
                      </button>
                    )}

                    {/* Manager / Admin Extra Buttons */}
                    {canAssign && (
                      <button
                        onClick={() => onOpenAssignModal(course)}
                        className="p-1.5 bg-slate-100 hover:bg-blue-50 hover:text-[#0070F2] text-slate-700 rounded border border-slate-200 transition text-xs"
                        title="Assign to Team / Department"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    )}

                    {canAuthor && (
                      <>
                        <button
                          onClick={() => onOpenEditCourse(course)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition text-xs"
                          title="Edit Curriculum"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCourse(course.id)}
                          className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded border border-slate-200 transition text-xs"
                          title="Delete from Catalog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enterprise Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1b2a3a] text-slate-200 font-semibold border-b border-slate-300">
              <tr>
                <th className="p-3.5">SAP Item ID</th>
                <th className="p-3.5">Title & Curriculum</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5">Delivery</th>
                <th className="p-3.5">Credit</th>
                <th className="p-3.5">Compliance</th>
                <th className="p-3.5 text-right">Catalog Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCourses.map((course) => {
                const userEnr = enrollments.find(e => e.courseId === course.id && e.userId === currentUser.id);

                return (
                  <tr key={course.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {course.itemId}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-slate-900">{course.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{course.description}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {course.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px]">
                      {course.deliveryMethod}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {course.creditHours} hrs
                    </td>
                    <td className="p-3.5">
                      {course.isMandatory ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                          Elective
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {userEnr ? (
                        <button
                          onClick={() => onLaunchCourse(course, userEnr)}
                          className="px-2.5 py-1 bg-[#0070F2] text-white rounded font-medium text-xs hover:bg-blue-600"
                        >
                          Launch
                        </button>
                      ) : (
                        <button
                          onClick={() => onEnroll(course.id)}
                          className="px-2.5 py-1 bg-slate-800 text-white rounded font-medium text-xs hover:bg-slate-700"
                        >
                          Enroll
                        </button>
                      )}

                      {canAuthor && (
                        <button
                          onClick={() => onOpenEditCourse(course)}
                          className="p-1 text-slate-600 hover:text-[#0070F2]"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
