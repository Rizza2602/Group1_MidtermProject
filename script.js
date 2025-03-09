// Selecting elements from the DOM  
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const sortAsc = document.getElementById('sortAsc');
const sortDesc = document.getElementById('sortDesc');

// Load tasks from local storage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let selectedTasks = new Set();
let draggedIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    applyDarkMode();
});

addTaskBtn?.addEventListener('click', addTask);
taskInput?.addEventListener('keypress', (event) => event.key === 'Enter' && addTask());
deleteAllBtn?.addEventListener('click', deleteSelectedTasks);
toggleDarkMode?.addEventListener('click', toggleTheme);
sortAsc?.addEventListener('click', () => sortTasks(true));
sortDesc?.addEventListener('click', () => sortTasks(false));

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

function addTask() {
    if (!taskInput) return;
    
    const taskText = taskInput.value.trim();
    if (!taskText || tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        alert("Invalid or duplicate task!");
        return;
    }
    
    tasks.push({ text: taskText, completed: false });
    updateLocalStorage();
    renderTasks();
    
    taskInput.value = '';  
    taskInput.focus();     
}

function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = ''; 
    
    tasks.forEach((task, index) => {
        const li = createTaskElement(task, index);
        taskList.appendChild(li);
    });
}

function createTaskElement(task, index) {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.index = index;
    li.classList.add('task-item');
    
    const taskContainer = document.createElement('div');
    taskContainer.classList.add('task-container');
    
    const selectCheckbox = document.createElement('input');
    selectCheckbox.type = 'checkbox';
    selectCheckbox.classList.add('task-checkbox');
    selectCheckbox.checked = selectedTasks.has(index);
    selectCheckbox.addEventListener('change', () => {
        selectCheckbox.checked ? selectedTasks.add(index) : selectedTasks.delete(index);
    });
    
    const taskText = document.createElement('span');
    taskText.textContent = task.text;
    taskText.classList.add('task-text');
    taskText.classList.toggle('completed', task.completed);
    taskText.addEventListener('dblclick', () => editTask(index));
    
    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');
    
    const doneBtn = document.createElement('button');
    doneBtn.textContent = task.completed ? 'Undo' : 'Done';
    doneBtn.classList.add('done-btn');
    doneBtn.addEventListener('click', () => toggleTaskCompletion(index));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '&#10006;';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => confirmDelete(index));
    
    taskActions.append(doneBtn, deleteBtn);
    taskContainer.append(selectCheckbox, taskText, taskActions);
    li.appendChild(taskContainer);
    
    li.addEventListener('dragstart', (e) => {
        draggedIndex = index;
        e.dataTransfer.setData('text/plain', index);
    });
    
    li.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    li.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        swapTasks(fromIndex, index);
    });
    
    return li;
}

function editTask(index) {
    const newText = prompt("Edit your task:", tasks[index].text);
    if (newText && newText.trim() !== "" && !tasks.some((task, i) => i !== index && task.text.toLowerCase() === newText.toLowerCase())) {
        tasks[index].text = newText.trim();
        updateLocalStorage();
        renderTasks();
    } else {
        alert("Invalid or duplicate task!");
    }
}

function swapTasks(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const taskToMove = tasks.splice(fromIndex, 1)[0];
    tasks.splice(toIndex, 0, taskToMove);
    updateLocalStorage();
    renderTasks();
}

function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    updateLocalStorage();
    renderTasks();
}

function confirmDelete(index) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks.splice(index, 1);
        updateLocalStorage();
        renderTasks();
    }
}

function deleteSelectedTasks() {
    if (selectedTasks.size === 0) {
        alert("No tasks selected for deletion!");
        return;
    }
    if (confirm(`Are you sure you want to delete ${selectedTasks.size} selected task(s)?`)) {
        tasks = tasks.filter((_, index) => !selectedTasks.has(index));
        selectedTasks.clear();
        updateLocalStorage();
        renderTasks();
    }
}

function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function applyDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

function sortTasks(ascending) {
    tasks.sort((a, b) => ascending ? a.text.localeCompare(b.text) : b.text.localeCompare(a.text));
    updateLocalStorage();
    renderTasks();
}
