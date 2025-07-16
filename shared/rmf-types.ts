export interface Vertex {
  x: number;
  y: number;
  z: number;
  name?: string;
  params?: Record<string, any>;
}

export interface Wall {
  startVertexIndex: number;
  endVertexIndex: number;
  params?: Record<string, any>;
}

export interface Door {
  startVertexIndex: number;
  endVertexIndex: number;
  type: "hinged" | "sliding" | "double_hinged" | "double_sliding";
  name: string;
  params?: Record<string, any>;
}

export interface Lane {
  startVertexIndex: number;
  endVertexIndex: number;
  graphIndex: number; // 0-8 for different robot fleets
  orientation?: "forward" | "backward" | "bidirectional";
  params?: Record<string, any>;
}

export interface Floor {
  vertexIndices: number[];
  texture?: string;
  scale?: number;
  params?: Record<string, any>;
}

export interface Measurement {
  startVertexIndex: number;
  endVertexIndex: number;
  distance: number; // in meters
}

export interface Drawing {
  filename: string;
  meters_per_pixel?: number;
}

export interface Level {
  elevation: number;
  drawing?: Drawing;
  flattened_x_offset?: number;
  flattened_y_offset?: number;
  vertices: Vertex[];
  walls: Wall[];
  doors: Door[];
  lanes: Lane[];
  floors: Floor[];
  measurements: Measurement[];
  models?: any[];
}

export interface Lift {
  name: string;
  levels: string[];
  position?: [number, number];
  doors?: Door[];
  params?: Record<string, any>;
}

export interface Building {
  name: string;
  levels: Record<string, Level>;
  lifts: Lift[];
}

export interface RobotModel {
  name: string;
  type: "differential_drive" | "omnidirectional" | "ackermann";
  footprint: {
    radius?: number;
    vertices?: [number, number][];
  };
  max_speed?: number;
  max_angular_speed?: number;
}

export interface RobotFleet {
  name: string;
  robotType: string;
  graphIndex: number;
  robots: Robot[];
}

export interface Robot {
  id: string;
  name: string;
  fleetName: string;
  position?: [number, number, number];
  orientation?: number;
  status: "idle" | "moving" | "charging" | "offline";
  batteryLevel?: number;
  currentTask?: string;
}

export interface MapExportRequest {
  building: Building;
  format: "yaml" | "json";
}

export interface MapExportResponse {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}

export interface MapImportRequest {
  data: string;
  format: "yaml" | "json";
}

export interface MapImportResponse {
  success: boolean;
  building?: Building;
  error?: string;
}
