/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IsoControl {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  control_number?: string;
  implementation_guidance?: string;
  assessment_procedure?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // For additional dynamic fields
}

export interface IsoControlListRequest {
  skip?: number;
  limit?: number;
  name_filter?: string;
}

export interface IsoControlState {
  controls: IsoControl[];
  currentControl: IsoControl | null;
  isLoading: boolean;
  error: string | null;
  totalCount?: number;
}

export interface IsoControlActions {
  fetchControls: (params?: IsoControlListRequest) => Promise<void>;
  fetchControlById: (controlId: string) => Promise<void>;
  fetchControlByName: (name: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  clearControls: () => void;
  setCurrentControl: (control: IsoControl | null) => void;
}

export interface IsoControlSearchParams {
  skip?: number;
  limit?: number;
  name_filter?: string;
}
