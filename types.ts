
export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type RelationshipType = 'biological' | 'adoptive' | 'step' | 'foster' | 'godparent' | 'other';

export interface Memory {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string; // text or base64 data
  date?: string;
  title?: string;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  birthDate?: string;
  deathDate?: string;
  gender: Gender;
  bio?: string;
  photo?: string; // base64
  fatherId?: string;
  fatherType?: RelationshipType;
  motherId?: string;
  motherType?: RelationshipType;
  spouseId?: string;
  marriageDate?: string;
  memories: Memory[];
  createdAt: number;
}

export interface FamilyData {
  members: FamilyMember[];
}

export interface AIParsedFamily {
  members: Partial<FamilyMember>[];
}
