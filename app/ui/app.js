const { ipcRenderer } = require("electron");

const taskForm = document.querySelector("#taskForm");
const taskName = document.querySelector("#taskName");
const taskEmail = document.querySelector("#taskEmail");
const taskPhone = document.querySelector("#taskPhone");
const taskWork = document.querySelector("#taskWork");
const taskDescription = document.querySelector("#taskDescription");
const taskList = document.querySelector("#taskList");

let updateStatus = false;
let idTaskToUpdate = "";

function deleteTask(id) {
  const response = confirm("are you sure you want to delete it?");
  if (response) {
    ipcRenderer.send("delete-task", id);
  }
  return;
}

function editTask(id) {
  updateStatus = true;
  idTaskToUpdate = id;
  const task = tasks.find((task) => task._id === id);
  taskName.value = task.name;
  taskEmail.value = task.email;
  taskPhone.value = task.phone;
  taskWork.value = task.work;
  taskDescription.value = task.description;
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  tasks.map((t) => {
    taskList.innerHTML += `
          <li class="card">
            <h4>
              Task id: ${t._id}
            </h4>
            <p>
              Task Name: ${t.name}
            </p>
            <p>
            Task Email: ${t.email}
            </p>
            <p>
            Task Phone: ${t.phone}
            </p>
            <p>
            Task Work: ${t.work}
            </p>
            <p>
              Task Description: ${t.description}
            </p>
            <button class="btn btn-danger" onclick="deleteTask('${t._id}')">
              🗑 Delete
            </button>
            <button class="btn btn-secondary" onclick="editTask('${t._id}')">
              ✎ Edit
            </button>
          </li>
        `;
  });
}

let tasks = [];

ipcRenderer.send("get-tasks");

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const task = {
    name: taskName.value,
    email: taskEmail.value,
    phone: taskPhone.value,
    work: taskWork.value,
    description: taskDescription.value,
  };

  if (!updateStatus) {
    ipcRenderer.send("new-task", task);
  } else {
    ipcRenderer.send("update-task", { ...task, idTaskToUpdate });
  }

  taskForm.reset();
});

ipcRenderer.on("new-task-created", (e, arg) => {
  console.log(arg);
  const taskSaved = JSON.parse(arg);
  tasks.push(taskSaved);
  console.log(tasks);
  renderTasks(tasks);
  alert("Task Created Successfully");
  taskName.focus();
});

ipcRenderer.on("get-tasks", (e, args) => {
  const receivedTasks = JSON.parse(args);
  tasks = receivedTasks;
  renderTasks(tasks);
});

ipcRenderer.on("delete-task-success", (e, args) => {
  const deletedTask = JSON.parse(args);
  const newTasks = tasks.filter((t) => {
    return t._id !== deletedTask._id;
  });
  tasks = newTasks;
  renderTasks(tasks);
});

ipcRenderer.on("update-task-success", (e, args) => {
  updateStatus = false;
  const updatedTask = JSON.parse(args);
  tasks = tasks.map((t, i) => {
    if (t._id === updatedTask._id) {
      t.name = updatedTask.name;
      t.email = updatedTask.email;
      t.phone = updatedTask.phone;
      t.work = updatedTask.work;
      t.description = updatedTask.description;
    }
    return t;
  });
  renderTasks(tasks);
});
