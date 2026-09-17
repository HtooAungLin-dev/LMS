import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Course, Enrollment, User, AuditLog, ApprovalRequest } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Enterprise Seed Database
let users: User[] = [
  {
    id: 'usr-1',
    sapId: 'PERNR-100842',
    name: 'Helena Vance',
    email: 'h.vance@enterprise-sap.corp',
    role: 'admin',
    department: 'Corporate Learning & HR',
    jobTitle: 'Global LMS Principal Administrator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'Walldorf, Germany (HQ)'
  },
  {
    id: 'usr-2',
    sapId: 'PERNR-204918',
    name: 'Marcus Sterling',
    email: 'm.sterling@enterprise-sap.corp',
    role: 'manager',
    department: 'Cloud & Cyber Engineering',
    jobTitle: 'VP of Infrastructure & Security',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Palo Alto, California'
  },
  {
    id: 'usr-3',
    sapId: 'PERNR-309121',
    name: 'Dr. Aris Thorne',
    email: 'a.thorne@enterprise-sap.corp',
    role: 'instructor',
    department: 'SAP Academy & Knowledge Transfer',
    jobTitle: 'Lead Enterprise Solutions Architect & Certified Instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Zurich, Switzerland'
  },
  {
    id: 'usr-4',
    sapId: 'PERNR-401827',
    name: 'Sophia Chen',
    email: 's.chen@enterprise-sap.corp',
    role: 'learner',
    department: 'Cloud & Cyber Engineering',
    jobTitle: 'Senior Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr-2',
    location: 'Singapore'
  },
  {
    id: 'usr-5',
    sapId: 'PERNR-401828',
    name: 'David O\'Connor',
    email: 'd.oconnor@enterprise-sap.corp',
    role: 'learner',
    department: 'Finance & Global Risk',
    jobTitle: 'Treasury & Risk Analyst',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr-2',
    location: 'Dublin, Ireland'
  },
  {
    id: 'usr-6',
    sapId: 'PERNR-401829',
    name: 'Amara Okafor',
    email: 'a.okafor@enterprise-sap.corp',
    role: 'learner',
    department: 'Global Supply Chain',
    jobTitle: 'Logistics Operations Lead',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr-2',
    location: 'London, UK'
  }
];

