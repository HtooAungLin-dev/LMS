import React, { useState } from 'react';
import { Course, LessonModule, DeliveryMethod } from '../types';
import { X, Plus, Trash2, BookOpen, HelpCircle, Save, Layers, AlertCircle } from 'lucide-react';

interface CourseEditorModalProps {
  course?: Course | null;
  onClose: () => void;
  onSave: (courseData: Partial<Course>) => Promise<void>;
  currentUserRole: string;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({
  course,
  onClose,
  onSave,
  currentUserRole
}) => {
  const isEditing = !!course;

  const [itemId, setItemId] = useState(course?.itemId || `HAL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [category, setCategory] = useState<Course['category']>(course?.category || 'Technology');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(course?.deliveryMethod || 'eLearning');
  const [creditHours, setCreditHours] = useState(course?.creditHours || 2.0);
  const [isMandatory, setIsMandatory] = useState(course?.isMandatory ?? false);
  const [targetAudience, setTargetAudience] = useState(course?.targetAudience || 'General Enterprise Personnel');
  const [instructorName, setInstructorName] = useState(course?.instructorName || 'HAL Certified Faculty');
  const [prerequisitesStr, setPrerequisitesStr] = useState((course?.prerequisites || []).join(', '));
  const [modules, setModules] = useState<LessonModule[]>(
    course?.modules || [
      {
        id: `mod-${Date.now()}-1`,
        title: 'Module 1: Principles & Fundamentals',
        durationMinutes: 45,
        type: 'reading',
        content: 'Comprehensive overview of standard procedures and enterprise guidelines.'
      },
      {
        id: `mod-${Date.now()}-2`,
        title: 'Module 2: Practical Knowledge Check',
        durationMinutes: 20,
        type: 'quiz',
        quizQuestions: [
          {
            id: 'q-custom-1',
            question: 'What is the mandatory action when encountering a policy violation?',
            options: ['Escalate immediately to the compliance officer', 'Ignore and monitor', 'Discuss casually with peers', 'Delete related records'],
            correctIndex: 0,
            explanation: 'Standard enterprise governance mandates immediate escalation to the authorized compliance officer.'
          }
        ]
      }
    ]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddModule = (type: 'reading' | 'interactive' | 'quiz') => {
    const newMod: LessonModule = {
      id: `mod-${Date.now()}-${modules.length + 1}`,
      title: `Module ${modules.length + 1}: ${type === 'quiz' ? 'Assessment' : 'Lesson'}`,
      durationMinutes: 30,
      type,
      content: type !== 'quiz' ? 'Enter module training text and instructions here...' : undefined,
      quizQuestions: type === 'quiz' ? [
        {
          id: `q-${Date.now()}`,
          question: 'Sample Assessment Question',
          options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          explanation: 'Standard HAL explanation rationale.'
        }
      ] : undefined
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (index: number) => {
    if (modules.length <= 1) {
      alert('A course curriculum must have at least one learning module.');
      return;
    }
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleUpdateModule = (index: number, updates: Partial<LessonModule>) => {
    const next = [...modules];
    next[index] = { ...next[index], ...updates };
    setModules(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Course title is required.');
      return;
    }
    if (!itemId.trim()) {
      setErrorMsg('HAL Item ID is required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const prerequisites = prerequisitesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await onSave({
        itemId,
        title,
        description,
        category,
        deliveryMethod,
        creditHours: Number(creditHours),
        isMandatory,
        targetAudience,
        instructorName,
        prerequisites,
        modules,
        status: 'Published'
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save course.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1b2a3a] text-white px-6 py-4 flex items-center justify-between border-b border-[#2a3f55]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#0070F2] text-white p-2 rounded">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Edit Learning Item: ${course?.itemId}` : 'Create New HAL Learning Item & Curriculum'}
              </h2>
              <p className="text-xs text-slate-300">
                Course Authoring • SuccessFactors Catalog Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Item Metadata */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
              <BookOpen className="w-4 h-4 text-[#0070F2] mr-2" />
              Item Master Data & Classifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HAL Item ID *
                </label>
                <input
                  type="text"
                  required
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  placeholder="e.g. SEC-4001-ISO"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise Information Security & Zero Trust 2026"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Domain
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
                >
                  <option value="Compliance">Compliance</option>
                  <option value="Technology">Technology</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="Health & Safety">Health & Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Method
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
                >
                  <option value="eLearning">eLearning (WBT)</option>
                  <option value="ILT">Instructor-Led (ILT)</option>
                  <option value="Blended">Blended Learning</option>
                  <option value="VirtualClassroom">Virtual Classroom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credit Hours (CPE)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={creditHours}
                  onChange={(e) => setCreditHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructor / Academy Faculty
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Abstract / Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed objectives and executive summary of the learning program..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0070F2] focus:border-[#0070F2]"
              />
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="text-red-700">Flag as Mandatory Enterprise Compliance Course</span>
              </label>

              <div className="flex-1">
                <input
                  type="text"
                  value={prerequisitesStr}
                  onChange={(e) => setPrerequisitesStr(e.target.value)}
                  placeholder="Prerequisites (comma-separated IDs e.g. SEC-1001, IT-200)"
                  className="w-full px-3 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Syllabus Modules Builder */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Curriculum Structure & Modules ({modules.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Construct sequential instructional lessons, SCORM simulations, and knowledge checks.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleAddModule('reading')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Reading</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddModule('interactive')}
                  className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-[#0070F2] rounded border border-blue-200 font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Interactive</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddModule('quiz')}
                  className="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200 font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Quiz Check</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {modules.map((mod, idx) => (
                <div key={mod.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#1b2a3a] text-white text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-mono uppercase text-slate-500 font-medium">
                        [{mod.type}]
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-xs text-slate-600">
                        <span>Duration:</span>
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={mod.durationMinutes}
                          onChange={(e) => handleUpdateModule(idx, { durationMinutes: Number(e.target.value) })}
                          className="w-16 px-1.5 py-0.5 text-xs border border-slate-300 rounded bg-white"
                        />
                        <span>min</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(idx)}
                        className="text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => handleUpdateModule(idx, { title: e.target.value })}
                      placeholder="Module Title..."
                      className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded bg-white"
                    />

                    {mod.type !== 'quiz' ? (
                      <textarea
                        rows={2}
                        value={mod.content || ''}
                        onChange={(e) => handleUpdateModule(idx, { content: e.target.value })}
                        placeholder="Module instructional training text..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded border border-purple-200 text-xs">
                        <div className="font-semibold text-purple-900 mb-1 flex items-center">
                          <HelpCircle className="w-3.5 h-3.5 mr-1" />
                          Knowledge Check Questions ({mod.quizQuestions?.length || 0})
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Automated assessment with 70% passing requirement. Pre-loaded with compliance verification questions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0070F2] hover:bg-blue-600 rounded shadow-sm flex items-center space-x-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publishing Item...' : (isEditing ? 'Save Changes' : 'Publish to SAP Catalog')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
