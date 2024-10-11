let workoutQueue = []; // Array to store the workout exercises
let timers = []; // Array to store timer objects
let currentExercise = 0; // Index of the current exercise in the queue

document
  .getElementById("workout-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const exercise = document.getElementById("exercise").value;
    const timeLimit = parseInt(document.getElementById("time-limit").value, 10);

    if (exercise && !isNaN(timeLimit)) {
      const workoutItem = document.createElement("li");
      workoutItem.classList.add("workout-item");

      const exerciseText = document.createElement("span");
      exerciseText.classList.add("exercise");
      exerciseText.textContent = exercise;
      workoutItem.appendChild(exerciseText);

      const timeText = document.createElement("span");
      timeText.classList.add("time");
      timeText.textContent = `${timeLimit}:00`;
      workoutItem.appendChild(timeText);

      const controlButtons = document.createElement("div");
      controlButtons.classList.add("control-buttons");

      const stopButton = document.createElement("button");
      stopButton.textContent = "Pause Timer";
      stopButton.disabled = true;
      stopButton.addEventListener("click", function () {
        stopTimer(currentExercise);
      });
      controlButtons.appendChild(stopButton);

      const endButton = document.createElement("button");
      endButton.textContent = "End";
      endButton.disabled = true;
      endButton.addEventListener("click", function () {
        endTask(currentExercise, workoutItem);
      });
      controlButtons.appendChild(endButton);

      workoutItem.appendChild(controlButtons);
      document.getElementById("exercise-list").appendChild(workoutItem);

      workoutQueue.push({
        exerciseText,
        timeLimit,
        timeText,
        stopButton,
        endButton,
        pausedTime: null, // Initialize paused time for each exercise
        actualTimeSpent: 0, // To store the actual time spent on each exercise
      });

      document.getElementById("exercise").value = "";
      document.getElementById("time-limit").value = "";
    }
  });

document.getElementById("start-workout").addEventListener("click", function () {
  const button = document.getElementById("start-workout");

  // Change the button to "End Workout"
  button.textContent = "End Workout";
  button.classList.add("clicked-effect");

  setTimeout(function () {
    button.classList.remove("clicked-effect");
  }, 300);

  // Change the button's action to display the results when pressed
  button.removeEventListener("click", startNextExercise);
  button.addEventListener("click", function () {
    displayResults(); // Call function to show the results in a new table
  });

  startNextExercise();
  button.disabled = false;
});

function startNextExercise() {
  if (currentExercise < workoutQueue.length) {
    const workout = workoutQueue[currentExercise];
    workout.stopButton.disabled = false;
    workout.endButton.disabled = false;

    timers[currentExercise] = startTimer(
      workout.pausedTime !== null ? workout.pausedTime : workout.timeLimit,
      workout.timeText,
      function () {
        endTask(currentExercise, workout.item);
      }
    );
    workout.pausedTime = null;
  }
}

function startTimer(duration, display, onComplete) {
  let timer = duration,
    minutes,
    seconds;
  const interval = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = `${minutes}:${seconds}`;

    if (--timer < 0) {
      clearInterval(interval);
      display.textContent = "completed";
      if (onComplete) onComplete();
    }
  }, 1000);

  return interval;
}

function stopTimer(index) {
  clearInterval(timers[index]);
  const workout = workoutQueue[index];
  const timeParts = workout.timeText.textContent.split(":");
  const [minutes, seconds] = timeParts.map(Number);
  workout.pausedTime = minutes * 60 + seconds; // Store paused time in the specific exercise object
  workout.timeText.textContent = `${minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
  workout.stopButton.textContent = "Resume Timer";
  workout.stopButton.addEventListener("click", function resumeHandler() {
    resumeTimer(index);
    workout.stopButton.removeEventListener("click", resumeHandler); // Prevent multiple listeners
  });
}

function resumeTimer(index) {
  const workout = workoutQueue[index];
  workout.stopButton.textContent = "Pause Timer";
  timers[index] = startTimer(workout.pausedTime, workout.timeText, function () {
    endTask(index, workout.item);
  });
  workout.stopButton.removeEventListener("click", resumeTimer); // Prevent multiple resumes
  workout.stopButton.addEventListener("click", function () {
    stopTimer(index);
  });
}

function endTask(index, workoutItem) {
  clearInterval(timers[index]);

  const workout = workoutQueue[index];
  const timeParts = workout.timeText.textContent.split(":");
  const [minutes, seconds] = timeParts.map(Number);
  const remainingTime = minutes * 60 + seconds; // Total time left when "End" is pressed
  const totalElapsedTime = workout.timeLimit * 60 - remainingTime; // Calculate actual time spent

  // Store the actual time spent on this exercise
  workout.actualTimeSpent = totalElapsedTime; // Time in seconds

  // Mark the exercise as completed
  workoutItem.innerHTML = "";
  const completedMessage = document.createElement("span");
  completedMessage.textContent = "Completed";
  completedMessage.className = "completed";
  workoutItem.appendChild(completedMessage);

  currentExercise++;
  startNextExercise();
}

function displayResults() {
  // Hide the workout form and list
  document.getElementById("workout-form").style.display = "none";
  document.getElementById("exercise-list").style.display = "none";
  document.getElementById("start-workout").style.display = "none";

  // Create a table to display the results
  const resultsDiv = document.createElement("div");
  const table = document.createElement("table");
  table.style.width = "100%";
  table.setAttribute("border", "1");

  // Create table headers
  const headers = table.insertRow();
  headers.insertCell(0).textContent = "Exercise";
  headers.insertCell(1).textContent = "Time Spent (Minutes:Seconds)";

  let totalExerciseTime = 0; // Initialize total exercise time

  // Populate the table with exercises and actual time spent
  workoutQueue.forEach((workout) => {
    const row = table.insertRow();
    row.insertCell(0).textContent = workout.exerciseText.textContent;

    // Format the actual time spent as Minutes:Seconds
    const minutes = Math.floor(workout.actualTimeSpent / 60);
    const seconds = workout.actualTimeSpent % 60;
    row.insertCell(1).textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    totalExerciseTime += workout.actualTimeSpent; // Sum up total exercise time
  });

  // Add a row to display the total exercise time
  const totalRow = table.insertRow();
  totalRow.insertCell(0).textContent = "Total Exercise Time";
  const totalMinutes = Math.floor(totalExerciseTime / 60);
  const totalSeconds = totalExerciseTime % 60;
  totalRow.insertCell(1).textContent = `${totalMinutes}:${totalSeconds
    .toString()
    .padStart(2, "0")}`;

  resultsDiv.appendChild(table);
  document.body.appendChild(resultsDiv);
}
