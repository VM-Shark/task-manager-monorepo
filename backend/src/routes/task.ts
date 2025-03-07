import express, { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware, { AuthRequest } from "../middleware/authMiddleware";

const router: Router = express.Router();
const prisma = new PrismaClient();

// Create Task
router.post(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, status } = req.body;

      if (!title || !description) {
        res.status(400).json({ message: "Title and description are required" });
        return;
      }

      const task = await prisma.task.create({
        data: { title, description, status, userId: req.user.userId },
      });

      res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Get All Tasks
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: req.user.userId },
      });
      if (tasks.length === 0) {
        res.status(404).json({ message: "No tasks found" });
        return;
      }
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error finding tasks:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Get Task
router.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const task = await prisma.task.findUnique({
        where: { id }, // Prisma expects only one unique field here
      });
      if (!task || task.userId !== req.user.userId) {
        res.status(404).json({ message: "Task id not found or unathorized" });
        return;
      }
      res.status(200).json(task);
    } catch (error) {
      console.error("Error finding task:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Update Task
router.put(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { title, description, status } = req.body;
      if (!title && !description && !status) {
        res.status(400).json({
          message: "At least one field is required to update the task",
        });
        return;
      }
      const existingTask = await prisma.task.findUnique({
        where: { id },
      });
      // Check if task exists and belongs to the user
      if (!existingTask || existingTask.userId !== req.user.userId) {
        res.status(404).json({ message: "Task id not found or unathorized" });
        return;
      }
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { title, description, status },
      });
      res
        .status(200)
        .json({ message: "Task updated successfully", updatedTask });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Delete Task
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const existingTask = await prisma.task.findUnique({
        where: { id },
      });
      // Check if task exists and belongs to the user
      if (!existingTask || existingTask.userId !== req.user.userId) {
        res.status(404).json({ message: "Task not found or unathorized" });
        return;
      }
      await prisma.task.delete({ where: { id } });
      res.status(200).json({ message: "Succesfully deleted task" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default router;