let courses: Course[] = [
  {
    id: 'crs-1',
    itemId: 'SEC-4091-ISO',
    title: 'ISO 27001 & Enterprise Information Security 2026',
    description: 'Mandatory annual enterprise data hygiene, cryptographic access governance, zero-trust perimeter guidelines, and phishing defense protocols.',
    category: 'Compliance',
    deliveryMethod: 'eLearning',
    creditHours: 3.5,
    isMandatory: true,
    status: 'Published',
    instructorName: 'Dr. Aris Thorne',
    targetAudience: 'All Full-Time & Contract Personnel',
    prerequisites: ['SEC-1001 General IT Onboarding'],
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    version: '4.2.0',
    createdAt: '2026-01-10T08:00:00Z',
    modules: [
      {
        id: 'mod-1',
        title: 'Section 1: Information Security Governance & Classification',
        durationMinutes: 45,
        type: 'reading',
        content: 'Enterprise information must be classified according to the 4-tier SAP standard: Public, Internal, Confidential, and Strictly Confidential. Personal Identifiable Information (PII) of employees and clients must be encrypted at rest (AES-256) and in transit (TLS 1.3). Never paste production credentials into unvetted tools.'
      },
      {
        id: 'mod-2',
        title: 'Section 2: Social Engineering & Zero-Trust Defense',
        durationMinutes: 45,
        type: 'interactive',
        content: 'Zero Trust architecture enforces "Never Trust, Always Verify". In this simulation, inspect anomalous email headers, identify spoofed subdomains, and verify multi-factor push notifications against MFA exhaustion attacks.'
      },
      {
        id: 'mod-3',
        title: 'Section 3: Incident Escalation & CERT SLA Workflow',
        durationMinutes: 30,
        type: 'reading',
        content: 'Any suspected security incident must be escalated to the 24/7 Security Operations Center (SOC) within 60 minutes. Use the emergency hotline or the internal incident portal. Do not attempt to analyze malicious attachments independently.'
      },
      {
        id: 'mod-4',
        title: 'Final Knowledge Check & Verification Assessment',
        durationMinutes: 30,
        type: 'quiz',
        quizQuestions: [
          {
            id: 'q1',
            question: 'What is the mandatory encryption standard for Strictly Confidential customer records at rest?',
            options: ['DES-56', 'AES-256 with managed KMS keys', 'Base64 obfuscation', 'Plain text with strict file permissions'],
            correctIndex: 1,
            explanation: 'AES-256 with enterprise Hardware Security Module (HSM) or managed KMS is the required baseline.'
          },
          {
            id: 'q2',
            question: 'Within what time frame must a suspected credential leakage be reported to the enterprise SOC?',
            options: ['Within 24 business hours', 'Within 7 calendar days', 'Within 60 minutes', 'At the end of the current sprint'],
            correctIndex: 2,
            explanation: 'Security SLAs mandate initial reporting to the 24/7 SOC within 60 minutes of detection.'
          },
          {
            id: 'q3',
            question: 'Under the Zero Trust framework, which principle governs resource access?',
            options: ['Implicit trust for corporate VPN users', 'Verify once per month', 'Never trust, always verify every request', 'Trust all internal subnets'],
            correctIndex: 2,
            explanation: 'Zero Trust assumes breach and requires continuous explicit verification regardless of network location.'
          }
        ]
      }
    ]
  },
  {
    id: 'crs-2',
    itemId: 'SAP-BTP-802',
    title: 'SAP Business Technology Platform (BTP) Solution Architecture',
    description: 'Master enterprise extensions, SAP Integration Suite, CAP (Cloud Application Programming) model, and SAP HANA Cloud scalability.',
    category: 'Technology',
    deliveryMethod: 'Blended',
    creditHours: 12.0,
    isMandatory: false,
    status: 'Published',
    instructorName: 'Dr. Aris Thorne',
    targetAudience: 'Architects, Lead Developers, Systems Integrators',
    prerequisites: ['Basic Cloud Architecture', 'REST & OData v4 Fundamentals'],
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    version: '3.1.0',
    createdAt: '2026-02-01T10:00:00Z',
    modules: [
      {
        id: 'mod-201',
        title: 'Module 1: SAP BTP Multi-Cloud Runtime & Subaccount Topology',
        durationMinutes: 60,
        type: 'reading',
        content: 'Understand Global Accounts, Directories, Subaccounts, and Cloud Foundry / Kyma runtime environments for enterprise workloads.'
      },
      {
        id: 'mod-202',
        title: 'Module 2: Cloud Application Programming (CAP) and Core Data Services (CDS)',
        durationMinutes: 90,
        type: 'interactive',
        content: 'Hands-on guide to defining CDS schemas, service exposures, event handlers, and SAP Fiori Elements UI annotations.'
      },
      {
        id: 'mod-203',
        title: 'Module 3: Certification Readiness Quiz',
        durationMinutes: 30,
        type: 'quiz',
        quizQuestions: [
          {
            id: 'btp-q1',
            question: 'Which tool is primarily used in SAP CAP to declare data models and service definitions?',
            options: ['Core Data Services (CDS)', 'HTML5 Boilerplate', 'XSLT Transform', 'JSON Schema 2020'],
            correctIndex: 0,
            explanation: 'CDS is the universal modeling language in SAP Cloud Application Programming.'
          },
          {
            id: 'btp-q2',
            question: 'What is the containerized Kubernetes-based runtime offered on SAP BTP alongside Cloud Foundry?',
            options: ['Docker Swarm', 'Kyma runtime', 'OpenVZ', 'Mesos'],
            correctIndex: 1,
            explanation: 'SAP BTP Kyma runtime provides managed Kubernetes with Istio and eventing.'
          }
        ]
      }
    ]
  },
  {
    id: 'crs-3',
    itemId: 'COMP-GDPR-104',
    title: 'Global Privacy, GDPR & AI Ethics Regulation 2026',
    description: 'Essential compliance on EU AI Act provisions, cross-border telemetry constraints, automated decision transparency, and data subject rights.',
    category: 'Compliance',
    deliveryMethod: 'eLearning',
    creditHours: 2.0,
    isMandatory: true,
    status: 'Published',
    instructorName: 'Legal & Compliance Bureau',
    targetAudience: 'Engineering, Product Managers, Data Scientists',
    prerequisites: [],
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    version: '2.0.1',
    createdAt: '2026-03-05T14:30:00Z',
    modules: [
      {
        id: 'mod-301',
        title: 'Chapter 1: EU AI Act High-Risk Classifications',
        durationMinutes: 40,
        type: 'reading',
        content: 'The EU AI Act categorizes AI systems into Unacceptable Risk, High Risk, Specific Transparency Risk, and Minimal Risk. Systems evaluating employee performance or biometric data are subject to rigorous conformity assessments and human oversight.'
      },
      {
        id: 'mod-302',
        title: 'Chapter 2: Subject Access Requests (SAR) & The Right to Explanation',
        durationMinutes: 35,
        type: 'reading',
        content: 'Data subjects are entitled to request copies of their processed data and an explainable rationale when automated processing decisions affect their legal status.'
      },
      {
        id: 'mod-303',
        title: 'Chapter 3: Compliance Knowledge Check',
        durationMinutes: 20,
        type: 'quiz',
        quizQuestions: [
          {
            id: 'gdpr-q1',
            question: 'Under the EU AI Act, AI systems used in human resources recruitment and performance evaluation fall under which category?',
            options: ['Minimal Risk', 'High Risk', 'Unregulated', 'Military Exemption'],
            correctIndex: 1,
            explanation: 'Employment and workforce evaluation systems are explicitly classified as High Risk.'
          }
        ]
      }
    ]
  },
  {
    id: 'crs-4',
    itemId: 'LEAD-EXEC-502',
    title: 'Executive Leadership: Strategic Decision Frameworks',
    description: 'Executive course for People Managers covering change management, high-performance coaching, psychological safety, and organizational agility.',
    category: 'Leadership',
    deliveryMethod: 'VirtualClassroom',
    creditHours: 6.0,
    isMandatory: false,
    status: 'Published',
    instructorName: 'Helena Vance',
    targetAudience: 'Directors, Senior Managers, Team Leads',
    prerequisites: [],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    version: '1.4.0',
    createdAt: '2026-01-20T09:00:00Z',
    modules: [
      {
        id: 'mod-401',
        title: 'Session 1: Psychological Safety in High-Stakes Teams',
        durationMinutes: 60,
        type: 'reading',
        content: 'Creating an environment where risk-taking and vulnerability are rewarded rather than penalized.'
      },
      {
        id: 'mod-402',
        title: 'Session 2: Scenario Simulation & Case Studies',
        durationMinutes: 90,
        type: 'interactive',
        content: 'Navigate complex restructuring, conflicting shareholder interests, and cross-functional team alignment.'
      }
    ]
  },
  {
    id: 'crs-5',
    itemId: 'OPS-LEAN-301',
    title: 'Global Supply Chain Resilience & Lean Six Sigma',
    description: 'Optimization of inventory buffers, geopolitical risk mitigation, supplier audit checklists, and defect reduction protocols.',
    category: 'Supply Chain',
    deliveryMethod: 'eLearning',
    creditHours: 4.0,
    isMandatory: false,
    status: 'Published',
    instructorName: 'Amara Okafor',
    targetAudience: 'Supply Chain, Procurement, Operations',
    prerequisites: [],
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    version: '2.2.0',
    createdAt: '2026-02-15T11:00:00Z',
    modules: [
      {
        id: 'mod-501',
        title: 'Module 1: Value Stream Mapping in Modern Distribution',
        durationMinutes: 45,
        type: 'reading',
        content: 'Eliminating non-value added time across warehouse fulfillment, customs transit, and last-mile delivery.'
      }
    ]
  }
];

