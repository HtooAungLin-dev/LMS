import React, { useState } from 'react';
import { Course, Enrollment, User, DepartmentCompliance } from '../types';
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Clock, 
  Users, 
  FileSpreadsheet,
  Building2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  RotateCcw,
  Layers,
  X,
  Sparkles,
  Check
} from 'lucide-react';

export type FilterPreset = 'all' | 'overdue' | 'high_risk' | 'certifications' | 'mandatory';

interface AdvancedReportingViewProps {
  courses: Course[];
  enrollments: Enrollment[];
  users: User[];
  departmentReports: DepartmentCompliance[];
}

export const AdvancedReportingView: React.FC<AdvancedReportingViewProps> = ({
  courses,
  enrollments,
  users,
  departmentReports
}) => {
  const [activePreset, setActivePreset] = useState<FilterPreset>('all');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [timeframe, setTimeframe] = useState('YTD 2026');

  // Identify high-risk departments dynamically:
  // 1. Departments with compliance rate < 80% or overdue count > 0
  const highRiskDeptNames = departmentReports
    .filter(d => d.complianceRate < 80 || d.overdueCount > 0)
    .map(d => d.department);

  const effectiveHighRiskDepts = highRiskDeptNames.length > 0
    ? highRiskDeptNames
    : departmentReports
        .slice()
        .sort((a, b) => a.complianceRate - b.complianceRate)
        .slice(0, 2)
        .map(d => d.department);

  // Pre-calculated counts for presets
  const overdueTotalCount = enrollments.filter(e => e.status === 'Overdue').length;
  const certifiedTotalCount = enrollments.filter(e => e.status === 'Completed' && Boolean(e.certificateId)).length;
  const mandatoryTotalCount = enrollments.filter(e => {
    const crs = courses.find(c => c.id === e.courseId);
    return Boolean(crs?.isMandatory);
  }).length;
  const highRiskEnrollmentsCount = enrollments.filter(e => {
    const user = users.find(u => u.id === e.userId);
    return user && effectiveHighRiskDepts.includes(user.department);
  }).length;

  // Filtered enrollments based on active preset + dropdown filters
  const filteredEnrollments = enrollments.filter(e => {
    const user = users.find(u => u.id === e.userId);
    const course = courses.find(c => c.id === e.courseId);

    // Preset filtering logic
    if (activePreset === 'overdue' && e.status !== 'Overdue') {
      return false;
    }
    if (activePreset === 'high_risk') {
      if (!user || !effectiveHighRiskDepts.includes(user.department)) {
        return false;
      }
    }
    if (activePreset === 'certifications') {
      if (e.status !== 'Completed' || !e.certificateId) {
        return false;
      }
    }
    if (activePreset === 'mandatory') {
      if (!course?.isMandatory) {
        return false;
      }
    }

    // Manual dropdown filters
    if (selectedDept !== 'All' && user?.department !== selectedDept) return false;
    if (selectedStatus !== 'All' && e.status !== selectedStatus) return false;
    return true;
  });

  // Calculate high-level metrics dynamically from filtered dataset
  const totalEnr = filteredEnrollments.length;
  const completedCount = filteredEnrollments.filter(e => e.status === 'Completed').length;
  const overdueCount = filteredEnrollments.filter(e => e.status === 'Overdue').length;
  const inProgressCount = filteredEnrollments.filter(e => e.status === 'In Progress').length;
  const complianceRate = totalEnr > 0 ? ((completedCount / totalEnr) * 100).toFixed(1) : '100.0';

  const totalCreditHours = filteredEnrollments.reduce((acc, curr) => {
    const crs = courses.find(c => c.id === curr.courseId);
    if (crs && curr.status === 'Completed') {
      return acc + crs.creditHours;
    }
    return acc;
  }, 0);

  const filteredUserIds = new Set(filteredEnrollments.map(e => e.userId));
  const uniqueLearnersCount = filteredUserIds.size;

  // One-click Preset Selector
  const handleSelectPreset = (preset: FilterPreset) => {
    setActivePreset(preset);
    if (preset === 'all') {
      setSelectedDept('All');
      setSelectedStatus('All');
    } else if (preset === 'overdue') {
      setSelectedStatus('Overdue');
      setSelectedDept('All');
    } else if (preset === 'high_risk') {
      setSelectedStatus('All');
      setSelectedDept('All');
    } else if (preset === 'certifications') {
      setSelectedStatus('Completed');
      setSelectedDept('All');
    } else if (preset === 'mandatory') {
      setSelectedStatus('All');
      setSelectedDept('All');
    }
  };

  const handleResetFilters = () => {
    setActivePreset('all');
    setSelectedDept('All');
    setSelectedStatus('All');
    setTimeframe('YTD 2026');
  };

  // Export to CSV function for offline analysis
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const escapeCsv = (val: unknown) => {
        if (val === null || val === undefined) return '""';
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const headers = [
        'Enrollment ID',
        'Learner HAL ID',
        'Learner Name',
        'Email',
        'Department',
        'Location',
        'Job Title',
        'Course Item ID',
        'Course Title',
        'Category',
        'Delivery Method',
        'Credit Hours (CPE)',
        'Mandatory Curricula',
        'Assigned By',
        'Assigned Date',
        'Due Date',
        'Completion Date',
        'Enrollment Status',
        'Progress Percent',
        'Quiz Score Percent',
        'Certificate Credential ID'
      ];

      // Export filtered or full records based on current active filters
      const targetRecords = filteredEnrollments.length > 0 ? filteredEnrollments : enrollments;
      
      const rows = targetRecords.map(e => {
        const user = users.find(u => u.id === e.userId);
        const course = courses.find(c => c.id === e.courseId);

        return [
          escapeCsv(e.id),
          escapeCsv(user?.sapId || ''),
          escapeCsv(user?.name || ''),
          escapeCsv(user?.email || ''),
          escapeCsv(user?.department || ''),
          escapeCsv(user?.location || ''),
          escapeCsv(user?.jobTitle || ''),
          escapeCsv(course?.itemId || ''),
          escapeCsv(course?.title || ''),
          escapeCsv(course?.category || ''),
          escapeCsv(course?.deliveryMethod || ''),
          escapeCsv(course?.creditHours ?? ''),
          escapeCsv(course?.isMandatory ? 'Yes' : 'No'),
          escapeCsv(e.assignedBy || 'Automated Rule'),
          escapeCsv(e.assignedDate || ''),
          escapeCsv(e.dueDate || ''),
          escapeCsv(e.completedDate || (e.status === 'Completed' ? e.dueDate : 'N/A')),
          escapeCsv(e.status),
          escapeCsv(`${e.progressPercent}%`),
          escapeCsv(e.quizScore !== undefined ? `${e.quizScore}%` : 'N/A'),
          escapeCsv(e.certificateId || 'N/A')
        ].join(',');
      });

      const csvString = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const presetSuffix = activePreset !== 'all' ? `_${activePreset.toUpperCase()}` : '';
      link.setAttribute('download', `HAL_LMS_Compliance_Report${presetSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('CSV Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const departmentsList = Array.from(new Set(users.map(u => u.department)));

  // Displayed departments in matrix
  const displayedDepartmentReports = departmentReports.filter(dept => {
    if (activePreset === 'high_risk') {
      return effectiveHighRiskDepts.includes(dept.department);
    }
    if (selectedDept !== 'All') {
      return dept.department === selectedDept;
    }
    return true;
  });

  const presetsConfig: {
    id: FilterPreset;
    title: string;
    description: string;
    badge: string | number;
    badgeColor: string;
    icon: React.ElementType;
    activeBorder: string;
    activeBg: string;
    activeText: string;
  }[] = [
    {
      id: 'all',
      title: 'All Records',
      description: 'Entire enterprise curriculum baseline',
      badge: enrollments.length,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Layers,
      activeBorder: 'border-slate-800 ring-2 ring-slate-800/10',
      activeBg: 'bg-slate-50',
      activeText: 'text-slate-900'
    },
    {
      id: 'overdue',
      title: 'Overdue Compliance',
      description: 'Items breaching statutory SLA deadlines',
      badge: overdueTotalCount,
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertTriangle,
      activeBorder: 'border-red-600 ring-2 ring-red-600/20',
      activeBg: 'bg-red-50/70',
      activeText: 'text-red-950'
    },
    {
      id: 'high_risk',
      title: 'High-Risk Depts',
      description: `${effectiveHighRiskDepts.length} divisions with compliance gaps`,
      badge: `${effectiveHighRiskDepts.length} Depts`,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: ShieldAlert,
      activeBorder: 'border-amber-600 ring-2 ring-amber-600/20',
      activeBg: 'bg-amber-50/70',
      activeText: 'text-amber-950'
    },
    {
      id: 'certifications',
      title: 'Recent Certifications',
      description: 'Verified credentials & completed accreditations',
      badge: certifiedTotalCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Award,
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-600/20',
      activeBg: 'bg-emerald-50/70',
      activeText: 'text-emerald-950'
    },
    {
      id: 'mandatory',
      title: 'Mandatory Curricula',
      description: 'Statutory non-negotiable compliance programs',
      badge: mandatoryTotalCount,
      badgeColor: 'bg-blue-100 text-[#0070F2] border-blue-200',
      icon: ShieldCheck,
      activeBorder: 'border-[#0070F2] ring-2 ring-[#0070F2]/20',
      activeBg: 'bg-blue-50/70',
      activeText: 'text-blue-950'
    }
  ];

  const hasActiveFilters = activePreset !== 'all' || selectedDept !== 'All' || selectedStatus !== 'All' || timeframe !== 'YTD 2026';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
            <span>HAL ANALYTICS CLOUD INTEGRATION</span>
            <span>•</span>
            <span className="text-[#0070F2] font-semibold">ENTERPRISE COMPLIANCE INTELLIGENCE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Advanced Regulatory & Compliance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Real-time tracking of ISO 27001, GDPR, and organizational curricula completion across global divisions with offline audit trail export.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="export-to-csv-btn"
            onClick={handleExportCSV}
            disabled={isExporting}
            className={`px-4 py-2 text-white text-xs font-semibold rounded-md shadow-xs flex items-center space-x-2 transition ${
              exportSuccess
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-emerald-700 hover:bg-emerald-600'
            }`}
            title="Download enrollment data array in CSV file format for offline analysis"
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Exported to CSV!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1-Click Executive Filter Presets */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0070F2]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Executive Filter Presets
            </h2>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p className="text-[11px] text-slate-500">
              One-click regulatory triage & risk monitoring presets
            </p>
          </div>

          {hasActiveFilters && (
            <button
              id="reset-filter-presets-btn"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center space-x-1.5 transition self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to All</span>
            </button>
          )}
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {presetsConfig.map(p => {
            const Icon = p.icon;
            const isActive = activePreset === p.id;
            return (
              <button
                key={p.id}
                id={`preset-${p.id}-btn`}
                onClick={() => handleSelectPreset(p.id)}
                className={`text-left p-3 rounded-lg border transition flex flex-col justify-between relative group cursor-pointer ${
                  isActive
                    ? `${p.activeBorder} ${p.activeBg} shadow-xs`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? p.activeText : 'text-slate-500'}`} />
                      <span className={`text-xs font-bold truncate ${isActive ? p.activeText : 'text-slate-800'}`}>
                        {p.title}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {p.description}
                  </p>
                </div>

                {isActive && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-[#0070F2]">
                    <span className="flex items-center">
                      <Check className="w-3 h-3 mr-1 text-emerald-600" />
                      Active Preset
                    </span>
                    <span className="text-slate-400 font-normal">Filtered</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Tiles (Dynamically filtered by active preset & criteria) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Compliance Index</span>
            <ShieldCheck className={`w-4 h-4 ${Number(complianceRate) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${
            Number(complianceRate) >= 90 ? 'text-slate-900' : Number(complianceRate) >= 75 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {complianceRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center">
            {Number(complianceRate) >= 90 ? (
              <span className="text-emerald-600 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Target SLA (90%) Achieved
              </span>
            ) : Number(complianceRate) >= 75 ? (
              <span className="text-amber-600 font-medium">Under Enterprise Target</span>
            ) : (
              <span className="text-red-600 font-medium flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Requires Remediation
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Overdue Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {overdueCount === 0 ? 'No overdue items in view' : 'Items past statutory deadline'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Accredited Credit</span>
            <Clock className="w-4 h-4 text-[#0070F2]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalCreditHours.toFixed(1)} hrs</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {completedCount} accredited completions
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Enrolled Workforce</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{uniqueLearnersCount}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            {totalEnr} Total Active Assignments
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Active Preset Tag if not 'all' */}
          {activePreset !== 'all' && (
            <div className="flex items-center space-x-1.5 bg-[#0070F2]/10 border border-[#0070F2]/30 text-[#0070F2] px-2.5 py-1 rounded-md font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Preset: {presetsConfig.find(p => p.id === activePreset)?.title}</span>
              <button
                id="clear-active-preset-chip"
                onClick={() => handleSelectPreset('all')}
                className="ml-1 hover:bg-[#0070F2]/20 rounded p-0.5 transition cursor-pointer"
                title="Clear preset and return to all curricula"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Division:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
            >
              <option value="All">All Divisions ({departmentsList.length})</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Overdue">Overdue</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Period:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
            >
              <option value="YTD 2026">Year-to-Date (2026)</option>
              <option value="Q3 2026">Current Quarter (Q3)</option>
              <option value="Q2 2026">Previous Quarter (Q2)</option>
              <option value="All Time">Full Audit History</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-slate-500 font-mono text-[11px]">
            Filtering <span className="font-bold text-slate-800">{filteredEnrollments.length}</span> of {enrollments.length} records
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-[#0070F2] hover:underline text-[11px] font-medium cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Departmental Compliance Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">
                Departmental Compliance Rate & Risk Breakdown
              </h3>
              {activePreset === 'high_risk' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  High-Risk Preset Active ({displayedDepartmentReports.length} Divisions)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated against annual corporate regulatory mandates and SLA targets.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0070F2] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Target SLA: 90%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1b2a3a] text-slate-200 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Department / Division</th>
                <th className="p-3.5">Assigned Learners</th>
                <th className="p-3.5">Completed</th>
                <th className="p-3.5">In Progress</th>
                <th className="p-3.5">Overdue</th>
                <th className="p-3.5">Compliance Rate</th>
                <th className="p-3.5">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedDepartmentReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No departments match the current filter or preset criteria.
                  </td>
                </tr>
              ) : (
                displayedDepartmentReports.map((dept, i) => {
                  const isCompliant = dept.complianceRate >= 90;
                  const isAtRisk = dept.complianceRate < 75;

                  return (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{dept.department}</span>
                      </td>
                      <td className="p-3.5">{dept.totalLearners}</td>
                      <td className="p-3.5 text-emerald-600 font-semibold">{dept.completedCount}</td>
                      <td className="p-3.5 text-amber-600">{dept.inProgressCount}</td>
                      <td className="p-3.5 text-red-600 font-semibold">{dept.overdueCount}</td>
                      <td className="p-3.5 w-48">
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <span className="font-bold">{dept.complianceRate}%</span>
                          <span className="text-slate-400">Target: 90%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isCompliant ? 'bg-emerald-600' : isAtRisk ? 'bg-red-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${dept.complianceRate}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isCompliant
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isAtRisk
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isCompliant ? 'SLA Met' : isAtRisk ? 'High Risk' : 'Acceptable'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Detailed Learning Records Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">
                Individual Learning Records Audit Feed
              </h3>
              {activePreset !== 'all' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0070F2] border border-blue-200">
                  Preset: {presetsConfig.find(p => p.id === activePreset)?.title}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular per-employee enrollment, assessment, and accreditation records.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-mono">
              {filteredEnrollments.length} Record(s) Loaded
            </span>
            <button
              id="table-export-to-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Export displayed records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export to CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1b2a3a] text-slate-200 sticky top-0 z-10 font-semibold">
              <tr>
                <th className="p-3">Learner</th>
                <th className="p-3">Department</th>
                <th className="p-3">Course Title</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Quiz Score</th>
                <th className="p-3">Certificate ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <AlertTriangle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No learning records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try selecting a different preset or clearing your active filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enr) => {
                  const user = users.find(u => u.id === enr.userId);
                  const course = courses.find(c => c.id === enr.courseId);

                  return (
                    <tr key={enr.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">
                        <div>{user?.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{user?.sapId}</div>
                      </td>
                      <td className="p-3">{user?.department}</td>
                      <td className="p-3 font-medium text-slate-800 max-w-xs truncate">
                        {course?.title}
                      </td>
                      <td className="p-3 font-mono text-[11px]">{enr.dueDate}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          enr.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enr.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {enr.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">{enr.progressPercent}%</td>
                      <td className="p-3">
                        {enr.quizScore !== undefined ? (
                          <span className="font-bold text-slate-900">{enr.quizScore}%</span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#0070F2]">
                        {enr.certificateId || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
