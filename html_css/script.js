const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const searchInput = document.getElementById("searchInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-section button");
const toggleMode = document.getElementById("toggleMode");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// بررسی urgent
function isUrgent(date) {
    if (!date) return false;
    const today = new Date();
    const taskDate = new Date(date);
    const diff = (taskDate - today) / (1000 * 60 * 60 * 24);
    return diff <= 2 && diff >= 0;
}

// رندر
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks
        .filter(task => {
            if (currentFilter === "completed") return task.completed;
            if (currentFilter === "pending") return !task.completed;
            return true;
        })
        .filter(task =>
            task.text.toLowerCase().includes(searchInput.value.toLowerCase())
        );

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.draggable = true;

        if (task.completed) li.classList.add("completed");
        if (isUrgent(task.date)) li.classList.add("urgent");

        li.innerHTML = `
            <div>
                <span ondblclick="editTask(${index})">${task.text}</span>
                ${task.date ? `<small>Due: ${task.date}</small>` : ""}
            </div>
            <div>
                <button onclick="toggleTask(${index})">✔</button>
                <button onclick="editTask(${index})">✏️</button>
                <button class="delete-btn" onclick="deleteTask(${index})">✖</button>
            </div>
        `;

        // Drag Events
        li.addEventListener("dragstart", () => {
            li.classList.add("dragging");
        });

        li.addEventListener("dragend", () => {
            li.classList.remove("dragging");
            saveTasks();
        });

        taskList.appendChild(li);
    });
}

// Drag logic
taskList.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(taskList, e.clientY);

    if (afterElement == null) {
        taskList.appendChild(dragging);
    } else {
        taskList.insertBefore(dragging, afterElement);
    }
});

// کمک برای drag
function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll("li:not(.dragging)")];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// اضافه کردن
addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    const date = dateInput.value;

    if (!text) return;

    tasks.push({ text, date, completed: false });

    taskInput.value = "";
    dateInput.value = "";

    saveTasks();
    renderTasks();
});

// حذف
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// تکمیل
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// ویرایش
function editTask(index) {
    const newText = prompt("Edit your task:", tasks[index].text);
    if (newText !== null && newText.trim() !== "") {
        tasks[index].text = newText;
        saveTasks();
        renderTasks();
    }
}

// فیلتر
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// سرچ
searchInput.addEventListener("input", renderTasks);

// ذخیره
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// دارک مود
toggleMode.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// اجرا
renderTasks();