let enrollments: Enrollment[] = [
  {
    id: 'enr-1',
    courseId: 'crs-1',
    userId: 'usr-4', // Sophia Chen
    assignedBy: 'Assignment Profile (Automated)',
    assignedDate: '2026-01-15',
    dueDate: '2026-10-31',
    status: 'In Progress',
    progressPercent: 50,
    completedModuleIds: ['mod-1', 'mod-2']
  },
  {
    id: 'enr-2',
    courseId: 'crs-2',
    userId: 'usr-4', // Sophia Chen
    assignedBy: 'Manager (Marcus Sterling)',
    assignedDate: '2026-02-10',
    dueDate: '2026-11-15',
    status: 'In Progress',
    progressPercent: 33,
    completedModuleIds: ['mod-201']
  },
  {
    id: 'enr-3',
    courseId: 'crs-3',
    userId: 'usr-4', // Sophia Chen
    assignedBy: 'Assignment Profile (Automated)',
    assignedDate: '2026-03-10',
    dueDate: '2026-08-15',
    completedDate: '2026-08-12',
    status: 'Completed',
    progressPercent: 100,
    completedModuleIds: ['mod-301', 'mod-302', 'mod-303'],
    quizScore: 100,
    certificateId: 'HAL-CERT-2026-849102'
  },
  {
    id: 'enr-4',
    courseId: 'crs-1',
    userId: 'usr-5', // David O'Connor
    assignedBy: 'Assignment Profile (Automated)',
    assignedDate: '2026-01-15',
    dueDate: '2026-03-01',
    status: 'Overdue',
    progressPercent: 25,
    completedModuleIds: ['mod-1']
  },
  {
    id: 'enr-5',
    courseId: 'crs-3',
    userId: 'usr-5', // David O'Connor
    assignedBy: 'Assignment Profile (Automated)',
    assignedDate: '2026-03-10',
    dueDate: '2026-09-30',
    status: 'Not Started',
    progressPercent: 0,
    completedModuleIds: []
  },
  {
    id: 'enr-6',
    courseId: 'crs-1',
    userId: 'usr-6', // Amara Okafor
    assignedBy: 'Assignment Profile (Automated)',
    assignedDate: '2026-01-15',
    dueDate: '2026-10-31',
    completedDate: '2026-02-28',
    status: 'Completed',
    progressPercent: 100,
    completedModuleIds: ['mod-1', 'mod-2', 'mod-3', 'mod-4'],
    quizScore: 92,
    certificateId: 'HAL-CERT-2026-118492'
  }
];

