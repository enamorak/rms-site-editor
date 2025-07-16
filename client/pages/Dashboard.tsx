import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Robot,
  Zap,
  AlertTriangle,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const fleetStats = [
    {
      name: "Delivery Fleet",
      total: 12,
      active: 8,
      charging: 2,
      offline: 2,
      efficiency: 94,
      color: "#06b6d4",
    },
    {
      name: "Cleaning Fleet",
      total: 6,
      active: 4,
      charging: 1,
      offline: 1,
      efficiency: 87,
      color: "#10b981",
    },
    {
      name: "Security Fleet",
      total: 4,
      active: 3,
      charging: 1,
      offline: 0,
      efficiency: 96,
      color: "#f59e0b",
    },
  ];

  const recentTasks = [
    {
      id: "task-001",
      type: "Delivery",
      robot: "DeliveryBot-A",
      status: "completed",
      duration: "12m 34s",
      timestamp: "5 minutes ago",
    },
    {
      id: "task-002",
      type: "Cleaning",
      robot: "CleanBot-B",
      status: "in_progress",
      duration: "8m 12s",
      timestamp: "2 minutes ago",
    },
    {
      id: "task-003",
      type: "Security Patrol",
      robot: "SecBot-C",
      status: "completed",
      duration: "25m 8s",
      timestamp: "15 minutes ago",
    },
    {
      id: "task-004",
      type: "Delivery",
      robot: "DeliveryBot-C",
      status: "failed",
      duration: "3m 45s",
      timestamp: "22 minutes ago",
    },
  ];

  const systemAlerts = [
    {
      level: "warning",
      message: "Low battery alert for DeliveryBot-D (18%)",
      timestamp: "3 minutes ago",
    },
    {
      level: "info",
      message: "Map updated with new layout in Zone A",
      timestamp: "1 hour ago",
    },
    {
      level: "error",
      message: "Connection lost with CleanBot-A",
      timestamp: "2 hours ago",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              RMF Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor your robot fleet operations and system status
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/">
                <MapPin className="w-4 h-4 mr-2" />
                Site Editor
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/robots">
                <Robot className="w-4 h-4 mr-2" />
                Fleet Manager
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Robot className="w-5 h-5 text-primary" />
                Total Robots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {fleetStats.reduce((acc, fleet) => acc + fleet.total, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Across {fleetStats.length} fleets
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Active Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {fleetStats.reduce((acc, fleet) => acc + fleet.active, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Currently operational
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Charging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {fleetStats.reduce((acc, fleet) => acc + fleet.charging, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                At charging stations
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Avg Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {Math.round(
                  fleetStats.reduce((acc, fleet) => acc + fleet.efficiency, 0) /
                    fleetStats.length,
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">
                Fleet performance
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Fleet Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Robot className="w-5 h-5" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fleetStats.map((fleet) => (
                <div key={fleet.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: fleet.color }}
                      ></div>
                      <span className="font-semibold">{fleet.name}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-500">
                        {fleet.active} active
                      </span>
                      <span className="text-yellow-500">
                        {fleet.charging} charging
                      </span>
                      {fleet.offline > 0 && (
                        <span className="text-red-500">
                          {fleet.offline} offline
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Efficiency</span>
                      <span>{fleet.efficiency}%</span>
                    </div>
                    <Progress value={fleet.efficiency} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <div className="font-semibold text-sm">{task.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.robot}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">{task.duration}</div>
                      <div className="text-xs text-muted-foreground">
                        {task.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {getAlertIcon(alert.level)}
                  <div className="flex-1">
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.timestamp}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Dismiss
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="h-20">
            <Link to="/" className="flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6" />
              <span>Create New Map</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20">
            <Link to="/robots" className="flex flex-col items-center gap-2">
              <PlusCircle className="w-6 h-6" />
              <span>Add Robot</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center gap-2"
          >
            <BarChart3 className="w-6 h-6" />
            <span>View Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
