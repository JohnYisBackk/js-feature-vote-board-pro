"use strict";

// ======================================================
// SELECT ELEMENTS
// ======================================================

// Header
const searchInput = document.getElementById("searchInput");
const navLinks = document.querySelectorAll(".nav-link");
const toggleBtn = document.getElementById("toggleBtn");
const toggleIcon = document.querySelector(".toggle-icon");

// Add Feature
const formFeature = document.getElementById("formFeature");
const featureInput = document.getElementById("featureInput");
const descriptionInput = document.getElementById("descriptionInput");
const categorySelect = document.getElementById("categorySelect");
const prioritySelect = document.getElementById("prioritySelect");
const addFeatureBtn = document.getElementById("addFeatureBtn");

// Stats
const totalFeaturesValue = document.getElementById("totalFeaturesValue");
const totalVotesValue = document.getElementById("totalVotesValue");
const topCategoryValue = document.getElementById("topCategoryValue");
const featuresValue = document.getElementById("featuresValue");

// Feature Controls
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

// Features List
const featuresList = document.getElementById("featuresList");

// ======================================================
// STATE
// ======================================================

let features = [];

let currentNavFilter = "all";
let filterCategory = "all";
let filterSort = "most-voted";

let currentTheme = "light";

// ======================================================
// SAVE / LOAD DATA
// ======================================================

function saveData() {
  localStorage.setItem("featureVoteBoardFeatures", JSON.stringify(features));
}

function loadData() {
  try {
    const storedData = localStorage.getItem("featureVoteBoardFeatures");

    if (!storedData) return;

    features = JSON.parse(storedData);
  } catch (error) {
    console.error(error);
  }
}

// ======================================================
// THEME
// ======================================================

function loadTheme() {
  const storedTheme = localStorage.getItem("featureVoteBoardTheme");

  if (!storedTheme) return;

  currentTheme = storedTheme;

  applyTheme();
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;

  if (currentTheme === "dark") {
    toggleIcon.classList.remove("bi-sun-fill");
    toggleIcon.classList.add("bi-moon-fill");
  } else {
    toggleIcon.classList.remove("bi-moon-fill");
    toggleIcon.classList.add("bi-sun-fill");
  }
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";

  applyTheme(); // toto som zabudol pridat

  localStorage.setItem("featureVoteBoardTheme", currentTheme);
}

// ======================================================
// NAVIGATION
// ======================================================

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    navLinks.forEach((navLink) => {
      navLink.classList.remove("active");
    });

    link.classList.add("active");

    currentNavFilter = link.dataset.filter;

    renderFeatures(); // toto som myslel ze ma ist pod link listener uvodzovky
  });
});

// ======================================================
// ADD FEATURE
// ======================================================

function addFeature(event) {
  event.preventDefault(); // zabudol som sem dat event a prevetDefault()

  const title = featureInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;

  if (!title || !description || !category || !priority) {
    alert("Please fill in all informations...");
    return;
  }

  const newFeature = {
    id: Date.now(),
    title,
    description,
    category,
    priority,
    votes: 0,
    planned: false,
  };

  features.push(newFeature);

  saveData();
  renderFeatures();

  formFeature.reset();
}

// ======================================================
// RENDER FEATURES
// ======================================================