let approvals: ApprovalRequest[] = [
  {
    id: 'appr-1',
    enrollmentId: 'enr-pending-1',
    courseId: 'crs-2',
    courseTitle: 'SAP Business Technology Platform (BTP) Solution Architecture',
    userId: 'usr-5',
    userName: 'David O\'Connor',
    userDepartment: 'Finance & Global Risk',
    requestDate: '2026-09-12',
    cost: '$1,200 USD (Sponsored Unit)',
    status: 'Pending'
  },
  {
    id: 'appr-2',
    enrollmentId: 'enr-pending-2',
    courseId: 'crs-4',
    courseTitle: 'Executive Leadership: Strategic Decision Frameworks',
    userId: 'usr-4',
    userName: 'Sophia Chen',
    userDepartment: 'Cloud & Cyber Engineering',
    requestDate: '2026-09-14',
    cost: '$850 USD',
    status: 'Pending'
  }
];

let auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-16T18:42:00Z',
    actorName: 'Helena Vance',
    actorRole: 'admin',
    action: 'COURSE_CATALOG_SYNC',
    entityType: 'Course',
    details: 'Synced Item ID SEC-4091-ISO revision 4.2.0 across global HAL Learning Curricula.'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-16T14:15:00Z',
    actorName: 'Marcus Sterling',
    actorRole: 'manager',
    action: 'ASSIGNMENT_RULE_EXECUTED',
    entityType: 'Assignment',
    details: 'Triggered automated assignment profile for Cloud & Cyber Engineering (34 active learners).'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-15T09:30:00Z',
    actorName: 'Sophia Chen',
    actorRole: 'learner',
    action: 'CERTIFICATE_ISSUED',
    entityType: 'User',
    details: 'Completed COMP-GDPR-104 with 100% quiz score. Certificate HAL-CERT-2026-849102 generated.'
  }
];

// ----------------- API ENDPOINTS -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'HAL SuccessFactors Learning Backend (Express)',
    timestamp: new Date().toISOString(),
    records: {
      users: users.length,
      courses: courses.length,
      enrollments: enrollments.length
    }
  });
});

// Users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Courses: list and filter
app.get('/api/courses', (req, res) => {
  const { category, search, mandatory, delivery } = req.query;
  let result = [...courses];

  if (category && category !== 'All') {
    result = result.filter(c => c.category === category);
  }
  if (delivery && delivery !== 'All') {
    result = result.filter(c => c.deliveryMethod === delivery);
  }
  if (mandatory === 'true') {
    result = result.filter(c => c.isMandatory);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.itemId.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }
  res.json(result);
});

