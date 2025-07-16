import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Robot, Settings, MapPin, Battery, Clock } from "lucide-react";

export default function Robots() {
  const mockRobots = [
    {
      id: "robot-001",
      name: "Delivery Bot A",
      fleet: "Delivery Fleet",
      status: "idle",
      battery: 85,
      position: [12.5, 0, 8.3],
      lastSeen: "2 minutes ago",
    },
    {
      id: "robot-002",
      name: "Cleaning Bot B",
      fleet: "Cleaning Fleet",
      status: "moving",
      battery: 62,
      position: [5.2, 0, 15.7],
      lastSeen: "30 seconds ago",
    },
    {
      id: "robot-003",
      name: "Security Bot C",
      fleet: "Security Fleet",
      status: "charging",
      battery: 23,
      position: [0, 0, 0],
      lastSeen: "1 hour ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "bg-blue-500";
      case "moving":
        return "bg-green-500";
      case "charging":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Robot className="w-8 h-8 text-primary" />
              Robot Fleet Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and control your robot fleet in real-time
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Fleet Settings
            </Button>
            <Button>Add Robot</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Fleet Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Robots
                  </span>
                  <span className="font-semibold">{mockRobots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-semibold text-green-500">
                    {mockRobots.filter((r) => r.status !== "offline").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg Battery
                  </span>
                  <span className="font-semibold">
                    {Math.round(
                      mockRobots.reduce((acc, r) => acc + r.battery, 0) /
                        mockRobots.length,
                    )}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">RMF Core Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Map Server Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">1 Fleet Adapter Warning</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Robot-002 completed delivery task</div>
                <div>• Robot-003 started charging cycle</div>
                <div>• Map updated with new layout</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Robot Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockRobots.map((robot) => (
                <div
                  key={robot.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Robot className="w-8 h-8 text-muted-foreground" />
                      <div
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(robot.status)}`}
                      ></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{robot.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {robot.fleet}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <Badge
                        variant={
                          robot.status === "idle" ? "secondary" : "default"
                        }
                        className="mb-1"
                      >
                        {robot.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {robot.lastSeen}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Battery className="w-4 h-4" />
                        {robot.battery}%
                      </div>
                      <div className="w-16 h-2 bg-muted rounded-full mt-1">
                        <div
                          className={`h-full rounded-full ${
                            robot.battery > 50
                              ? "bg-green-500"
                              : robot.battery > 20
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${robot.battery}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" />
                        Position
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({robot.position[0].toFixed(1)},{" "}
                        {robot.position[2].toFixed(1)})
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Control
                      </Button>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
