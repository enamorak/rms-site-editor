import { RequestHandler } from "express";
import * as yaml from "js-yaml";
import {
  Building,
  Level,
  Vertex,
  Wall,
  Door,
  Lane,
  Floor,
  Measurement,
  Lift,
  MapImportRequest,
  MapImportResponse,
} from "@shared/rmf-types";

interface YamlVertex extends Array<any> {
  0: number; // x
  1: number; // y
  2: number; // z
  3: string; // name
  4: Record<string, any>; // params
}

interface YamlLevel {
  elevation: number;
  drawing?: {
    filename: string;
    meters_per_pixel?: number;
  };
  flattened_x_offset?: number;
  flattened_y_offset?: number;
  vertices: YamlVertex[];
  walls: Array<[number, number, Record<string, any>]>;
  doors: Array<[number, number, string, Record<string, any>]>;
  lanes: Array<[number, number, Record<string, any>]>;
  floors: Array<[number[], Record<string, any>]>;
  measurements: Array<[number, number, number]>;
  models?: any[];
}

interface YamlBuilding {
  name: string;
  levels: Record<string, YamlLevel>;
  lifts: any[];
}

function convertYamlToBuilding(yamlBuilding: YamlBuilding): Building {
  const levels: Record<string, Level> = {};

  for (const [levelName, yamlLevel] of Object.entries(yamlBuilding.levels)) {
    // Convert vertices from YAML format
    const vertices: Vertex[] = yamlLevel.vertices.map((yamlVertex) => ({
      x: yamlVertex[0],
      y: yamlVertex[1],
      z: yamlVertex[2],
      name: yamlVertex[3] || undefined,
      params:
        yamlVertex[4] && Object.keys(yamlVertex[4]).length > 0
          ? yamlVertex[4]
          : undefined,
    }));

    // Convert walls from YAML format
    const walls: Wall[] = yamlLevel.walls.map((yamlWall) => ({
      startVertexIndex: yamlWall[0],
      endVertexIndex: yamlWall[1],
      params:
        yamlWall[2] && Object.keys(yamlWall[2]).length > 0
          ? yamlWall[2]
          : undefined,
    }));

    // Convert doors from YAML format
    const doors: Door[] = yamlLevel.doors.map((yamlDoor) => ({
      startVertexIndex: yamlDoor[0],
      endVertexIndex: yamlDoor[1],
      name: yamlDoor[2],
      type: yamlDoor[3].type || "hinged",
      params: (() => {
        const { type, ...params } = yamlDoor[3];
        return Object.keys(params).length > 0 ? params : undefined;
      })(),
    }));

    // Convert lanes from YAML format
    const lanes: Lane[] = yamlLevel.lanes.map((yamlLane) => ({
      startVertexIndex: yamlLane[0],
      endVertexIndex: yamlLane[1],
      graphIndex: yamlLane[2].graph_idx || 0,
      orientation: yamlLane[2].orientation,
      params: (() => {
        const { graph_idx, orientation, ...params } = yamlLane[2];
        return Object.keys(params).length > 0 ? params : undefined;
      })(),
    }));

    // Convert floors from YAML format
    const floors: Floor[] = yamlLevel.floors.map((yamlFloor) => ({
      vertexIndices: yamlFloor[0],
      texture: yamlFloor[1].texture,
      scale: yamlFloor[1].scale,
      params: (() => {
        const { texture, scale, ...params } = yamlFloor[1];
        return Object.keys(params).length > 0 ? params : undefined;
      })(),
    }));

    // Convert measurements from YAML format
    const measurements: Measurement[] = yamlLevel.measurements.map(
      (yamlMeasurement) => ({
        startVertexIndex: yamlMeasurement[0],
        endVertexIndex: yamlMeasurement[1],
        distance: yamlMeasurement[2],
      }),
    );

    levels[levelName] = {
      elevation: yamlLevel.elevation,
      drawing: yamlLevel.drawing,
      flattened_x_offset: yamlLevel.flattened_x_offset,
      flattened_y_offset: yamlLevel.flattened_y_offset,
      vertices,
      walls,
      doors,
      lanes,
      floors,
      measurements,
      models: yamlLevel.models,
    };
  }

  // Convert lifts from YAML format
  const lifts: Lift[] = yamlBuilding.lifts.map((yamlLift) => ({
    name: yamlLift.name,
    levels: yamlLift.levels,
    position: yamlLift.position,
    doors: yamlLift.doors,
    params:
      yamlLift.params && Object.keys(yamlLift.params).length > 0
        ? yamlLift.params
        : undefined,
  }));

  return {
    name: yamlBuilding.name,
    levels,
    lifts,
  };
}

export const handleImportMap: RequestHandler = (req, res) => {
  try {
    const { data, format }: MapImportRequest = req.body;

    if (!data || !format) {
      const response: MapImportResponse = {
        success: false,
        error: "Missing data or format",
      };
      return res.status(400).json(response);
    }

    let building: Building;

    if (format === "yaml") {
      try {
        const yamlBuilding = yaml.load(data) as YamlBuilding;
        building = convertYamlToBuilding(yamlBuilding);
      } catch (yamlError) {
        const response: MapImportResponse = {
          success: false,
          error: `Invalid YAML format: ${yamlError instanceof Error ? yamlError.message : "Unknown error"}`,
        };
        return res.status(400).json(response);
      }
    } else if (format === "json") {
      try {
        building = JSON.parse(data) as Building;
      } catch (jsonError) {
        const response: MapImportResponse = {
          success: false,
          error: `Invalid JSON format: ${jsonError instanceof Error ? jsonError.message : "Unknown error"}`,
        };
        return res.status(400).json(response);
      }
    } else {
      const response: MapImportResponse = {
        success: false,
        error: "Unsupported format. Use 'yaml' or 'json'.",
      };
      return res.status(400).json(response);
    }

    // Validate the building structure
    if (
      !building.name ||
      !building.levels ||
      typeof building.levels !== "object"
    ) {
      const response: MapImportResponse = {
        success: false,
        error: "Invalid building structure: missing name or levels",
      };
      return res.status(400).json(response);
    }

    const response: MapImportResponse = {
      success: true,
      building,
    };

    res.json(response);
  } catch (error) {
    console.error("Import error:", error);
    const response: MapImportResponse = {
      success: false,
      error: "Internal server error during import",
    };
    res.status(500).json(response);
  }
};
