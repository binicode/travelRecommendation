// =========================
// Elements
// =========================
const searchArea  = document.getElementById("searchArea");
const searchInput = document.getElementById("searchInput");
const searchBtn   = document.getElementById("searchBtn");
const clearBtn    = document.getElementById("clearBtn");
const results     = document.getElementById("results");
const resultsLabel = document.getElementById("results-label");

// =========================
// Hide Search Bar on Scroll
// =========================
window.addEventListener("scroll", () => {
  if (window.scrollY < window.innerHeight * 0.85) {
    searchArea.style.display = "flex";
  } else {
    searchArea.style.display = "none";
  }
});

// =========================
// Fetch JSON Data
// =========================
async function loadData() {
  try {
    const response = await fetch("travel_recommendation_api.json");
    if (!response.ok) throw new Error("Failed to load data.");
    return await response.json();
  } catch (error) {
    console.error(error);
    results.innerHTML = `
      <div class="empty-state">
        <strong>Error loading data</strong>
        Unable to load recommendation data. Make sure travel_recommendation_api.json is in the same folder.
      </div>`;
    return null;
  }
}

// =========================
// Normalize Text
// =========================
function normalize(text) {
  return text.trim().toLowerCase();
}

// =========================
// Build a Card
// =========================
function createCard(item) {
  const type = item.type || "city";

  const tagClass = {
    beach:  "tag-beach",
    temple: "tag-temple",
    city:   "tag-city"
  }[type];

  const tagEmoji = {
    beach:  "🏖️ Beach",
    temple: "🛕 Temple",
    city:   "🏙️ City"
  }[type];

  return `
    <div class="dest-card">
      <img src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none'">
      <div class="card-body">
        <span class="card-tag ${tagClass}">${tagEmoji}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>
    </div>
  `;
}

// =========================
// Display Results
// =========================
function displayResults(items, query) {
  results.innerHTML = "";

  if (!items.length) {
    resultsLabel.style.display = "block";
    resultsLabel.textContent = `No results for "${query}"`;
    results.innerHTML = `
      <div class="empty-state">
        <strong>No results found</strong>
        Try: beaches, temples, countries, Japan, Tokyo, Australia, or Brazil.
      </div>`;
  } else {
    resultsLabel.style.display = "block";
    resultsLabel.textContent = `${items.length} result${items.length > 1 ? "s" : ""} for "${query}"`;
    items.forEach(item => {
      results.innerHTML += createCard(item);
    });
  }

  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =========================
// Search Logic
// =========================
async function performSearch() {
  const data = await loadData();
  if (!data) return;

  const raw   = searchInput.value;
  const query = normalize(raw);
  if (!query) return;

  let found = [];

  // Beaches
  if (query === "beach" || query === "beaches") {
    data.beaches.forEach(b => found.push({ ...b, type: "beach" }));
    displayResults(found, raw);
    return;
  }

  // Temples
  if (query === "temple" || query === "temples") {
    data.temples.forEach(t => found.push({ ...t, type: "temple" }));
    displayResults(found, raw);
    return;
  }

  // All countries
  if (query === "country" || query === "countries") {
    data.countries.forEach(country =>
      country.cities.forEach(city => found.push({ ...city, type: "city" }))
    );
    displayResults(found, raw);
    return;
  }

  // Search by country name or city name
  data.countries.forEach(country => {
    if (normalize(country.name).includes(query)) {
      country.cities.forEach(city => found.push({ ...city, type: "city" }));
    } else {
      country.cities.forEach(city => {
        if (normalize(city.name).includes(query)) {
          found.push({ ...city, type: "city" });
        }
      });
    }
  });

  // Search temples
  data.temples.forEach(temple => {
    if (normalize(temple.name).includes(query)) {
      found.push({ ...temple, type: "temple" });
    }
  });

  // Search beaches
  data.beaches.forEach(beach => {
    if (normalize(beach.name).includes(query)) {
      found.push({ ...beach, type: "beach" });
    }
  });

  displayResults(found, raw);
}

// =========================
// Quick-search from pills
// =========================
function searchFor(query) {
  searchInput.value = query;
  performSearch();
}

// =========================
// Clear
// =========================
function clearResults() {
  searchInput.value = "";
  results.innerHTML = "";
  resultsLabel.style.display = "none";
}

// =========================
// Event Listeners
// =========================
searchBtn.addEventListener("click", performSearch);
clearBtn.addEventListener("click", clearResults);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") performSearch();
});
