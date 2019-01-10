import { Evaluation } from '../evaluations/evaluation.model';

export interface User {
  uid?: string;
  email?: string;
  photoURL?: string;
  displayName?: string;
  organisation?: string;
  organisationId?: string;
  role?: string,
  isAdmin?: boolean,
  classes?: string[],
  subjects?: string[];
  imageURL?: string;
  thumbnailURL?: string;
  progress?: any;
  projects?: any;
  programs?: any;
  evaluation?: Evaluation;
  hasGoogleForEducation?: boolean;
}

export interface Progress {
  projectId?: string;
  green?: number;
  lightgreen?: number;
  yellow?: number;
  red?: number;
  remaining?: number;
}