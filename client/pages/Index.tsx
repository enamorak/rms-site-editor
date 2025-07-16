import React, { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Grid, Text, Html } from "@react-three/drei";
import { Vector3, BufferGeometry, Line, LineBasicMaterial } from "three";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Upload,
  Play,
  Square,
  Trash2,
  Settings,
  Robot,
  Route,
  Zap,
  ParkingCircle,
} from "lucide-react";
import { Building, Vertex, Wall, Lane, Door } from "@shared/rmf-types";

interface RoadPoint {
  id: string;
  position: [number, number, number];
  type: "waypoint" | "charging" | "parking";
}

interface RoadSegment {
  id: string;
  start: string;
  end: string;
  type: "lane" | "wall" | "door";
  graphIndex?: number;
}

function RoadPoint3D({
  point,
  isSelected,
  onClick,
}: {
  point: RoadPoint;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<any>();

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const color =
    point.type === "charging"
      ? "#10b981"
      : point.type === "parking"
        ? "#3b82f6"
        : "#06b6d4";

  return (
    <mesh ref={meshRef} position={point.position} onClick={onClick}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
      />
      {isSelected && (
        <Html>
          <div className="bg-card border rounded px-2 py-1 text-xs whitespace-nowrap">
            {point.type === "charging" && (
              <Zap className="inline w-3 h-3 mr-1" />
            )}
            {point.type === "parking" && (
              <ParkingCircle className="inline w-3 h-3 mr-1" />
            )}
            {point.type === "waypoint" && (
              <Route className="inline w-3 h-3 mr-1" />
            )}
            Point {point.id}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function RoadSegment3D({
  segment,
  points,
}: {
  segment: RoadSegment;
  points: RoadPoint[];
}) {
  const startPoint = points.find((p) => p.id === segment.start);
  const endPoint = points.find((p) => p.id === segment.end);

  if (!startPoint || !endPoint) return null;

  const color =
    segment.type === "wall"
      ? "#ef4444"
      : segment.type === "door"
        ? "#f59e0b"
        : "#06b6d4";

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={
            new Float32Array([...startPoint.position, ...endPoint.position])
          }
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        linewidth={segment.type === "wall" ? 3 : 2}
      />
    </line>
  );
}

function Scene({
  points,
  segments,
  selectedPoint,
  onPointClick,
  onSceneClick,
}: {
  points: RoadPoint[];
  segments: RoadSegment[];
  selectedPoint: string | null;
  onPointClick: (pointId: string) => void;
  onSceneClick: (position: [number, number, number]) => void;
}) {
  const handleSceneClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (event.intersections.length === 0) return;

      const intersection = event.intersections[0];
      if (intersection.object.type === "GridHelper") {
        const position = intersection.point;
        onSceneClick([
          Math.round(position.x * 4) / 4,
          0,
          Math.round(position.z * 4) / 4,
        ]);
      }
    },
    [onSceneClick],
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />

      <Grid
        args={[50, 50]}
        position={[0, -0.01, 0]}
        cellColor="#333"
        sectionColor="#555"
        onClick={handleSceneClick}
      />

      {points.map((point) => (
        <RoadPoint3D
          key={point.id}
          point={point}
          isSelected={selectedPoint === point.id}
          onClick={() => onPointClick(point.id)}
        />
      ))}

      {segments.map((segment) => (
        <RoadSegment3D key={segment.id} segment={segment} points={points} />
      ))}

      <Text
        position={[0, 5, 0]}
        fontSize={1}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
      >
        RMF Site Editor
      </Text>
    </>
  );
}

export default function Index() {
  const [points, setPoints] = useState<RoadPoint[]>([]);
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<
    "waypoint" | "charging" | "parking" | "lane" | "wall" | "door"
  >("waypoint");
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPoint = useCallback(
    (position: [number, number, number]) => {
      if (["waypoint", "charging", "parking"].includes(selectedTool)) {
        const newPoint: RoadPoint = {
          id: `point-${Date.now()}`,
          position,
          type: selectedTool as "waypoint" | "charging" | "parking",
        };
        setPoints((prev) => [...prev, newPoint]);
      }
    },
    [selectedTool],
  );

  const connectPoints = useCallback(
    (pointId: string) => {
      if (["lane", "wall", "door"].includes(selectedTool)) {
        if (!connectingFrom) {
          setConnectingFrom(pointId);
        } else if (connectingFrom !== pointId) {
          const newSegment: RoadSegment = {
            id: `segment-${Date.now()}`,
            start: connectingFrom,
            end: pointId,
            type: selectedTool as "lane" | "wall" | "door",
            graphIndex: selectedTool === "lane" ? 0 : undefined,
          };
          setSegments((prev) => [...prev, newSegment]);
          setConnectingFrom(null);
        }
      } else {
        setSelectedPoint(pointId);
      }
    },
    [selectedTool, connectingFrom],
  );

  const deleteSelected = useCallback(() => {
    if (selectedPoint) {
      setPoints((prev) => prev.filter((p) => p.id !== selectedPoint));
      setSegments((prev) =>
        prev.filter(
          (s) => s.start !== selectedPoint && s.end !== selectedPoint,
        ),
      );
      setSelectedPoint(null);
    }
  }, [selectedPoint]);

  const clearAll = useCallback(() => {
    setPoints([]);
    setSegments([]);
    setSelectedPoint(null);
    setConnectingFrom(null);
  }, []);

  const importMap = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".yaml,.yml,.json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      setError(null);

      try {
        const text = await file.text();
        const format = file.name.endsWith(".json") ? "json" : "yaml";

        const response = await fetch("/api/import-map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: text, format }),
        });

        const result = await response.json();

        if (result.success && result.building) {
          // Convert building back to our internal format
          const building = result.building;
          const level = building.levels.L1 || Object.values(building.levels)[0];

          if (level) {
            // Clear existing data
            setPoints([]);
            setSegments([]);
            setSelectedPoint(null);
            setConnectingFrom(null);

            // Convert vertices to points
            const newPoints: RoadPoint[] = level.vertices.map(
              (vertex, index) => ({
                id: vertex.name || `imported-point-${index}`,
                position: [vertex.x, vertex.y, vertex.z] as [
                  number,
                  number,
                  number,
                ],
                type: vertex.params?.is_charger
                  ? "charging"
                  : vertex.params?.is_parking_spot
                    ? "parking"
                    : "waypoint",
              }),
            );

            // Convert walls, doors, and lanes to segments
            const newSegments: RoadSegment[] = [];

            level.walls.forEach((wall, index) => {
              const startPoint = newPoints[wall.startVertexIndex];
              const endPoint = newPoints[wall.endVertexIndex];
              if (startPoint && endPoint) {
                newSegments.push({
                  id: `imported-wall-${index}`,
                  start: startPoint.id,
                  end: endPoint.id,
                  type: "wall",
                });
              }
            });

            level.doors.forEach((door, index) => {
              const startPoint = newPoints[door.startVertexIndex];
              const endPoint = newPoints[door.endVertexIndex];
              if (startPoint && endPoint) {
                newSegments.push({
                  id: `imported-door-${index}`,
                  start: startPoint.id,
                  end: endPoint.id,
                  type: "door",
                });
              }
            });

            level.lanes.forEach((lane, index) => {
              const startPoint = newPoints[lane.startVertexIndex];
              const endPoint = newPoints[lane.endVertexIndex];
              if (startPoint && endPoint) {
                newSegments.push({
                  id: `imported-lane-${index}`,
                  start: startPoint.id,
                  end: endPoint.id,
                  type: "lane",
                  graphIndex: lane.graphIndex,
                });
              }
            });

            setPoints(newPoints);
            setSegments(newSegments);
          }
        } else {
          setError(result.error || "Failed to import map");
        }
      } catch (error) {
        console.error("Import failed:", error);
        setError("Failed to import map file");
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  }, []);

  const exportMap = useCallback(async () => {
    setIsExporting(true);
    try {
      // Convert current scene to Building format
      const vertices: Vertex[] = points.map((point, index) => ({
        x: point.position[0],
        y: point.position[1],
        z: point.position[2],
        name: point.id,
        params:
          point.type === "charging"
            ? { is_charger: true }
            : point.type === "parking"
              ? { is_parking_spot: true }
              : {},
      }));

      const building: Building = {
        name: "RMF Site Map",
        levels: {
          L1: {
            elevation: 0,
            vertices,
            walls: segments
              .filter((s) => s.type === "wall")
              .map((s) => ({
                startVertexIndex: points.findIndex((p) => p.id === s.start),
                endVertexIndex: points.findIndex((p) => p.id === s.end),
              })),
            doors: segments
              .filter((s) => s.type === "door")
              .map((s) => ({
                startVertexIndex: points.findIndex((p) => p.id === s.start),
                endVertexIndex: points.findIndex((p) => p.id === s.end),
                type: "hinged" as const,
                name: s.id,
              })),
            lanes: segments
              .filter((s) => s.type === "lane")
              .map((s) => ({
                startVertexIndex: points.findIndex((p) => p.id === s.start),
                endVertexIndex: points.findIndex((p) => p.id === s.end),
                graphIndex: s.graphIndex || 0,
              })),
            floors: [],
            measurements: [],
          },
        },
        lifts: [],
      };

      const response = await fetch("/api/export-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ building, format: "yaml" }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "building.yaml";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [points, segments]);

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex bg-background">
      {/* Toolbar */}
      <div className="w-80 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Robot className="w-6 h-6 text-primary" />
            RMF Site Editor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            3D Robot Road Planning
          </p>
        </div>

        <div className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={selectedTool === "waypoint" ? "default" : "outline"}
                  onClick={() => setSelectedTool("waypoint")}
                  className="flex flex-col h-12 text-xs"
                >
                  <Route className="w-4 h-4" />
                  Point
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "charging" ? "default" : "outline"}
                  onClick={() => setSelectedTool("charging")}
                  className="flex flex-col h-12 text-xs"
                >
                  <Zap className="w-4 h-4" />
                  Charge
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "parking" ? "default" : "outline"}
                  onClick={() => setSelectedTool("parking")}
                  className="flex flex-col h-12 text-xs"
                >
                  <ParkingCircle className="w-4 h-4" />
                  Park
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={selectedTool === "lane" ? "default" : "outline"}
                  onClick={() => setSelectedTool("lane")}
                  className="flex flex-col h-12 text-xs"
                >
                  <Route className="w-4 h-4" />
                  Lane
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "wall" ? "default" : "outline"}
                  onClick={() => setSelectedTool("wall")}
                  className="flex flex-col h-12 text-xs"
                >
                  <Square className="w-4 h-4" />
                  Wall
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "door" ? "default" : "outline"}
                  onClick={() => setSelectedTool("door")}
                  className="flex flex-col h-12 text-xs"
                >
                  <Settings className="w-4 h-4" />
                  Door
                </Button>
              </div>
            </CardContent>
          </Card>

          {connectingFrom && (
            <Card className="border-primary">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Click another point to create {selectedTool}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConnectingFrom(null)}
                  className="mt-2 w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Scene</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary">{points.length} points</Badge>
                <Badge variant="secondary">{segments.length} connections</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteSelected}
                  disabled={!selectedPoint}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAll}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Export/Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                size="sm"
                onClick={exportMap}
                disabled={isExporting || points.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export YAML"}
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Import Map
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
          <Scene
            points={points}
            segments={segments}
            selectedPoint={selectedPoint}
            onPointClick={connectPoints}
            onSceneClick={addPoint}
          />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>

        {/* Instructions overlay */}
        <div className="absolute top-4 right-4 bg-card border rounded-lg p-4 max-w-xs">
          <h3 className="font-semibold text-sm mb-2">How to Use</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Select a tool from the left panel</li>
            <li>• Click on the grid to place points</li>
            <li>• Click two points to connect them</li>
            <li>• Export to .building.yaml for RMF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
