document.addEventListener("DOMContentLoaded", () => {
  // Variable para guardar actividades y participantes
  let activitiesCache = {};
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      saveActivities(activities);
      renderActivities();
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Guardar actividades y participantes en caché local
  function saveActivities(activities) {
    activitiesCache = activities;
  }

  // Renderizar actividades y participantes
  function renderActivities() {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
    Object.entries(activitiesCache).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";
      const spotsLeft = details.max_participants - details.participants.length;
      let participantsHTML = "";
      if (details.participants.length > 0) {
        participantsHTML = `
          <div class="participants-section">
            <strong>Participants:</strong>
            <ul class="participants-list" style="list-style-type:none; padding-left:0;">
              ${details.participants.map(p => `
                <li style="list-style:none; display:flex; align-items:center; justify-content:space-between;">
                  <span>${p}</span>
                  <button class="delete-participant" title="Eliminar" data-activity="${name}" data-participant="${p}" style="background:none;border:none;color:#d32f2f;cursor:pointer;margin-left:8px;font-size:16px;">
                    &#128465;
                  </button>
                </li>
              `).join("")}
            </ul>
          </div>
        `;
      } else {
        participantsHTML = `
          <div class="participants-section">
            <strong>Participants:</strong>
            <p class="no-participants">No participants yet.</p>
          </div>
        `;
      }
      activityCard.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        ${participantsHTML}
      `;
      activitiesList.appendChild(activityCard);
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  // Evento para eliminar participante del array local
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-participant")) {
      const activity = e.target.getAttribute("data-activity");
      const participant = e.target.getAttribute("data-participant");
      if (confirm(`¿Eliminar a ${participant} de ${activity}?`)) {
        const arr = activitiesCache[activity].participants;
        const idx = arr.indexOf(participant);
        if (idx !== -1) {
          arr.splice(idx, 1);
          renderActivities();
        }
      }
    }
  });

});

