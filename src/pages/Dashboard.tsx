
import { useState, useEffect } from "react";
import { CheckCircle, Edit, Loader2, Plus, Save, Trash2, XCircle } from "lucide-react";
import { BarChart as LucideBarChart } from "lucide-react"; // Rename to avoid conflict
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { fetchSheetData, updateSheetData } from "@/utils/googleSheetsUtils";
import { googleSheetsConfig } from "@/configs/appConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart, // Import from recharts
  Bar // Import Bar from recharts
} from "recharts";

interface Task {
  id: string;
  name: string;
  status: string;
  progress: number;
  assignee: string;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tempTask, setTempTask] = useState<Task | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData({
          apiKey: googleSheetsConfig.apiKey,
          spreadsheetId: googleSheetsConfig.sheets.dashboard.spreadsheetId,
          range: googleSheetsConfig.sheets.dashboard.range
        });
        setTasks(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const calculateStats = () => {
    if (tasks.length === 0) return { completed: 0, inProgress: 0, notStarted: 0, overall: 0 };
    
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress' || t.status === 'In Review').length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;
    
    const taskProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;
    
    return {
      completed,
      inProgress,
      notStarted,
      overall: Math.round(taskProgress)
    };
  };
  
  const stats = calculateStats();
  
  const chartData = [
    { name: 'Completed', value: stats.completed, fill: '#22c55e' },
    { name: 'In Progress', value: stats.inProgress, fill: '#3b82f6' },
    { name: 'Not Started', value: stats.notStarted, fill: '#ef4444' },
  ];
  
  const progressChartData = [
    { name: 'Tasks', completed: stats.completed, inProgress: stats.inProgress, notStarted: stats.notStarted }
  ];
  
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTempTask({...task});
  };
  
  const handleSave = async () => {
    if (!tempTask) return;
    
    try {
      setLoading(true);
      
      const success = await updateSheetData(
        {
          apiKey: googleSheetsConfig.apiKey,
          spreadsheetId: googleSheetsConfig.sheets.dashboard.spreadsheetId,
          range: googleSheetsConfig.sheets.dashboard.range
        },
        tempTask
      );
      
      if (success) {
        setTasks(tasks.map(task => task.id === tempTask.id ? tempTask : task));
        toast({
          title: "Task updated",
          description: `${tempTask.name} has been updated.`,
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error updating task",
        description: "Failed to update the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setEditingTask(null);
      setTempTask(null);
    }
  };
  
  const handleCancel = () => {
    setEditingTask(null);
    setTempTask(null);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      setLoading(true);
      
      const success = await updateSheetData(
        {
          apiKey: googleSheetsConfig.apiKey,
          spreadsheetId: googleSheetsConfig.sheets.dashboard.spreadsheetId,
          range: googleSheetsConfig.sheets.dashboard.range
        },
        { id, deleted: true }
      );
      
      if (success) {
        setTasks(tasks.filter(task => task.id !== id));
        toast({
          title: "Task deleted",
          description: "The task has been deleted.",
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error deleting task",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewTask = () => {
    const newId = String(Math.max(...tasks.map(t => Number(t.id)), 0) + 1);
    const newTask: Task = {
      id: newId,
      name: "New Task",
      status: "Not Started",
      progress: 0,
      assignee: "",
    };
    
    setEditingTask(newTask);
    setTempTask(newTask);
  };
  
  const handleAddTask = async () => {
    if (!tempTask) return;
    
    try {
      setLoading(true);
      
      const success = await updateSheetData(
        {
          apiKey: googleSheetsConfig.apiKey,
          spreadsheetId: googleSheetsConfig.sheets.dashboard.spreadsheetId,
          range: googleSheetsConfig.sheets.dashboard.range
        },
        tempTask
      );
      
      if (success) {
        setTasks([...tasks, tempTask]);
        toast({
          title: "Task added",
          description: `${tempTask.name} has been added.`,
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error adding task",
        description: "Failed to add the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setEditingTask(null);
      setTempTask(null);
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of CBE#4-Process Validation project progress
            </p>
          </div>
          <Button onClick={handleNewTask} disabled={loading || !!editingTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Progress
              </CardTitle>
              <LucideBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall}%</div>
              <Progress value={stats.overall} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Tasks
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                of {tasks.length} tasks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <div className="h-4 w-4 rounded-full bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                of {tasks.length} tasks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Not Started
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notStarted}</div>
              <p className="text-xs text-muted-foreground">
                of {tasks.length} tasks
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>
                Task completion status visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {!loading && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={progressChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#22c55e" fill="#22c55e" />
                    <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="notStarted" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {loading && (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Status</CardTitle>
              <CardDescription>
                Distribution of tasks by status
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {!loading && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {loading && (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Process Validation Tasks</CardTitle>
            <CardDescription>
              Manage and update task progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !editingTask ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {editingTask?.id === task.id ? (
                          <Input
                            value={tempTask?.name || ""}
                            onChange={(e) => setTempTask({...tempTask!, name: e.target.value})}
                          />
                        ) : (
                          task.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTask?.id === task.id ? (
                          <Select
                            value={tempTask?.status}
                            onValueChange={(value) => setTempTask({...tempTask!, status: value})}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="In Review">In Review</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                task.status === 'Completed' ? 'bg-green-500' :
                                task.status === 'In Progress' ? 'bg-blue-500' :
                                task.status === 'In Review' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            />
                            {task.status}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTask?.id === task.id ? (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={tempTask?.progress || 0}
                            onChange={(e) => setTempTask({...tempTask!, progress: Number(e.target.value)})}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="w-20 h-2" />
                            <span className="text-sm">{task.progress}%</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTask?.id === task.id ? (
                          <Input
                            value={tempTask?.assignee || ""}
                            onChange={(e) => setTempTask({...tempTask!, assignee: e.target.value})}
                          />
                        ) : (
                          task.assignee
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingTask?.id === task.id ? (
                          <div className="flex justify-end gap-2">
                            {tempTask?.id === editingTask?.id && !tasks.some(t => t.id === tempTask.id) ? (
                              <Button size="sm" onClick={handleAddTask} disabled={loading}>
                                <Save className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            ) : (
                              <Button size="sm" onClick={handleSave} disabled={loading}>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={handleCancel} disabled={loading}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(task)} disabled={!!editingTask}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(task.id)} disabled={!!editingTask}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && !editingTask && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No tasks found. Add a new task to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;
