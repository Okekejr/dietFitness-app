export interface ClubData {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  qr_code: string;
  location?: string;
  maxMembers?: number;
  logo?: string;
}
