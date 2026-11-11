export type Channel = 'phone' | 'email';
export type AuthMode = 'login' | 'signup';
export type NextAction = 'BUSINESS_SETUP' | 'VERIFICATION_STATUS' | 'BUSINESS_PORTAL';
export type BusinessStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type SetupStep =
  | 'PROFILE'
  | 'SCHEDULE'
  | 'SERVICE_AREA'
  | 'SERVICES'
  | 'DOCUMENTS'
  | 'PAYOUT'
  | 'SUBMITTED';
export type TeamSize = 'SOLO' | 'TWO_TO_FIVE' | 'SIX_TO_TEN' | 'TEN_PLUS';
export type ServiceLocation = 'TRAVELS_TO_CLIENT' | 'CLIENT_COMES';
export type DocumentType =
  | 'COMMERCIAL_REGISTRATION'
  | 'NATIONAL_ID'
  | 'PROFESSIONAL_LICENSE'
  | 'PREMISES_PHOTO'
  | 'BALADI_LICENSE'
  | 'VAT_CERTIFICATE'
  | 'FREELANCE_PERMIT'
  | 'PORTFOLIO_PHOTO';
export type DocumentStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type UploadPurpose = 'photo' | 'document';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  avatar: string | null;
  role: string;
}

/** The short business record that comes with sign-in and `/api/auth/me`. */
export interface BusinessSummary {
  id: string;
  status: BusinessStatus;
  setupStep: SetupStep;
  name: string | null;
  rejectionReason: string | null;
}

export interface Account {
  user: User;
  business: BusinessSummary | null;
  nextAction: NextAction;
}

export interface AuthResponse extends Account, Tokens {
  expiresIn: string | number;
  isNewUser: boolean;
}

export interface OtpSent {
  channel: Channel;
  identifier: string;
  expiresIn: number;
  resendAfter: number;
}

export interface PartnerType {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  imageUrl: string | null;
  requiredDocuments: DocumentType[];
  requiresCategories: boolean;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string | null;
}

export interface Business {
  id: string;
  partnerType: { id: string; requiredDocuments: DocumentType[]; requiresCategories: boolean };
  status: BusinessStatus;
  setupStep: SetupStep;
  rejectionReason: string | null;
  statusReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  ownerName: string | null;
  name: string | null;
  description: string | null;
  phone: string | null;
  categories: (Category | string)[];
  city: string | null;
  district: string | null;
  street: string | null;
  teamSize: TeamSize | null;
  serviceLocation: ServiceLocation | null;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number | null;
  crNumber: string | null;
  bankName: string | null;
  iban: string | null;
  termsAcceptedAt: string | null;
}

export interface ScheduleDay {
  dayOfWeek: number;
  start: string;
  end: string;
  breakStart: string | null;
  breakEnd: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  categoryId: string | null;
  price: number | string | null;
  durationMinutes: number | null;
  isActive: boolean;
}

export interface ServiceInput {
  name?: string;
  description?: string | null;
  imageFileId?: string | null;
  tags?: string[];
  categoryId?: string | null;
  price?: number | null;
  durationMinutes?: number | null;
  isActive?: boolean;
}

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  fileId: string;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  status: DocumentStatus;
  rejectionReason: string | null;
  uploadedAt: string;
}

/** What every setup call answers with. `business` is null until the partner type is saved. */
export interface BusinessSetup {
  business: Business | null;
  schedule: ScheduleDay[];
  services: Service[];
  documents: BusinessDocument[];
  progress: Record<string, boolean>;
}

export interface ProfileInput {
  logoFileId?: string | null;
  coverFileId?: string | null;
  ownerName: string;
  name: string;
  description: string | null;
  phone: string;
  categoryIds: string[];
  city: string;
  district: string | null;
  street: string;
  teamSize: TeamSize;
  crNumber?: string;
}

export interface ServiceAreaInput {
  serviceLocation: ServiceLocation;
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export interface PayoutInput {
  bankName: string;
  iban: string;
  acceptedTerms: boolean;
}

export interface UploadedFile {
  fileId: string;
  url: string;
}

export interface Place {
  placeId: string;
  formattedAddress: string;
  city: string | null;
  district: string | null;
  latitude: number;
  longitude: number;
}
