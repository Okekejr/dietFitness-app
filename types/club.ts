export interface ClubData {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  qr_code: string;
  location?: string;
  logo?: string;
  created_at: string;
  created_by: string;
  max_members: number;
}

export interface isLeader {
  isLeader: boolean;
}
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteState {
  pointA: Coordinate | null;
  pointB: Coordinate | null;
}
