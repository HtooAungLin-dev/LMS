import { Course, Enrollment, User, AuditLog, ApprovalRequest } from '../types';

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getCourses(filters?: { category?: string; search?: string; mandatory?: boolean; delivery?: string }): Promise<Course[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.mandatory !== undefined) params.append('mandatory', String(filters.mandatory));
    if (filters?.delivery) params.append('delivery', filters.delivery);

    const res = await fetch(`/api/courses?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async createCourse(course: Partial<Course> & { actorName?: string; actorRole?: string }): Promise<Course> {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    if (!res.ok) throw new Error('Failed to create course');
    return res.json();
  },

  async updateCourse(id: string, updates: Partial<Course> & { actorName?: string; actorRole?: string }): Promise<Course> {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update course');
    return res.json();
  },

  async deleteCourse(id: string): Promise<void> {
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete course');
  },

  async getEnrollments(userId?: string, status?: string): Promise<Enrollment[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);

    const res = await fetch(`/api/enrollments?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
  },

  async assignCourse(payload: { courseId: string; userIds: string[]; assignedBy: string; dueDate?: string }): Promise<any> {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to assign course');
    return res.json();
  },

  async updateProgress(enrollmentId: string, payload: { moduleId?: string; quizScore?: number; isFinal?: boolean }): Promise<Enrollment> {
    const res = await fetch(`/api/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return res.json();
  },

  async getReportSummary(): Promise<{
    complianceRate: number;
    totalEnrollments: number;
    completed: number;
    inProgress: number;
    overdue: number;
    totalCreditHours: number;
    avgHoursPerUser: number;
    totalCertificatesIssued: number;
    activeLearnersCount: number;
  }> {
    const res = await fetch('/api/reports/summary');
    if (!res.ok) throw new Error('Failed to fetch reports summary');
    return res.json();
  },

  async getDepartmentReports(): Promise<any[]> {
    const res = await fetch('/api/reports/departments');
    if (!res.ok) throw new Error('Failed to fetch department reports');
    return res.json();
  },

  async getApprovals(): Promise<ApprovalRequest[]> {
    const res = await fetch('/api/approvals');
    if (!res.ok) throw new Error('Failed to fetch approvals');
    return res.json();
  },

  async decideApproval(id: string, decision: 'Approved' | 'Rejected'): Promise<any> {
    const res = await fetch(`/api/approvals/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    if (!res.ok) throw new Error('Failed to decide approval');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }
};