function renderFeatures() {
  featuresList.innerHTML = "";

  let filteredFeatures = [...features];

  filteredFeatures = filterFeatures(filteredFeatures);
  filteredFeatures = searchFeatures(filteredFeatures);
  filteredFeatures = sortFeatures(filteredFeatures);

  filteredFeatures.forEach((feature) => {
    const featureCard = document.createElement("div");
    featureCard.classList.add("feature-card");

    const featureIcon = document.createElement("div");
    featureIcon.classList.add("feature-icon", feature.category);

    featureIcon.innerHTML = getCategoryIcon(feature.category);

    const featureContent = document.createElement("div");
    featureContent.classList.add("feature-content");

    const titleRow = document.createElement("div");
    titleRow.classList.add("feature-title-row");

    const title = document.createElement("h3");
    title.textContent = feature.title;

    const categoryBadge = document.createElement("span");
    categoryBadge.classList.add("feature-category", feature.category);

    categoryBadge.textContent = getCategoryName(feature.category);

    titleRow.appendChild(title);
    titleRow.appendChild(categoryBadge);

    const description = document.createElement("p");
    description.classList.add("feature-description");
    description.textContent = feature.description;

    const featureMeta = document.createElement("div");
    featureMeta.classList.add("feature-meta");

    const priority = document.createElement("span");
    priority.innerHTML = `
      <i class="bi bi-flag"></i>
      ${feature.priority}
    `;

    featureMeta.appendChild(priority);

    featureContent.appendChild(titleRow);
    featureContent.appendChild(description);
    featureContent.appendChild(featureMeta);

    const featureActions = document.createElement("div");
    featureActions.classList.add("feature-actions");

    const voteBox = document.createElement("div");
    voteBox.classList.add("vote-box");

    const voteCount = document.createElement("div");
    voteCount.classList.add("vote-count");

    voteCount.innerHTML = `
      <i class="bi bi-chevron-up"></i>
      <span class="vote-number">${feature.votes}</span>
      <span class="vote-label">votes</span>
    `;

    const upvoteButton = document.createElement("button");
    upvoteButton.classList.add("upvote-button");
    upvoteButton.dataset.id = feature.id;
    upvoteButton.type = "button";

    upvoteButton.innerHTML = `
      <i class="bi bi-triangle-fill"></i>
      Upvote
    `;

    voteBox.appendChild(voteCount);
    voteBox.appendChild(upvoteButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-feature-button");
    deleteButton.dataset.id = feature.id;
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", "Delete feature");

    deleteButton.innerHTML = `
      <i class="bi bi-trash3"></i>
    `;

    const plannedButton = document.createElement("button");
    plannedButton.classList.add("planned-button");
    plannedButton.dataset.id = feature.id;
    plannedButton.type = "button";

    if (feature.planned) {
      plannedButton.classList.add("active");

      plannedButton.innerHTML = `
    <i class="bi bi-check-circle-fill"></i>
    Planned
  `;
    } else {
      plannedButton.innerHTML = `
    <i class="bi bi-calendar-check"></i>
    Mark Planned
  `;
    }

    featureActions.appendChild(voteBox);
    featureActions.appendChild(plannedButton);
    featureActions.appendChild(deleteButton);

    featureCard.appendChild(featureIcon);
    featureCard.appendChild(featureContent);
    featureCard.appendChild(featureActions);

    featuresList.appendChild(featureCard);
  });

  updateStats();
}

function getCategoryName(category) {
  if (category === "ui") return "UI / Design";
  if (category === "performance") return "Performance";
  if (category === "accessibility") return "Accessibility";
  if (category === "functionality") return "Functionality";

  return "Other";
}

function getCategoryIcon(category) {
  if (category === "ui") {
    return '<i class="bi bi-palette-fill"></i>';
  }

  if (category === "performance") {
    return '<i class="bi bi-lightning-charge-fill"></i>';
  }

  if (category === "accessibility") {
    return '<i class="bi bi-universal-access"></i>';
  }

  if (category === "functionality") {
    return '<i class="bi bi-gear-fill"></i>';
  }

  return '<i class="bi bi-stars"></i>';
}

// ======================================================
// UPVOTE FEATURE
// ======================================================

function upvoteFeature(id) {
  const feature = features.find((feature) => feature.id === id);

  if (!feature) return;

  feature.votes++; // toto som zabudol

  saveData();
  renderFeatures();
}

// ======================================================
// DELETE FEATURE
// ======================================================

function deleteFeature(id) {
  features = features.filter((feature) => feature.id !== id);

  saveData();
  renderFeatures();
}

// ======================================================
// SEARCH / FILTER / SORT FEATURES
// ======================================================

function searchFeatures(filteredFeatures) {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (searchTerm) {
    filteredFeatures = filteredFeatures.filter((feature) => {
      return (
        feature.title.toLowerCase().includes(searchTerm) ||
        feature.description.toLowerCase().includes(searchTerm)
      );
    });
  }

  return filteredFeatures;
}

function filterFeatures(filteredFeatures) {
  if (currentNavFilter === "popular") {
    filteredFeatures = filteredFeatures.filter((feature) => feature.votes >= 5);
  }

  if (currentNavFilter === "planned") {
    filteredFeatures = filteredFeatures.filter((feature) => feature.planned);
  }

  if (filterCategory !== "all") {
    filteredFeatures = filteredFeatures.filter(
      (feature) => feature.category === filterCategory,
    );
  }

  return filteredFeatures;
}

function sortFeatures(filteredFeatures) {
  if (filterSort === "most-voted") {
    filteredFeatures.sort((a, b) => b.votes - a.votes);
  }

  if (filterSort === "newest") {
    filteredFeatures.sort((a, b) => b.id - a.id);
  }

  if (filterSort === "oldest") {
    filteredFeatures.sort((a, b) => a.id - b.id);
  }

  return filteredFeatures;
}

function togglePlannedFeature(id) {
  const feature = features.find((feature) => feature.id === id);

  if (!feature) return;

  feature.planned = !feature.planned;

  saveData();
  renderFeatures();
}

// ======================================================
// UPDATE STATS
// ======================================================

function updateStats() {
  totalFeaturesValue.textContent = features.length;

  const totalVotes = features.reduce((sum, feature) => {
    return sum + feature.votes;
  }, 0);

  totalVotesValue.textContent = totalVotes;

  const categoryCounts = {};

  features.forEach((feature) => {
    if (categoryCounts[feature.category]) {
      categoryCounts[feature.category]++;
    } else {
      categoryCounts[feature.category] = 1;
    }
  });

  let topCategory = "";
  let topCount = 0;

  Object.entries(categoryCounts).forEach(([category, count]) => {
    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  });

  topCategoryValue.textContent = topCategory
    ? getCategoryName(topCategory)
    : "-";

  featuresValue.textContent = `${topCount} ${topCount === 1 ? "feature" : "features"}`;
}

// ======================================================
// EVENT LISTENERS
// ======================================================

formFeature.addEventListener("submit", addFeature);

toggleBtn.addEventListener("click", toggleTheme);

searchInput.addEventListener("input", renderFeatures);

categoryFilter.addEventListener("change", () => {
  filterCategory = categoryFilter.value;

  // categoryFilter = categorySelect.value; som dal

  renderFeatures();
});

sortSelect.addEventListener("change", () => {
  filterSort = sortSelect.value;

  renderFeatures();
});

featuresList.addEventListener("click", (event) => {
  const upvoteButton = event.target.closest(".upvote-button");
  const plannedButton = event.target.closest(".planned-button");
  const deleteButton = event.target.closest(".delete-feature-button");

  if (upvoteButton) {
    const id = Number(upvoteButton.dataset.id);

    upvoteFeature(id);
  }

  if (plannedButton) {
    const id = Number(plannedButton.dataset.id);

    togglePlannedFeature(id);
  }

  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);

    deleteFeature(id);
  }
});

// ======================================================
// INITIALIZE APP
// ======================================================

function init() {
  loadData();
  loadTheme();

  renderFeatures();
}

init();
