import { RequestHandler } from "express";
import * as yaml from "js-yaml";
import {
  Building,
  MapExportRequest,
  MapExportResponse,
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

function convertBuildingToYaml(building: Building): YamlBuilding {
  const yamlLevels: Record<string, YamlLevel> = {};

  for (const [levelName, level] of Object.entries(building.levels)) {
    // Convert vertices to YAML format: [x, y, z, name, {params}]
    const yamlVertices: YamlVertex[] = level.vertices.map((vertex) => [
      vertex.x,
      vertex.y,
      vertex.z,
      vertex.name || "",
      vertex.params || {},
    ]);

    // Convert walls to YAML format: [startIndex, endIndex, {params}]
    const yamlWalls = level.walls.map((wall) => [
      wall.startVertexIndex,
      wall.endVertexIndex,
      wall.params || {},
    ]);

    // Convert doors to YAML format: [startIndex, endIndex, doorName, {params}]
    const yamlDoors = level.doors.map((door) => [
      door.startVertexIndex,
      door.endVertexIndex,
      door.name,
      {
        type: door.type,
        ...(door.params || {}),
      },
    ]);

    // Convert lanes to YAML format: [startIndex, endIndex, {graph_idx, ...params}]
    const yamlLanes = level.lanes.map((lane) => [
      lane.startVertexIndex,
      lane.endVertexIndex,
      {
        graph_idx: lane.graphIndex,
        orientation: lane.orientation || "bidirectional",
        ...(lane.params || {}),
      },
    ]);

    // Convert floors to YAML format: [vertexIndices[], {params}]
    const yamlFloors = level.floors.map((floor) => [
      floor.vertexIndices,
      {
        texture: floor.texture || "default",
        scale: floor.scale || 1.0,
        ...(floor.params || {}),
      },
    ]);

    // Convert measurements to YAML format: [startIndex, endIndex, distance]
    const yamlMeasurements = level.measurements.map((measurement) => [
      measurement.startVertexIndex,
      measurement.endVertexIndex,
      measurement.distance,
    ]);

    yamlLevels[levelName] = {
      elevation: level.elevation,
      drawing: level.drawing,
      flattened_x_offset: level.flattened_x_offset || 0,
      flattened_y_offset: level.flattened_y_offset || 0,
      vertices: yamlVertices,
      walls: yamlWalls,
      doors: yamlDoors,
      lanes: yamlLanes,
      floors: yamlFloors,
      measurements: yamlMeasurements,
      models: level.models || [],
    };
  }

  return {
    name: building.name,
    levels: yamlLevels,
    lifts: building.lifts.map((lift) => ({
      name: lift.name,
      levels: lift.levels,
      position: lift.position || [0, 0],
      doors: lift.doors || [],
      params: lift.params || {},
    })),
  };
}

export const handleExportMap: RequestHandler = (req, res) => {
  try {
    const { building, format }: MapExportRequest = req.body;

    if (!building || !format) {
      const response: MapExportResponse = {
        success: false,
        error: "Missing building data or format",
      };
      return res.status(400).json(response);
    }

    if (format === "yaml") {
      const yamlBuilding = convertBuildingToYaml(building);
      const yamlString = yaml.dump(yamlBuilding, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false,
      });

      res.setHeader("Content-Type", "application/x-yaml");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="building.yaml"',
      );

      return res.send(yamlString);
    } else if (format === "json") {
      const jsonString = JSON.stringify(building, null, 2);

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="building.json"',
      );

      return res.send(jsonString);
    } else {
      const response: MapExportResponse = {
        success: false,
        error: "Unsupported format. Use 'yaml' or 'json'.",
      };
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error("Export error:", error);
    const response: MapExportResponse = {
      success: false,
      error: "Internal server error during export",
    };
    res.status(500).json(response);
  }
};
