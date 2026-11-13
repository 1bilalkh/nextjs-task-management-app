

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";





// GET: Fetch all tasks
export async function GET() {
  try {
    await connectDB();

    const tasks = await Task.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("GET Tasks Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST: Create a new task
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Task title is required" },
        { status: 400 }
      );
    }

    const newTask = await Task.create({
      title,
      completed: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Task Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create task" },
      { status: 500 }
    );
  }
}
