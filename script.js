// Variables that reference DOM elements throughout code
const modal = document.getElementById("exampleModal");
const getAddMovieData = document.getElementById("addMovieSubmitButton");
const movieForm = document.getElementById("movieForm");
const apiKey = "87d03bc1"; // API key for OMDb

//HTML Form Reset: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
//Window Object: https://developer.mozilla.org/en-US/docs/Web/API/Window

// MODAL RESET
// This event listener resets the form when the modal is closed
// It prevents old data from showing up when you open the modal again
document
  .getElementById("exampleModal")
  .addEventListener("hidden.bs.modal", () => {
    movieForm.reset(); // Clears all input fields
    movieForm.classList.remove("was-validated"); // Removes Bootstrap validation styling

    // Also clear any row selection when the modal closes
    // ChatGPT wrote this part after I couldn't figure out how to disable row selection when the modal closed
    if (window.selectedRow) {
      window.selectedRow.classList.remove("selected");
      window.selectedRow = null;
    }
  });

// Bootstrap Modal Events: https://getbootstrap.com/docs/5.3/components/modal/#events
// Bootstrap Modal Methods: https://getbootstrap.com/docs/5.3/components/modal/#methods
// JavaScript classList: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
// JavaScript preventDefault: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
// Bootstrap Form Validation: https://getbootstrap.com/docs/5.3/forms/validation/
// HTML Check Form Validity: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/checkValidity

// FORM VALIDATION
// This prevents the form from submitting if required fields are empty
// Uses Bootstrap's built-in validation styles

movieForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Stop the form from submitting before the fields are validated

  // Check if all required fields have values
  if (!movieForm.checkValidity()) {
    event.stopPropagation(); //I asked ChatGPT about this function cause I didn't understand it
    movieForm.classList.add("was-validated"); // Show validation errors
    return;
  }

  movieForm.classList.add("was-validated");

  // Check if we're in edit mode or add mode
  //Used ChatGPT to help with tying in the form validity to the edit and add movie functionality
  if (window.selectedRow) {
    updateMovie(); // Call the function to update existing movie
  } else {
    addMovie(); // Call the function that adds the movie to the table
  }
});

// Insert Table Rows: https://examples.bootstrap-table.com/#methods/insert-row.html
// https://www.w3schools.com/jsref/met_table_insertrow.asp
// Javascript async Function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

// ADD MOVIE FUNCTIONALITY
// This function creates a new row in the table with the movie data
// Also fetches data from the OMDb API if it exists

