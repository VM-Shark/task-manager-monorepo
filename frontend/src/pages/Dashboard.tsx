import { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { createTask, getTasks, updateTask, deleteTask } from "../api/tasks";

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { tasks, setTasks, token, user } = auth!;

  // Check for user and token, and redirect to login if not authenticated
  useEffect(() => {
    if (!token || !user) {
      console.log("❌ No token or user found, skipping task fetch.");
      navigate("/login");
      return;
    }
    // Now, we don’t need to fetch tasks manually here because it's handled by the AuthContext
  }, [token, user, navigate]);

  const handleCreateTask = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    const title = prompt("Enter task title:");
    const description = prompt("Enter task description:");
    if (title && description) {
      await createTask(title, description, token!);
      const updatedTasks = await getTasks(token!); // Manually re-fetch tasks
      setTasks(updatedTasks); // Update the tasks in AuthContext
    }
  };

  const handleUpdateTask = async (id: string) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const status = prompt("Update status (To-Do, In Progress, Completed):");
    if (status) {
      await updateTask(id, status, token!);
      const updatedTasks = await getTasks(token!); // Manually re-fetch tasks
      setTasks(updatedTasks); // Update the tasks in AuthContext
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await deleteTask(id, token!);
      const updatedTasks = await getTasks(token!); // Manually re-fetch tasks
      setTasks(updatedTasks); // Update the tasks in AuthContext
    } catch (error) {
      console.error("❌ Error deleting task:", error);
    }
  };

  return (
    <div>
      <h1>Welcome to your Dashboard, {auth?.user?.name}!</h1>
      <button onClick={handleCreateTask}>+ Add Task</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.status}
            <button onClick={() => handleUpdateTask(task.id)}>Update</button>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