// Create Course (Admin & Instructor)
app.post('/api/courses', (req, res) => {
  const body = req.body;
  const newCourse: Course = {
    id: `crs-${Date.now()}`,
    itemId: body.itemId || `HAL-${Math.floor(1000 + Math.random() * 9000)}`,
    title: body.title || 'Untitled Learning Item',
    description: body.description || '',
    category: body.category || 'Technology',
    deliveryMethod: body.deliveryMethod || 'eLearning',
    creditHours: Number(body.creditHours) || 1.0,
    isMandatory: Boolean(body.isMandatory),
    status: body.status || 'Published',
    instructorName: body.instructorName || 'HAL Certified Faculty',
    targetAudience: body.targetAudience || 'General Workforce',
    prerequisites: body.prerequisites || [],
    thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    modules: body.modules && body.modules.length > 0 ? body.modules : [
      {
        id: `mod-${Date.now()}-1`,
        title: 'Overview & Objectives',
        durationMinutes: 30,
        type: 'reading',
        content: 'Welcome to this HAL verified learning program. Complete all curriculum modules to earn credit.'
      }
    ]
  };

  courses.unshift(newCourse);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: body.actorName || 'Administrator',
    actorRole: body.actorRole || 'admin',
    action: 'COURSE_CREATED',
    entityType: 'Course',
    details: `Created new item "${newCourse.title}" [${newCourse.itemId}]`
  });

  res.status(201).json(newCourse);
});

// Update Course
app.put('/api/courses/:id', (req, res) => {
  const index = courses.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  courses[index] = { ...courses[index], ...req.body };

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: req.body.actorName || 'Course Author',
    actorRole: req.body.actorRole || 'admin',
    action: 'COURSE_UPDATED',
    entityType: 'Course',
    details: `Updated item "${courses[index].title}" [${courses[index].itemId}]`
  });

  res.json(courses[index]);
});

// Delete Course
app.delete('/api/courses/:id', (req, res) => {
  const index = courses.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const removed = courses.splice(index, 1)[0];
  enrollments = enrollments.filter(e => e.courseId !== req.params.id);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: 'System Administrator',
    actorRole: 'admin',
    action: 'COURSE_REMOVED',
    entityType: 'Course',
    details: `Removed catalog item "${removed.title}" [${removed.itemId}]`
  });

  res.json({ message: 'Deleted successfully', item: removed });
});

// Enrollments: Get
app.get('/api/enrollments', (req, res) => {
  const { userId, status } = req.query;
  let result = [...enrollments];
  if (userId) {
    result = result.filter(e => e.userId === userId);
  }
  if (status && status !== 'All') {
    result = result.filter(e => e.status === status);
  }
  res.json(result);
});

// Assign / Self-Enroll
app.post('/api/enrollments', (req, res) => {
  const { courseId, userIds, assignedBy, dueDate } = req.body;
  if (!courseId || !userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: 'Missing courseId or userIds array' });
  }

  const created: Enrollment[] = [];
  const targetDueDate = dueDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const uid of userIds) {
    const existing = enrollments.find(e => e.courseId === courseId && e.userId === uid);
    if (!existing) {
      const newEnr: Enrollment = {
        id: `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        courseId,
        userId: uid,
        assignedBy: assignedBy || 'Manager Assignment',
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: targetDueDate,
        status: 'Not Started',
        progressPercent: 0,
        completedModuleIds: []
      };
      enrollments.push(newEnr);
      created.push(newEnr);
    }
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: assignedBy || 'Assignment Manager',
    actorRole: 'manager',
    action: 'BULK_ASSIGNMENT_EXECUTED',
    entityType: 'Assignment',
    details: `Assigned course ${courseId} to ${created.length} learners (Due: ${targetDueDate})`
  });

  res.status(201).json({ assignedCount: created.length, enrollments: created });
});

// Update Enrollment Progress & Mark Module Complete
app.put('/api/enrollments/:id/progress', (req, res) => {
  const enr = enrollments.find(e => e.id === req.params.id);
  if (!enr) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  const { moduleId, quizScore, isFinal } = req.body;
  const course = courses.find(c => c.id === enr.courseId);

  if (moduleId && !enr.completedModuleIds.includes(moduleId)) {
    enr.completedModuleIds.push(moduleId);
  }

  const totalModules = course?.modules.length || 1;
  const completedCount = enr.completedModuleIds.length;
  enr.progressPercent = Math.min(100, Math.round((completedCount / totalModules) * 100));

  if (quizScore !== undefined) {
    enr.quizScore = quizScore;
  }

  if (enr.progressPercent >= 100 || isFinal) {
    enr.status = 'Completed';
    enr.progressPercent = 100;
    enr.completedDate = new Date().toISOString().split('T')[0];
    if (!enr.certificateId) {
      enr.certificateId = `HAL-CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    }
  } else if (enr.progressPercent > 0) {
    enr.status = 'In Progress';
  }

  res.json(enr);
});

