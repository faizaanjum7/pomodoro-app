import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";

function Agenda() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("agendaTasks");
      if (!saved) return [];

      const parsed = JSON.parse(saved);

      const validTasks = Array.isArray(parsed)
        ? parsed.filter(
            (task) =>
              task &&
              typeof task === "object" &&
              task.text &&
              task.text.trim() !== ""
          )
        : [];

      return validTasks;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [category, setCategory] = useState("General");

  useEffect(() => {
    localStorage.setItem("agendaTasks", JSON.stringify(tasks));
  }, [tasks]);

  // ✅ Add task
  const addTask = () => {
    if (!input.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      text: input.trim(),
      category: category,
    };

    setTasks((prev) => [...prev, newTask]);
    setInput("");
  };

  // ✅ Delete task
  const deleteTask = (taskId) => {
    const element = document.getElementById(taskId);

    if (element) {
      element.classList.add("removing");
      setTimeout(() => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }, 200);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // ✅ Clear all
  const clearAllTasks = () => {
    setTasks([]);
  };

  // ✅ Drag handler (within same category)
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const sourceCat = result.source.droppableId;
    const destCat = result.destination.droppableId;

    // Only reorder inside same category (safe version)
    if (sourceCat === destCat) {
      const categoryTasks = tasks.filter((t) => t.category === sourceCat);
      const otherTasks = tasks.filter((t) => t.category !== sourceCat);

      const reordered = Array.from(categoryTasks);
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, moved);

      setTasks([...otherTasks, ...reordered]);
    }
  };

  // ✅ Group tasks by category
  const groupedTasks = tasks.reduce((acc, task) => {
    const cat = task.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  return (
    <div className="agenda-container">
      <h1>Today's Agenda</h1>

      {/* Input section */}
      <div className="agenda-box">
        <input
          type="text"
          placeholder="Enter your task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />

        <div className="category-options">
              <select
                className="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Study">Study</option>
              </select>
            </div>

        <button onClick={addTask}>Add</button>
      </div>

      {tasks.length > 0 && (
        <button onClick={clearAllTasks} className="clear-all-btn">
          Clear All
        </button>
      )}

      {/* Category-wise lists */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        {Object.entries(groupedTasks).map(([categoryName, categoryTasks]) => (
          <div key={categoryName} className="category-section">
            <h2>{categoryName}</h2>

            <Droppable droppableId={categoryName}>
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {categoryTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          id={task.id}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? "dragging" : ""}
                        >
                          <span>{task.text}</span>
                          <button onClick={() => deleteTask(task.id)}>
                            ×
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}

export default Agenda;