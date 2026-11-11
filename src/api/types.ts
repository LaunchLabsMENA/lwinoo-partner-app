export type OtpMethod = 'phone' | 'email';
export type PartnerType = 'beauty' | 'fashion';
export type PartnerStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'APPROVED'
  | 'ACTIVE';
export type DocumentType = 'cr' | 'id' | 'license' | 'photos';
export type UploadPurpose = 'photo' | 'cover' | 'document';

export interface UploadedDocument {
  type: DocumentType;
  url: string;
}

export interface OnboardingData {
  partnerType: PartnerType;
  photoUrl: string | null;
  coverUrl: string | null;
  ownerName: string;
  businessName: string;
  description: string;
  phone: string;
  services: string[];
  city: string | null;
  address: string | null;
  team: string;
  days: string[];
  timeStart: string;
  timeEnd: string;
  breakEnabled: boolean;
  breakStart: string;
  breakEnd: string;
  area: 'travel' | 'clients';
  radius: number;
  inactiveServices: string[];
  documents: UploadedDocument[];
}

export interface PartnerMe {
  id: string;
  role: string;
  phone: string | null;
  email: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  profileCompleted: boolean;
  status: PartnerStatus;
  partnerType: PartnerType | null;
  onboarding: Partial<OnboardingData>;
  submittedAt: string | null;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface SessionResponse extends Tokens {
  expiresIn: number;
  isNewUser: boolean;
  profileCompleted: boolean;
  user: PartnerMe;
}
