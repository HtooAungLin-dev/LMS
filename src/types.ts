export type UserRole = 'admin' | 'manager' | 'instructor' | 'learner';

export interface User {
  id: string;
  sapId: string; // e.g. "PERNR-804192"
  name: string;
  email: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  avatar: string;
  managerId?: string;
  location: string;
}

export type DeliveryMethod = 'eLearning' | 'ILT' | 'Blended' | 'VirtualClassroom';

export type CourseStatus = 'Draft' | 'Published' | 'Archived';

export interface LessonModule {
  id: string;
  title: string;
  durationMinutes: number;
  type: 'video' | 'interactive' | 'reading' | 'quiz';
  content?: string;
  quizQuestions?: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface Course {
  id: string;
  itemId: string; // SAP Item ID e.g. "SEC-1002-GDPR"
  title: string;
  description: string;
  category: 'Compliance' | 'Technology' | 'Leadership' | 'Supply Chain' | 'Health & Safety';
  deliveryMethod: DeliveryMethod;
  creditHours: number;
  isMandatory: boolean;
  status: CourseStatus;
  instructorName: string;
  targetAudience: string;
  prerequisites: string[];
  thumbnail: string;
  modules: LessonModule[];
  createdAt: string;
  version: string;
}

export type EnrollmentStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Pending Approval';

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  assignedBy: string; // "Assignment Profile" | "Manager" | "Self-Enrolled"
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  status: EnrollmentStatus;
  progressPercent: number;
  completedModuleIds: string[];
  quizScore?: number;
  certificateId?: string;
}

export interface DepartmentCompliance {
  department: string;
  totalLearners: number;
  completedCount: number;
  inProgressCount: number;
  overdueCount: number;
  complianceRate: number; // e.g. 94.5%
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'Course' | 'Assignment' | 'User' | 'System';
  details: string;
}

export interface ApprovalRequest {
  id: string;
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  userDepartment: string;
  requestDate: string;
  cost: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