// Reports: Summary & Advanced Metrics
app.get('/api/reports/summary', (req, res) => {
  const totalEnrollments = enrollments.length;
  const completed = enrollments.filter(e => e.status === 'Completed').length;
  const inProgress = enrollments.filter(e => e.status === 'In Progress').length;
  const overdue = enrollments.filter(e => e.status === 'Overdue').length;
  const complianceRate = totalEnrollments > 0 ? ((completed / totalEnrollments) * 100).toFixed(1) : '100.0';

  const totalCreditHours = enrollments.reduce((acc, curr) => {
    const crs = courses.find(c => c.id === curr.courseId);
    if (crs && curr.status === 'Completed') {
      return acc + crs.creditHours;
    }
    return acc;
  }, 0);

  const avgHoursPerUser = users.length > 0 ? (totalCreditHours / users.length).toFixed(1) : '0';

  res.json({
    complianceRate: Number(complianceRate),
    totalEnrollments,
    completed,
    inProgress,
    overdue,
    totalCreditHours: Number(totalCreditHours.toFixed(1)),
    avgHoursPerUser: Number(avgHoursPerUser),
    totalCertificatesIssued: enrollments.filter(e => !!e.certificateId).length,
    activeLearnersCount: users.filter(u => u.role === 'learner').length
  });
});

// Reports: Departmental Breakdown
app.get('/api/reports/departments', (req, res) => {
  const departments = Array.from(new Set(users.map(u => u.department)));
  const result = departments.map(dept => {
    const deptUsers = users.filter(u => u.department === dept);
    const deptUserIds = deptUsers.map(u => u.id);
    const deptEnrollments = enrollments.filter(e => deptUserIds.includes(e.userId));

    const total = deptEnrollments.length;
    const completed = deptEnrollments.filter(e => e.status === 'Completed').length;
    const inProgress = deptEnrollments.filter(e => e.status === 'In Progress').length;
    const overdue = deptEnrollments.filter(e => e.status === 'Overdue').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100;

    return {
      department: dept,
      totalLearners: deptUsers.length,
      totalEnrollments: total,
      completedCount: completed,
      inProgressCount: inProgress,
      overdueCount: overdue,
      complianceRate: rate
    };
  });

  res.json(result);
});

// Approvals (Manager)
app.get('/api/approvals', (req, res) => {
  res.json(approvals);
});

app.post('/api/approvals/:id/decision', (req, res) => {
  const { decision } = req.body; // 'Approved' | 'Rejected'
  const appr = approvals.find(a => a.id === req.params.id);
  if (!appr) {
    return res.status(404).json({ error: 'Request not found' });
  }
  appr.status = decision === 'Approved' ? 'Approved' : 'Rejected';

  if (decision === 'Approved') {
    // Add enrollment
    const newEnr: Enrollment = {
      id: `enr-${Date.now()}`,
      courseId: appr.courseId,
      userId: appr.userId,
      assignedBy: 'Manager Approval',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Not Started',
      progressPercent: 0,
      completedModuleIds: []
    };
    enrollments.push(newEnr);
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: 'Marcus Sterling',
    actorRole: 'manager',
    action: `APPROVAL_${decision.toUpperCase()}`,
    entityType: 'Assignment',
    details: `${decision} enrollment request for ${appr.userName} on ${appr.courseTitle}`
  });

  res.json({ message: `Request ${decision}`, request: appr });
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
});

// ----------------- VITE MIDDLEWARE / SPA SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HAL SuccessFactors Learning Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
