// Select DOM elements
const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const goalsContainer = document.getElementById("goalsContainer");

// Load from localStorage
let goals = JSON.parse(localStorage.getItem("goals")) || [];

// Render all existing goals
goals.forEach((goal, index) => renderGoal(goal, index));

// Handle form submit
goalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = goalInput.value.trim();
  if (!text) return;

  const newGoal = {
  text,
  progress: 0,
  deadline: "",// initially empty
  notes: ""
};


  goals.push(newGoal);
  saveGoals();
  renderGoal(newGoal, goals.length - 1);
  goalInput.value = "";
});

// Render single goal card
function renderGoal(goal, index) {
  const card = document.createElement("div");
  card.className = "goal-card";

  card.innerHTML = `
  <div class="notes-section">
  <label>📝 Notes:</label>
  <textarea class="notes-input" placeholder="Write something...">${goal.notes || ""}</textarea>
</div>
  <div class="deadline-section">
  <label>🎯 Deadline: </label>
  <input type="date" class="deadline-input" value="${goal.deadline || ""}" />
  <span class="countdown-text"></span>
</div>
    <div class="goal-title" contenteditable="false">${goal.text}</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${goal.progress}%"></div>
    </div>
    <div class="goal-actions">
      <button class="increase">+ Progress</button>
      <button class="decrease">- Progress</button>
      <button class="reset">Reset</button>
      <button class="edit">✏️ Edit</button>
      <button class="delete">🗑 Delete</button>
    </div>
  `;
  const notesInput = card.querySelector(".notes-input");
notesInput.addEventListener("input", () => {
  goals[index].notes = notesInput.value;
  saveGoals();
});

  const deadlineInput = card.querySelector(".deadline-input");
const countdownText = card.querySelector(".countdown-text");

// Save on change
deadlineInput.addEventListener("change", () => {
  goals[index].deadline = deadlineInput.value;
  saveGoals();
  reloadGoals(); // re-render to update countdown
});

// Show countdown
if (goal.deadline) {
  const today = new Date();
  const deadlineDate = new Date(goal.deadline);
  const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

  if (diff > 0) {
    countdownText.textContent = `⏳ ${diff} day${diff > 1 ? "s" : ""} left`;
  } else {
    countdownText.textContent = `✅ Deadline passed`;
    countdownText.style.color = "#f66";
  }
}

  card.className = "goal-card";
    if (goal.progress === 100) {
    const completedBadge = document.createElement("div");
    completedBadge.className = "completed-badge";
    completedBadge.textContent = "✔️ Completed!";
    card.appendChild(completedBadge);
    }

  const fillBar = card.querySelector(".progress-fill");

  // Increase button
  card.querySelector(".increase").addEventListener("click", () => {
  if (goals[index].progress < 100) {
    goals[index].progress += 10;
    saveGoals();
    reloadGoals(); // 👈 force re-render
  }
});

  // Decrease button
 card.querySelector(".decrease").addEventListener("click", () => {
  if (goals[index].progress > 0) {
    goals[index].progress -= 10;
    saveGoals();
    reloadGoals(); // 👈 force re-render
  }
});

  // Reset button
 card.querySelector(".reset").addEventListener("click", () => {
  goals[index].progress = 0;
  saveGoals();
  reloadGoals(); // 👈 force re-render
});

  // Edit button
  const titleDiv = card.querySelector(".goal-title");
  card.querySelector(".edit").addEventListener("click", () => {
    const isEditing = titleDiv.contentEditable === "true";

    if (!isEditing) {
      titleDiv.contentEditable = "true";
      titleDiv.focus();
      titleDiv.style.borderBottom = "1px dashed #888";
    } else {
      titleDiv.contentEditable = "false";
      titleDiv.style.borderBottom = "none";
      goals[index].text = titleDiv.textContent.trim();
      saveGoals();
    }
  });

  // Delete button
  card.querySelector(".delete").addEventListener("click", () => {
    if (confirm("Delete this goal?")) {
      goals.splice(index, 1);
      saveGoals();
      reloadGoals();
    }
  });

  goalsContainer.prepend(card);
}

function updateDashboard() {
  const total = goals.length;
  const completed = goals.filter(g => g.progress === 100).length;
  const average =
    total === 0
      ? 0
      : Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / total);
  const withDeadline = goals.filter(g => g.deadline).length;

  document.getElementById("totalGoals").textContent = total;
  document.getElementById("completedGoals").textContent = completed;
  document.getElementById("avgProgress").textContent = `${average}%`;
  document.getElementById("deadlineGoals").textContent = withDeadline;
}

// Save to localStorage
function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
  updateDashboard();
}

// Reload all goals
function reloadGoals() {
  goalsContainer.innerHTML = "";
  goals.forEach((goal, index) => renderGoal(goal, index));
}

// DAILY CHECK-IN LOGIC
const checkinBtn = document.getElementById("dailyCheckinBtn");
const today = new Date().toISOString().slice(0, 10);
const lastCheck = localStorage.getItem("lastCheckinDate");

if (lastCheck === today) {
  checkinBtn.disabled = true;
  checkinBtn.textContent = "✅ Already Checked In Today";
  checkinBtn.style.background = "#888";
}

checkinBtn.addEventListener("click", () => {
  if (localStorage.getItem("lastCheckinDate") === today) {
    alert("Already checked in today. Come back tomorrow!");
    return;
  }

  let updated = false;
  goals.forEach((goal) => {
    if (goal.progress < 100) {
      goal.progress = Math.min(100, goal.progress + 5);
      updated = true;
    }
  });

  if (updated) {
    saveGoals();
    reloadGoals();
    localStorage.setItem("lastCheckinDate", today);
    checkinBtn.disabled = true;
    checkinBtn.textContent = "✅ Already Checked In Today";
    checkinBtn.style.background = "#888";
    alert("Great! +5% progress added to your goals 💪");
  } else {
    alert("All goals are already at 100%! 🎉");
  }
});
