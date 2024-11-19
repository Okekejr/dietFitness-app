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

export interface RouteData {
  startPoint: StartPointOrEndPoint;
  endPoint: StartPointOrEndPoint;
  estimatedTime: string;
  estimatedDistance: string;
  dateCreated: string;
}

export interface StartPointOrEndPoint {
  latitude: number;
  longitude: number;
}
export interface ActivityLogsT {
  id: number;
  user_id: string;
  activity_type: string;
  reference_id: string;
  custom_text: string;
  timestamp: string;
}
