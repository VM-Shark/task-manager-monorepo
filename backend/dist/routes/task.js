"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Create Task
router.post("/", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, status } = req.body;
        if (!title || !description) {
            res.status(400).json({ message: "Title and description are required" });
            return;
        }
        const task = yield prisma.task.create({
            data: { title, description, status, userId: req.user.userId },
        });
        res.status(201).json({ message: "Task created successfully", task });
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Server error", error });
    }
}));
// Get All Tasks
router.get("/", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield prisma.task.findMany({
            where: { userId: req.user.userId },
        });
        if (tasks.length === 0) {
            res.status(404).json({ message: "No tasks found" });
            return;
        }
        res.status(200).json(tasks);
    }
    catch (error) {
        console.error("Error finding tasks:", error);
        res.status(500).json({ message: "Server error", error });
    }
}));
// Get Task
router.get("/:id", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const task = yield prisma.task.findUnique({
            where: { id }, // Prisma expects only one unique field here
        });
        if (!task || task.userId !== req.user.userId) {
            res.status(404).json({ message: "Task id not found or unathorized" });
            return;
        }
        res.status(200).json(task);
    }
    catch (error) {
        console.error("Error finding task:", error);
        res.status(500).json({ message: "Server error", error });
    }
}));
// Update Task
router.put("/:id", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        if (!title && !description && !status) {
            res.status(400).json({
                message: "At least one field is required to update the task",
            });
            return;
        }
        const existingTask = yield prisma.task.findUnique({
            where: { id },
        });
        // Check if task exists and belongs to the user
        if (!existingTask || existingTask.userId !== req.user.userId) {
            res.status(404).json({ message: "Task id not found or unathorized" });
            return;
        }
        const updatedTask = yield prisma.task.update({
            where: { id },
            data: { title, description, status },
        });
        res
            .status(200)
            .json({ message: "Task updated successfully", updatedTask });
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error", error });
    }
}));
// Delete Task
router.delete("/:id", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const existingTask = yield prisma.task.findUnique({
            where: { id },
        });
        // Check if task exists and belongs to the user
        if (!existingTask || existingTask.userId !== req.user.userId) {
            res.status(404).json({ message: "Task not found or unathorized" });
            return;
        }
        yield prisma.task.delete({ where: { id } });
        res.status(200).json({ message: "Succesfully deleted task" });
    }
    catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Server error", error });
    }
}));
exports.default = router;