async function addMovie() {
  // Get values from the form
  let title = document.getElementById("movieTitle").value;
  let genre = document.getElementById("movieGenre").value;
  let watchStatus = document.getElementById("watchStatus").value;
  let rating = document.getElementById("rating").value;
  let movieComments = document.getElementById("movieComments").value;

  // Get reference to table body where we'll add the new row
  let tableBody = document
    .getElementById("myTable")
    .getElementsByTagName("tbody")[0];

  // Create a new row
  let row = tableBody.insertRow();

  // Create cells for each piece of data
  let cell1 = row.insertCell(0); // Cover
  let cell2 = row.insertCell(1); // Title
  let cell3 = row.insertCell(2); // Genre
  let cell4 = row.insertCell(3); // Director
  let cell5 = row.insertCell(4); // Watch Status
  let cell6 = row.insertCell(5); // Rating
  let cell7 = row.insertCell(6); // Synopsis
  let cell8 = row.insertCell(7); // Comments

  // API Website with documentation: https://www.omdbapi.com/
  // Using the Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

  // API INTEGRATION--This section was written by ChatGPT because the OMDb documentation for calling the API was vague and didn't
  // include examples of the code needed to fetch results

  async function fetchMovieDetails(title) {
    const url = `https://www.omdbapi.com/?t=${title}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === "True") {
        console.log("Movie Poster URL:", data.Poster);
        console.log("Director:", data.Director);
        console.log("Plot:", data.Plot);

        return {
          posterUrl: data.Poster,
          director: data.Director,
          plot: data.Plot,
        };
      } else {
        console.error("Error: Movie not found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching data from OMDB:", error);
    }
  }

  // Call the fetch function to get movie details from the API
  const movieDetails = await fetchMovieDetails(title);
  if (movieDetails) {
    cell1.innerHTML = `<img src="${movieDetails.posterUrl}" alt="Movie Cover" class="img-responsive">`;
    cell4.innerHTML = movieDetails.director;
    cell7.innerHTML = movieDetails.plot;
  }

  cell2.innerHTML = title;
  cell3.innerHTML = genre;
  cell5.innerHTML = watchStatus;
  cell8.innerHTML = movieComments;

  let ratingValue = document.getElementById("rating").value;
  cell6.innerHTML = "";
  let stars = "";
  for (let i = 0; i < ratingValue; i++) {
    stars +=
      '<span class="fa fa-star checked style="margin-right: 5px"> </span> ';
  }
  cell6.innerHTML = stars;

  //Congrats Sound: https://pixabay.com/sound-effects/search/yay/
  // Create an Audio object for the congratulatory sound
  const congratsSound = new Audio("yay-6120.mp3");

  // Check if the watch status is "Finished" and show the alert
  if (watchStatus === "Finished") {
    congratsSound.play();
    alert("YAY! Congrats on finishing another movie");
  }

  // Close the modal when done
  let modalInstance = bootstrap.Modal.getInstance(modal);
  if (modalInstance) {
    modalInstance.hide();
  } else {
    new bootstrap.Modal(modal).hide();
  }

  // Sets up listener for when the modal is fully hidden
  const modalElement = document.getElementById("exampleModal");
  modalElement.addEventListener("hidden.bs.modal", () => {
    const movieForm = document.getElementById("movieForm");
    movieForm.reset(); // Clears input fields
    movieForm.classList.remove("was-validated"); // Removes validation styling
  });
}

// EDIT LOG BUTTON
document.getElementById("editLogButton").addEventListener("click", function () {
  // Toggle edit mode
  window.editMode = !window.editMode;

  // Exit delete mode if we're entering edit mode
  if (window.editMode && deleteMode) {
    deleteMode = false;
    deleteButton.style.backgroundColor = "";
  }

  // Visual indicator for edit mode
  if (window.editMode) {
    this.classList.add("active");
    alert("Please select a row to edit.");
  } else {
    this.classList.remove("active");
    // Clear any selection when exiting edit mode without selecting
    if (window.selectedRow) {
      window.selectedRow.classList.remove("selected");
      window.selectedRow = null;
    }
  }
});

//Using .innerHTML function: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML

// Updating the movie info after the edit log button is triggered
// Updates an existing movie row with the form data
function updateMovie() {
  // Get the updated values from the form
  const title = document.getElementById("movieTitle").value;
  const genre = document.getElementById("movieGenre").value;
  const watchStatus = document.getElementById("watchStatus").value;
  const ratingValue = parseInt(document.getElementById("rating").value); // Parse as integer
  const movieComments = document.getElementById("movieComments").value;

  // Update the row with the new data
  const row = window.selectedRow;
  row.cells[1].innerText = title;
  row.cells[2].innerText = genre;
  row.cells[4].innerText = watchStatus;
  row.cells[7].innerText = movieComments;

  // Clear the existing stars and then add the new ones
  //ChatGPT wrote this because the stars weren't showing up, only numbers were
  row.cells[5].innerHTML = ""; // Clear existing stars
  row.cells[5].innerHTML = `<span class="fa fa-star checked"></span> `
    .repeat(ratingValue)
    .trim();

  const congratsSound = new Audio("yay-6120.mp3");

  // Check if the watch status is "Finished" and show the alert and play sound
  if (watchStatus === "Finished") {
    congratsSound.play();
    alert("YAY! Congrats on finishing another movie");
  }

  // Close the modal
  const modalInstance = bootstrap.Modal.getInstance(
    document.getElementById("exampleModal")
  );
  modalInstance.hide();

  // Clear the selection
  row.classList.remove("selected");
  window.selectedRow = null;
}

// JavaScript DOM Manipulation: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
// Tooltips: https://getbootstrap.com/docs/5.3/components/tooltips/
// Bootstrap Tables(Delete Functionality): https://examples.bootstrap-table.com/#
// How to use Javascript's .closest() method: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
// Event Delegation(having one event happen after another ): https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling

// DOM Events for when page loads--ChatGPT was used to group all the DOMContentLoaded events together because they were
// scattered throughout the code and it was preventing things from functioning properly
// ChatGPT also gave me the idea to make the delete button in the navbar changes to red in delete mode to visually indicate to the user.
// This event sets up all the event handlers needed when the page first loads

document.addEventListener("DOMContentLoaded", function () {
  // DELETE FUNCTION SETUP
  let deleteMode = false;
  let selectedRows = []; //Array to store rows we are deleting

  // Set up the tooltip that appears when hovering over the delete button
  let deleteButton = document.getElementById("deleteButton");
  new bootstrap.Tooltip(deleteButton, {
    title: "Please select which rows to delete.",
    placement: "top",
  });

  // Toggle delete mode when the delete button is clicked
  deleteButton.addEventListener("click", function () {
    deleteMode = !deleteMode; // Toggle between true/false

    // Exit edit selection mode if we're entering delete mode
    if (deleteMode && window.editMode) {
      window.editMode = false;
      document.getElementById("editLogButton").classList.remove("active");
    }

    if (deleteMode) {
      deleteButton.style.backgroundColor = "red";
    } else {
      deleteButton.style.backgroundColor = "";
      selectedRows.forEach((row) => row.classList.remove("selected"));
      selectedRows = [];
    }
  });

  // Handle clicks on table rows when in delete mode
  //ChatGPT wrote the key logic for deleting multiple rows at the time cause I didn't understand how to do it
  document
    .querySelector("#myTable tbody")
    .addEventListener("click", function (e) {
      if (!deleteMode && !window.editMode) return; // Do nothing if not in delete or edit mode

      let row = e.target.closest("tr"); // Find the clicked row
      if (!row) return;

      if (deleteMode) {
        if (selectedRows.includes(row)) {
          selectedRows = selectedRows.filter((r) => r !== row);
          row.classList.remove("selected");
        } else {
          selectedRows.push(row);
          row.classList.add("selected");
        }
        console.log("Selected Rows:", selectedRows);

        // Show the modal after each row selection in delete mode
        const deleteModal = new bootstrap.Modal(
          document.getElementById("deleteModal")
        );
        deleteModal.show();
      } else if (window.editMode) {
        // HANDLES EDITING
        // Clear previous selection
        if (window.selectedRow) {
          window.selectedRow.classList.remove("selected");
        }
        row.classList.add("selected");
        window.selectedRow = row;

        // Filling the form with the existing data
        const title = row.cells[1].innerText;
        const genre = row.cells[2].innerText;
        const watchStatus = row.cells[4].innerText;
        const rating = row.cells[5].innerText;
        const movieComments = row.cells[7].innerText;

        document.getElementById("movieTitle").value = title;
        document.getElementById("movieGenre").value = genre;
        document.getElementById("watchStatus").value = watchStatus;
        document.getElementById("rating").value = rating;
        document.getElementById("movieComments").value = movieComments;

        // Open the modal with the data loaded
        const modalInstance = new bootstrap.Modal(
          document.getElementById("exampleModal")
        );
        modalInstance.show();

        // Exit edit mode after selection
        window.editMode = false;
        document.getElementById("editLogButton").classList.remove("active");
      }
    });

  // Handles confirm delete button
  document
    .getElementById("confirmDelete")
    .addEventListener("click", function () {
      console.log("Confirm Delete clicked:", selectedRows);
      selectedRows.forEach((row) => {
        console.log("Removing row:", row);
        row.remove();
      });
      selectedRows = [];

      deleteMode = false;
      deleteButton.style.backgroundColor = "";

      const deleteModal = bootstrap.Modal.getInstance(
        document.getElementById("deleteModal")
      );
      if (deleteModal) {
        deleteModal.hide();
      }
    });

  //GROUPING MOVIES BY SERIES
  //Claude AI, ChatGPT and DeepSeek helped me figure out how to get this code to work..they wrote the test cases for
  // checking whether a movie is a series or not, including the regex patterns
  document
    .getElementById("groupSeriesLink")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default behavior

      const allRows = document.querySelectorAll("#myTable tbody tr");
      const seriesMap = new Map();

      // Group movies by series
      allRows.forEach((row) => {
        const rowTitle = row.cells[1].innerText.trim();
        const seriesPrefix = getSeriesPrefix(rowTitle); // Extract series prefix

        const cover = row.cells[0].innerHTML;
        const rating = row.cells[5].querySelectorAll(".fa-star.checked").length;

        if (!seriesMap.has(seriesPrefix)) {
          seriesMap.set(seriesPrefix, []);
        }
        seriesMap.get(seriesPrefix).push({ cover, title: rowTitle, rating });
      });

      populateModal(seriesMap);
    });

  // Function to extract series prefix from a title
  function getSeriesPrefix(title) {
    // Normalize the title: lowercase and remove special characters
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9\s]/gi, "");

    // Create a base version of the title without numbers at the end
    const baseTitle = normalizedTitle.replace(/\s+\d+$/, "");

    // Add specific series handling for problematic titles
    if (normalizedTitle.includes("phineas and ferb")) {
      return "phineas and ferb";
    }

    // Handle titles with subtitles (e.g., "Star Wars: Episode IV")
    if (baseTitle.includes(":")) {
      return baseTitle.split(":")[0].trim(); // Take everything before the colon
    }

    // Handle titles with common prefixes (e.g., "The Lord of the Rings: The Fellowship of the Ring")
    const commonPrefixes = [
      "the lord of the rings",
      "harry potter",
      "fast and furious",
      "now you see me", // Added this specific series
      "star wars",
      "mission impossible",
      "jurassic park",
      "jurassic world",
    ];

    for (const prefix of commonPrefixes) {
      if (baseTitle.startsWith(prefix)) {
        return prefix; // Use the common prefix
      }
    }

    // Matching to detect numbered sequels
    // Example: "Toy Story" and "Toy Story 3" should match
    const sequelPattern = /^(.+?)(?:\s+\d+)?$/;
    const match = baseTitle.match(sequelPattern);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback: Use the first 3 words as the series prefix
    const words = baseTitle.split(" ");
    return words.slice(0, Math.min(3, words.length)).join(" ");
  }

  // debug function
  function debugSeriesMatching() {
    const allRows = document.querySelectorAll("#myTable tbody tr");
    const debugMap = new Map();

    allRows.forEach((row) => {
      const rowTitle = row.cells[1].innerText.trim();
      const seriesPrefix = getSeriesPrefix(rowTitle);

      if (!debugMap.has(seriesPrefix)) {
        debugMap.set(seriesPrefix, []);
      }
      debugMap.get(seriesPrefix).push(rowTitle);
    });

    console.log("Series Grouping Debug:");
    debugMap.forEach((titles, prefix) => {
      console.log(`Series: "${prefix}" - ${titles.length} movies`);
      titles.forEach((title) => console.log(`  - ${title}`));
    });
  }

  // Function to populate the modal with multiple series tables
  function populateModal(seriesMap) {
    const modalBody = document.getElementById("groupedMoviesModal");
    modalBody.innerHTML = ""; // Clear previous content

    let hasSeries = false; // Track if any valid series is added

    seriesMap.forEach((movies, seriesName) => {
      if (movies.length >= 2) {
        // Include series with 2 or more movies only
        hasSeries = true;
        const totalRating = movies.reduce(
          (sum, movie) => sum + movie.rating,
          0
        );
        const averageRating = (totalRating / movies.length).toFixed(2);

        const seriesTable = document.createElement("div");
        seriesTable.classList.add("mb-4"); // Add spacing between tables
        seriesTable.innerHTML = `
        <h5>${
          seriesName.charAt(0).toUpperCase() + seriesName.slice(1)
        } (Avg Rating: ${averageRating})</h5>
        <table class="table">
            <thead>
                <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Rating</th>
                </tr>
            </thead>
            <tbody>
                ${movies
                  .map(
                    (movie) => `
                        <tr>
                            <td>${movie.cover}</td>
                            <td>${movie.title}</td>
                            <td>${movie.rating}</td>
                        </tr>`
                  )
                  .join("")}
            </tbody>
        </table>
      `;
        modalBody.appendChild(seriesTable);
      }
    });

    // Message if no series met the criteria
    if (!hasSeries) {
      modalBody.innerHTML = "<p>No series with 2 or more movies found.</p>";
    }

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("groupSeriesModal")
    );
    modal.show();
  }
});

// TOOLTIP INITIALIZATION
// Enable any tooltips that are defined in the HTML with data-bs-toggle="tooltip"
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
tooltipTriggerList.forEach(function (tooltipTriggerEl) {
  new bootstrap.Tooltip(tooltipTriggerEl);
});

// CANCEL BUTTON FUNCTION
// Reset row selection when the cancel button is clicked
const cancelButton = document.querySelector("#exampleModal .btn-secondary");
if (cancelButton) {
  cancelButton.addEventListener("click", function () {
    if (window.selectedRow) {
      window.selectedRow.classList.remove("selected");
      window.selectedRow = null;
    }
  });
}

// W3Schools Table Filter: https://www.w3schools.com/howto/howto_js_filter_table.asp
//https://www.w3schools.com/howto/howto_js_filter_elements.asp
// JavaScript querySelectorAll: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
// Boostrap Advanced Filters: https://www.w3schools.com/bootstrap/bootstrap_filters.asp
// Triggering Button Clicks: Trigger Button Click on Enter: https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp

// SEARCH FUNCTIONALITY
//Got core idea from w3schools but asked DeepSeek for help implementing and debugging it
const searchSubmitButton = document.getElementById("searchFilterSubmit");
const searchInput = document.querySelector(".form-control.me-2"); // Get the search input field

console.log("Search Submit Button:", searchSubmitButton);
console.log("Search Input:", searchInput);

if (searchSubmitButton && searchInput) {
  // Function to filter the table rows
  function filterTable() {
    // Get the search input value and trim any extra spaces
    const value = searchInput.value.toLowerCase().trim();

    // Hide all rows initially
    const rows = document.querySelectorAll("#myTable tbody tr");
    rows.forEach(function (row) {
      row.style.display = "none";
    });

    // Filter the table rows to show only the exact match
    rows.forEach(function (row) {
      const rowText = row.textContent.toLowerCase().trim();
      if (rowText.includes(value)) {
        row.style.display = ""; // Show the row if it matches the search value
      }
    });
  }

  // Add event listener for the "Submit" button
  searchSubmitButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting
    filterTable(); // Call the filter function
  });

  // Add event listener for the "input" event on the search input field
  searchInput.addEventListener("input", function () {
    filterTable(); // Call the filter function as the user types
  });
} else {
  console.error("Search elements not found!");
}

//How to sort Javascript Tables: https://www.w3schools.com/howto/howto_js_sort_table.asp
//HTMLTableElement.tBodies: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tBodies
//Sorting Table Elements Alphabetically by title
//Links to first drop down button under sort
//Used ChatGPT for examples of how to sort tables by specific criteria

function sortTableByTitle() {
  // Select the table inside the div with id "myTable"
  let table = document.querySelector("#myTable table");
  let tbody = table.tBodies[0];

  // Convert rows to an array for sorting
  let rowsArray = Array.from(tbody.rows);

  rowsArray.sort((a, b) => {
    // The title is the first TD cell in each row.
    let titleA = a.getElementsByTagName("TD")[0].innerText.toLowerCase();
    let titleB = b.getElementsByTagName("TD")[0].innerText.toLowerCase();
    return titleA.localeCompare(titleB);
  });

  // Append the sorted rows back into the tbody.
  rowsArray.forEach((row) => tbody.appendChild(row));
}

function sortTableByDirector() {
  // Select the table inside the div with id "myTable"
  let table = document.querySelector("#myTable table");
  let tbody = table.tBodies[0];

  // Convert rows to an array for sorting
  let rowsArray = Array.from(tbody.rows);

  rowsArray.sort((a, b) => {
    // The title is the first TD cell in each row.
    let directorA = a.getElementsByTagName("TD")[2].innerText.toLowerCase();
    let directorB = b.getElementsByTagName("TD")[2].innerText.toLowerCase();
    return directorA.localeCompare(directorB);
  });

  // Append the sorted rows back into the tbody.
  rowsArray.forEach((row) => tbody.appendChild(row));
}

// Rating Sort Functionality
function sortTableByRating() {
  let table = document.querySelector("#myTable table");
  let tbody = table.tBodies[0];
  let rowsArray = Array.from(tbody.rows);

  rowsArray.sort((a, b) => {
    // Count the number of checked stars in each row's rating cell
    const aStars = a.cells[5].querySelectorAll(".fa-star.checked").length;
    const bStars = b.cells[5].querySelectorAll(".fa-star.checked").length;

    // Sort descending (highest first)
    return bStars - aStars;
  });

  // Re-insert sorted rows
  rowsArray.forEach((row) => tbody.appendChild(row));
}

function sortTableByRatingReverse() {
  let table = document.querySelector("#myTable table");
  let tbody = table.tBodies[0];
  let rowsArray = Array.from(tbody.rows);

  rowsArray.sort((a, b) => {
    // Count the number of checked stars in each row's rating cell
    const aStars = a.cells[5].querySelectorAll(".fa-star.checked").length;
    const bStars = b.cells[5].querySelectorAll(".fa-star.checked").length;

    // Sort ascending (lowest first)
    return aStars - bStars;
  });

  // Re-insert sorted rows
  rowsArray.forEach((row) => tbody.appendChild(row));
}
