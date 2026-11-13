
"use client";

import { useEffect, useState } from "react";

type TaskItem = {
  _id: string;
  title: string;
  completed: boolean;
};

export default function Task() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // GET: Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tasks");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(data.tasks);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks when component loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // POST: Create task / PUT: Update task
  const handleAddTask = async () => {
    if (task.trim() === "" || saving) return;

    try {
      setSaving(true);
      setError("");

      const isEditing = editIndex !== null;

      const url = isEditing
        ? `/api/tasks/${tasks[editIndex]._id}`
        : "/api/tasks";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save task");
      }

      if (isEditing) {
        // Update task in React state
        setTasks((previousTasks) =>
          previousTasks.map((item) =>
            item._id === data.task._id ? data.task : item
          )
        );
      } else {
        // Add new task to React state
        setTasks((previousTasks) => [
          data.task,
          ...previousTasks,
        ]);
      }

      setTask("");
      setEditIndex(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit: Load task into input
  const handleEditTask = (index: number) => {
    setTask(tasks[index].title);
    setEditIndex(index);
    setError("");
  };

  // DELETE: Delete task from MongoDB
  const handleDeleteTask = async (index: number) => {
    if (saving) return;

    const selectedTask = tasks[index];

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/tasks/${selectedTask._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (item) => item._id !== selectedTask._id
        )
      );

      if (editIndex === index) {
        setEditIndex(null);
        setTask("");
      } else if (editIndex !== null && editIndex > index) {
        setEditIndex(editIndex - 1);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // PATCH: Complete / Incomplete task
  const handleCompleteTask = async (index: number) => {
    if (saving) return;

    const selectedTask = tasks[index];

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/tasks/${selectedTask._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !selectedTask.completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update task status"
        );
      }

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === data.task._id ? data.task : item
        )
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="task-container">
      <h1>My Task List</h1>

      <div className="task-input">
        <input
          type="text"
          placeholder="Enter your task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={saving}
        />

        <button onClick={handleAddTask} disabled={saving}>
          {saving
            ? "Saving..."
            : editIndex !== null
              ? "Update Task"
              : "Add Task"}
        </button>
      </div>

      {editIndex !== null && (
        <button
        className="cancel-edit-btn edit-btn"
          onClick={() => {
            setEditIndex(null);
            setTask("");
            setError("");
          }}
          disabled={saving}
        >
          Cancel Edit
        </button>
      )}

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="task-list">
          {tasks.map((item, index) => (
            <li
              key={item._id}
              className={item.completed ? "completed" : ""}
            >
              <div className="task-content">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleCompleteTask(index)}
                  disabled={saving}
                />

                <span>{item.title}</span>
              </div>

              <div className="task-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditTask(index)}
                  disabled={item.completed || saving}
                >
                  Edit
                </button>

                <button
                  className="delete-btn edit-btn"
                  onClick={() => handleDeleteTask(index)}
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p>Total Tasks: {tasks.length}</p>

      <p>
        Completed: {tasks.filter((item) => item.completed).length}
      </p>

      <p>
        Pending: {tasks.filter((item) => !item.completed).length}
      </p>
    </main>
  );
}
