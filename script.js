// =======================
//  CONFIG
// =======================

// Our Node backend base URL (same origin)
const BACKEND_API = '/api';

// =======================
//  DOM ELEMENTS
// =======================
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const errorMessage = document.getElementById("errorMessage");
const loadingSpinner = document.getElementById("loadingSpinner");

const currentWeather = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecastContainer");
const mlCard = document.getElementById("ml-card");

// Current weather elements
const cityNameEl = document.getElementById("cityName");
const currentDateEl = document.getElementById("currentDate");
const weatherIconEl = document.getElementById("weatherIcon");
const temperatureEl = document.getElementById("temperature");
const weatherDescriptionEl = document.getElementById("weatherDescription");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");
const pressureEl = document.getElementById("pressure");

// =======================
//  EVENT LISTENERS
// =======================

if (searchBtn) {
  searchBtn.addEventListener("click", handleSearch);
}

if (cityInput) {
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });
}

if (locationBtn) {
  locationBtn.addEventListener("click", handleGeolocation);
}

// =======================
//  MAIN HANDLERS
// =======================

function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  fetchWeatherByCity(city);
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  showLoading();
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoordinates(latitude, longitude);
    },
    () => {
      hideLoading();
      showError("Unable to retrieve your location. Please check your permissions.");
    }
  );
}

// =======================
//  FETCH FUNCTIONS
// =======================

async function fetchWeatherByCity(city) {
  showLoading();
  hideError();

  try {
    const weatherUrl = `${BACKEND_API}/weather?city=${encodeURIComponent(city)}`;
    const forecastUrl = `${BACKEND_API}/forecast?city=${encodeURIComponent(city)}`;

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
    ]);

    const weatherData = await weatherRes.json().catch(() => null);
    const forecastData = await forecastRes.json().catch(() => null);

    // --- Better error messages ---
    if (!weatherRes.ok) {
      const apiMsg = (weatherData && weatherData.message) || "";
      if (weatherRes.status === 404 || apiMsg.toLowerCase() === "city not found") {
        throw new Error("City not found. Please check the spelling and try again.");
      }
      throw new Error(`Weather API error: ${apiMsg || "Failed to fetch current weather."}`);
    }

    if (!forecastRes.ok) {
      const apiMsg = (forecastData && forecastData.message) || "";
      throw new Error(`Forecast API error: ${apiMsg || "Failed to fetch forecast."}`);
    }

    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    updateMLCardSafe(weatherData); // fire & forget

  } catch (err) {
    console.error("fetchWeatherByCity error:", err);
    showError(err.message || "Failed to fetch weather data. Please try again.");
  } finally {
    hideLoading();
  }
}

async function fetchWeatherByCoordinates(lat, lon) {
  showLoading();
  hideError();

  try {
    const weatherUrl = `${BACKEND_API}/weather?lat=${lat}&lon=${lon}`;
    const forecastUrl = `${BACKEND_API}/forecast?lat=${lat}&lon=${lon}`;

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
    ]);

    const weatherData = await weatherRes.json().catch(() => null);
    const forecastData = await forecastRes.json().catch(() => null);

    if (!weatherRes.ok) {
      const apiMsg = (weatherData && weatherData.message) || "";
      throw new Error(
        `Weather API error for your location: ${apiMsg || "Failed to fetch current weather."}`
      );
    }

    if (!forecastRes.ok) {
      const apiMsg = (forecastData && forecastData.message) || "";
      throw new Error(
        `Forecast API error for your location: ${apiMsg || "Failed to fetch forecast."}`
      );
    }

    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    updateMLCardSafe(weatherData);

  } catch (err) {
    console.error("fetchWeatherByCoordinates error:", err);
    showError(err.message || "Failed to fetch weather data. Please try again.");
  } finally {
    hideLoading();
  }
}

// =======================
//  DISPLAY FUNCTIONS
// =======================

