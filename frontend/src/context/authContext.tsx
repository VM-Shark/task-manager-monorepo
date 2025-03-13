import { createContext, useState, useEffect, ReactNode } from "react";
import { getTasks } from "../api/tasks";

interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!token || !user) {
      return; // If no token or user, do nothing
    }
    console.log("✅ User logged in. Fetching tasks...");
    getTasks(token)
      .then((fetchedTasks) => setTasks(fetchedTasks))
      .catch((error) => {
        console.error("⚠️ Error fetching tasks:", error);
        setTasks([]);
      });
  }, [token, user]); // Run this effect only when token and user change

  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTasks([]);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, tasks, setTasks, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
