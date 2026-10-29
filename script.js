
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".filter");

// Load saved tasks when the app starts
let tasks = [];

try {
  const savedTasks = JSON.parse(
    localStorage.getItem("todoTasks") || "[]"
  );

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(
      task =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
    );
  }
} catch {
  tasks = [];
}

let currentFilter = "all";

// Save tasks in the browser
function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Display tasks on the page
function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.completed) {
      item.classList.add("completed");
    }

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      "Complete task: " + task.text
    );

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    // Task text
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      "Delete task: " + task.text
    );

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  const completedCount = tasks.filter(
    task => task.completed
  ).length;

  const remainingCount = tasks.length - completedCount;

  taskCount.textContent =
    `${remainingCount} pending · ${completedCount} completed`;

  emptyMessage.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyMessage.textContent =
      "No tasks yet. Add your first task!";
  } else if (visibleTasks.length === 0) {
    emptyMessage.textContent =
      "No tasks in this category.";
  }
}

// Add a new task
taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (text === "") {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    text: text,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
});

// Change task filter
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(btn => {
      const isActive = btn === button;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

// Show saved tasks
filterButtons.forEach(button => {
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.filter === currentFilter)
  );
});

renderTasks();
