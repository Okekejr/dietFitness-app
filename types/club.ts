export interface ClubData {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  qr_code: string;
  location?: string;
  maxMembers?: number;
  logo?: string;
  created_at: string;
  created_by: string;
  max_members: number;
  members_count: string;
}
