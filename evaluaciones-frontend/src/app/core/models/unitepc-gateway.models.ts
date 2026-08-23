/**
 * Modelo de datos del Gateway UNITEPC (SEA / SISA)
 * @author Ariel Camara / XpertiFlow
 */

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

export interface BranchOffice {
  branchOfficeId: string;
  code: string;
  name: string;
}

export interface Career {
  careerId: string;
  careerCode: string;
  careerName: string;
}

export interface Course {
  syllabusCourseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  semester: number;
}

export interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  campus: string;
}

export interface GroupItem {
  groupId: string;
  code: string;
  classType: string;
  syllabusCourseId: string;
  careerId: string;
  branchOfficeId: string;
  term: string;
  teacherName: string;
  teacherIdentityNumber: string;
  groupLinkId: string | null;
  schedules: ScheduleItem[];
  rotations: any | null;
}

export interface Campus {
  campusId?: string;
  name: string;
  branchOfficeId?: string;
  code?: string;
}

export interface TimeFrame {
  timeFrameId?: string;
  name: string;
  code: string;
  isActive?: boolean;
}
