import React, { useState } from 'react';
import { Course, Enrollment, LessonModule } from '../types';
import { 
  X, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  PlayCircle, 
  Award, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface CoursePlayerModalProps {
  course: Course;
  enrollment?: Enrollment;
  onClose: () => void;
  onUpdateProgress: (enrollmentId: string, moduleId: string, quizScore?: number, isFinal?: boolean) => Promise<void>;
  onViewCertificate: (certId: string) => void;
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
  course,
  enrollment,
  onClose,
  onUpdateProgress,
  onViewCertificate
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(enrollment?.quizScore ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const activeModule = course.modules[activeModuleIndex] || course.modules[0];
  const completedModules = enrollment?.completedModuleIds || [];
  const isModuleCompleted = (modId: string) => completedModules.includes(modId);

  const handleNextModule = async () => {
    if (enrollment && !isModuleCompleted(activeModule.id)) {
      setIsSaving(true);
      await onUpdateProgress(enrollment.id, activeModule.id);
      setIsSaving(false);
    }
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    }
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeModule.quizQuestions || !enrollment) return;
    
    let correctCount = 0;
    activeModule.quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / activeModule.quizQuestions.length) * 100);
    setQuizScore(scorePercentage);
    setQuizSubmitted(true);

    setIsSaving(true);
    await onUpdateProgress(enrollment.id, activeModule.id, scorePercentage, scorePercentage >= 70);
    setIsSaving(false);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const currentQuizQuestions = activeModule.quizQuestions || [];
  const allAnswered = currentQuizQuestions.length > 0 && currentQuizQuestions.every(q => selectedAnswers[q.id] !== undefined);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#1b2a3a] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#2a3f55]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#0070F2] text-white p-1.5 rounded">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[#64b5f6] font-semibold">{course.itemId}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300">HAL Interactive Course Player</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">{course.title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {enrollment?.certificateId && (
              <button
                id="player-view-cert-btn"
                onClick={() => onViewCertificate(enrollment.certificateId!)}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                <Award className="w-4 h-4" />
                <span>Certificate Available</span>
              </button>
            )}
            <button
              id="player-close-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition"
              aria-label="Close Course Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar + Main Stage */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Curriculum Sidebar */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold uppercase tracking-wider">Curriculum Progress</span>
                <span className="font-bold text-[#0070F2]">{enrollment?.progressPercent || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0070F2] h-full transition-all duration-300"
                  style={{ width: `${enrollment?.progressPercent || 0}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{completedModules.length} of {course.modules.length} Completed</span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {course.creditHours} hrs credit
                </span>
              </div>
            </div>

            {/* Modules List */}
            <div className="p-2 space-y-1">
              {course.modules.map((mod, idx) => {
                const isActive = idx === activeModuleIndex;
                const isCompleted = isModuleCompleted(mod.id);

                return (
                  <button
                    key={mod.id}
                    id={`player-module-item-${idx}`}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start space-x-2.5 transition text-xs ${
                      isActive 
                        ? 'bg-blue-50 border border-blue-200 text-[#0070F2] font-semibold' 
                        : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className={`w-4 h-4 ${isActive ? 'text-[#0070F2]' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono text-slate-400">
                          Part {idx + 1} • {mod.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{mod.durationMinutes}m</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 line-clamp-2 mt-0.5">
                        {mod.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Course Badges Footer */}
            <div className="mt-auto p-3 border-t border-slate-200 bg-white text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Domain:</span>
                <span className="font-medium text-slate-700">{course.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-medium text-slate-700">{course.deliveryMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Mandatory:</span>
                <span className={`font-semibold ${course.isMandatory ? 'text-red-600' : 'text-slate-600'}`}>
                  {course.isMandatory ? 'Required Compliance' : 'Elective'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Reading & Interactive Stage */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-white flex flex-col justify-between">
            <div className="space-y-6">
              {/* Module Header Bar */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mb-1">
                  <span>MODULE {activeModuleIndex + 1} OF {course.modules.length}</span>
                  <span>•</span>
                  <span className="uppercase text-[#0070F2] font-semibold">{activeModule.type} LESSON</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{activeModule.title}</h3>
              </div>

              {/* Module Type: Reading or Interactive Content */}
              {activeModule.type !== 'quiz' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-700">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 text-[#0070F2] mr-2" />
                      Standard Operating Procedure & Learning Objective
                    </h4>
                    <p>{activeModule.content || 'Review the instructional directives provided in this corporate curriculum module.'}</p>
                  </div>

                  {activeModule.type === 'interactive' && (
                    <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-[#0070F2] shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Interactive Task Verification
                          </h5>
                          <p className="text-xs text-slate-600 mt-1">
                            In an enterprise deployment, this module connects to HAL Learning SCORM/xAPI engines. Review the checklist below to validate your understanding:
                          </p>
                          <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="checkbox" defaultChecked className="rounded text-[#0070F2] focus:ring-[#0070F2]" />
                              <span>Verified authorization policies & data classification level</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="checkbox" defaultChecked className="rounded text-[#0070F2] focus:ring-[#0070F2]" />
                              <span>Acknowledged 2026 enterprise escalation procedures</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="checkbox" defaultChecked className="rounded text-[#0070F2] focus:ring-[#0070F2]" />
                              <span>Confirmed MFA zero-trust identity requirements</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Compliance Note:</span> Progress is tracked and audited per HAL SuccessFactors Learning Standards. Ensure full reading comprehension before proceeding to the knowledge check.
                    </div>
                  </div>
                </div>
              )}

              {/* Module Type: Quiz */}
              {activeModule.type === 'quiz' && (
                <div className="space-y-6">
                  {/* Quiz Score Banner if already completed */}
                  {quizScore !== null && (
                    <div className={`p-4 rounded-lg border ${
                      quizScore >= 70 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                        : 'bg-red-50 border-red-300 text-red-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {quizScore >= 70 ? (
                            <FileCheck className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-red-600" />
                          )}
                          <div>
                            <h4 className="font-bold text-sm">
                              {quizScore >= 70 ? 'Assessment Passed!' : 'Assessment Not Passed'}
                            </h4>
                            <p className="text-xs">
                              Your Score: <span className="font-bold">{quizScore}%</span> (Passing Threshold: 70%)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {quizScore < 70 && (
                            <button
                              id="quiz-retake-btn"
                              onClick={handleRetakeQuiz}
                              className="text-xs flex items-center space-x-1 px-3 py-1.5 bg-white border border-red-300 rounded font-medium text-red-700 hover:bg-red-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retake Quiz</span>
                            </button>
                          )}
                          {quizScore >= 70 && enrollment?.certificateId && (
                            <button
                              id="quiz-view-certificate-btn"
                              onClick={() => onViewCertificate(enrollment.certificateId!)}
                              className="text-xs flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800 shadow-sm"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Certificate</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quiz Questions List */}
                  <div className="space-y-5">
                    {currentQuizQuestions.map((q, qIndex) => {
                      const selectedOpt = selectedAnswers[q.id];
                      const isCorrect = selectedOpt === q.correctIndex;

                      return (
                        <div key={q.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-slate-900 mb-3">
                              <span className="text-[#0070F2] mr-2">Question {qIndex + 1}:</span>
                              {q.question}
                            </h4>
                            {quizSubmitted && (
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedOpt === optIdx;
                              let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                              if (isSelected) {
                                btnStyle = 'border-[#0070F2] bg-blue-50 text-[#0070F2] font-medium ring-1 ring-[#0070F2]';
                              }

                              if (quizSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                                } else if (isSelected && !isCorrect) {
                                  btnStyle = 'border-red-500 bg-red-50 text-red-900';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => handleAnswerSelect(q.id, optIdx)}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-md border text-xs flex items-center justify-between transition ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0 ml-2">
                                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#0070F2]" />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="mt-3 p-2.5 rounded bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                              <span className="font-semibold">HAL Rationale:</span> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted && (
                    <div className="flex justify-end pt-2">
                      <button
                        id="submit-quiz-assessment-btn"
                        onClick={handleSubmitQuiz}
                        disabled={!allAnswered || isSaving}
                        className={`px-5 py-2 rounded-md text-xs font-semibold text-white shadow-sm flex items-center space-x-1.5 transition ${
                          allAnswered && !isSaving
                            ? 'bg-[#0070F2] hover:bg-blue-600 cursor-pointer'
                            : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <span>{isSaving ? 'Grading Assessment...' : 'Submit Assessment'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Action Controls for Standard Modules */}
            {activeModule.type !== 'quiz' && (
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setActiveModuleIndex(Math.max(0, activeModuleIndex - 1))}
                  disabled={activeModuleIndex === 0}
                  className="px-3.5 py-1.5 rounded border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous Module
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    id="mark-module-complete-next-btn"
                    onClick={handleNextModule}
                    disabled={isSaving}
                    className="px-4 py-2 rounded bg-[#0070F2] hover:bg-blue-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <span>{isSaving ? 'Updating...' : (activeModuleIndex === course.modules.length - 1 ? 'Complete Curriculum' : 'Mark Complete & Next')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
