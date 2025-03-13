import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

export const getTasks = async (token: string | null) => {
  if (!token || token === "null" || token.trim() === "") {
    console.warn("❌ Invalid token, skipping API request.");
    return [];
  }

  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 404) {
      console.warn("⚠️ No tasks found.");
      return []; // Return empty tasks array if no tasks exist
    }
    return response.data;
  } catch (error: unknown) {
    // `unknown` type in the catch block
    // Check if the error is an AxiosError
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, you can safely access properties like response
      console.error(
        "🚨 Error fetching tasks:",
        error.response?.data || error.message
      );
    } else {
      // Handle other types of errors
      console.error("🚨 Unexpected error:", error);
    }
    return [];
  }
};

export const createTask = async (
  title: string,
  description: string,
  token: string
) => {
  const response = await axios.post(
    API_URL,
    { title, description, status: "To-Do" },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateTask = async (id: string, status: string, token: string) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const deleteTask = async (id: string, token: string) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