function displayCurrentWeather(data) {
  if (!data || !data.main || !data.weather || !data.weather[0]) {
    showError("Unexpected weather data format.");
    return;
  }

  const now = new Date();

  cityNameEl.textContent = `${data.name || "Unknown"}, ${data.sys?.country || ""}`;
  currentDateEl.textContent = formatDate(now);

  const iconCode = data.weather[0].icon;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  weatherIconEl.alt = data.weather[0].description || "Weather icon";

  temperatureEl.textContent = Math.round(data.main.temp);
  weatherDescriptionEl.textContent = data.weather[0].description || "";

  feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windSpeedEl.textContent = `${data.wind?.speed ?? 0} m/s`;
  pressureEl.textContent = `${data.main.pressure} hPa`;

  currentWeather.classList.add("show");
}

function displayForecast(data) {
  forecastContainer.innerHTML = "";

  if (!data || !Array.isArray(data.list)) {
    return;
  }

  const daily = data.list
    .filter((item) => item.dt_txt && item.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  daily.forEach((forecast) => {
    const card = createForecastCard(forecast);
    forecastContainer.appendChild(card);
  });
}

function createForecastCard(forecast) {
  const card = document.createElement("div");
  card.className = "forecast-card";
  card.setAttribute("data-testid", "forecast-card");

  const date = new Date(forecast.dt * 1000);
  const iconCode = forecast.weather[0].icon;

  card.innerHTML = `
    <div class="forecast-date" data-testid="forecast-date">${formatForecastDate(
      date
    )}</div>
    <img
      src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
      alt="${forecast.weather[0].description}"
      class="forecast-icon"
      data-testid="forecast-icon"
    >
    <div class="forecast-temp" data-testid="forecast-temp">
      ${Math.round(forecast.main.temp)}°C
    </div>
    <div class="forecast-description" data-testid="forecast-description">
      ${forecast.weather[0].description}
    </div>
    <div class="forecast-details">
      <div class="forecast-detail">
        <i class="fas fa-droplet"></i>
        <span data-testid="forecast-humidity">${forecast.main.humidity}%</span>
      </div>
      <div class="forecast-detail">
        <i class="fas fa-wind"></i>
        <span data-testid="forecast-wind">${forecast.wind.speed} m/s</span>
      </div>
    </div>
  `;

  return card;
}

// =======================
//  ML CARD (SAFE WRAPPER)
// =======================

function updateMLCardSafe(currentData) {
  if (!mlCard || !currentData || !currentData.main) return;

  (async () => {
    try {
      const payload = {
        temp_mean: currentData.main.temp,
        temp_max: currentData.main.temp_max,
        temp_min: currentData.main.temp_min,
        wind_speed: currentData.wind?.speed ?? 0,
      };

      const resp = await fetch(`${BACKEND_API}/ml/rain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error("ML API error");
      }

      const ml = await resp.json();
      const prob = ml.probability != null ? Math.round(ml.probability * 100) : null;

      mlCard.textContent =
        ml.will_rain_tomorrow === 1
          ? `ML prediction: High chance of rain tomorrow (${prob ?? "?"}%).`
          : `ML prediction: Low chance of rain tomorrow (${prob ?? "?"}%).`;
    } catch (e) {
      console.warn("ML prediction unavailable:", e.message);
      mlCard.textContent =
        "ML prediction: currently unavailable, but live weather forecast is shown above.";
    }
  })();
}

// =======================
//  UTILITIES
// =======================

function formatDate(date) {
  const opts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", opts);
}

function formatForecastDate(date) {
  const opts = { weekday: "short", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", opts);
}

function showLoading() {
  if (loadingSpinner) loadingSpinner.classList.add("show");
  if (currentWeather) currentWeather.classList.remove("show");
  if (forecastContainer) forecastContainer.innerHTML = "";
}

function hideLoading() {
  if (loadingSpinner) loadingSpinner.classList.remove("show");
}

function showError(message) {
  if (!errorMessage) return;
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
  setTimeout(hideError, 5000);
}

function hideError() {
  if (!errorMessage) return;
  errorMessage.classList.remove("show");
}
