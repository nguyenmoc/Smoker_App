export enum Role {
  CUSTOMER = 'customer',
  BAR_OWNER = 'bar_owner',
  DJ = 'dj',
  DANCER = 'dancer',
}

export type AccountType = 'personal' | 'dj' | 'bar' | 'dancer';

export interface Account {
  BussinessAccountId: string;
  AccountId: string;
  BankInfoId: string | null;
  UserName: string;
  Role: Role;
  Avatar: string;
  Background: string;
  Phone: string;
  Address: string;
  Bio: string;
  Status: 'pending' | 'active' | 'inactive';
  Gender: string;
  PricePerHours: number | null;
  PricePerSession: number | null;
  created_at: string;
  EntityAccountId: string;
  // Computed fields for UI
  id?: string; // Will map to BussinessAccountId
  name?: string; // Will map to UserName
  email?: string; // If available
  type?: AccountType; // Derived from Role
  typeLabel?: string; // Display label
  isActive?: boolean; // Derived from Status
}

export interface CreateAccountRequestData {
  type: AccountType;
  name: string;
  email: string;
  phone?: string;
  avatar?: UploadFile;
  background?: UploadFile;
  gender?: string;
  address?: string;
  bio?: string;
  // Specific fields for DJ/Dancer account
  pricePerHours?: number;
  pricePerSession?: number;
  djName?: string;
  genre?: string[];
  // Specific fields for Bar account
  barName?: string;
  description?: string;
}

export interface SwitchAccountRequestData {
  accountId: string;
}

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface AccountListResponse {
  status: string;
  data: Account[];
}