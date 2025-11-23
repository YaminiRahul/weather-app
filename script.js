// API Configuration
const API_KEY = '9dc298a363b8d9e3872afa77f5632f40';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
// Multiple CORS proxies - try in order
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
];

// Determine API endpoint
const BACKEND_API = (() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return '/api'; // Local backend
    } else {
        return 'https://weather-app-wg7l.onrender.com/api'; // Render backend
    }
})();

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const currentWeather = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
locationBtn.addEventListener('click', handleGeolocation);

// Handle Search
function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    fetchWeatherByCity(city);
}

// Handle Geolocation
function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoordinates(latitude, longitude);
        },
        (error) => {
            hideLoading();
            showError('Unable to retrieve your location. Please check your permissions.');
        }
    );
}

// Helper function to fetch with multiple CORS proxy fallbacks
async function fetchWithCORSFallback(url) {
    // For allorigins, wrap the URL
    const alloriginsUrl = CORS_PROXIES[0] + encodeURIComponent(url);
    const corsanywhereUrl = CORS_PROXIES[1] + url;
    const thingproxyUrl = CORS_PROXIES[2] + url;
    
    const urls = [alloriginsUrl, corsanywhereUrl, thingproxyUrl];
    
    for (let proxyUrl of urls) {
        try {
            console.log('Trying CORS proxy:', proxyUrl);
            const response = await Promise.race([
                fetch(proxyUrl),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            if (response.ok) {
                return response;
            }
        } catch (e) {
            console.log('CORS proxy failed, trying next:', e.message);
            continue;
        }
    }
    throw new Error('All CORS proxies failed');
}

// Fetch Weather by City
async function fetchWeatherByCity(city) {
    showLoading();
    hideError();

    try {
        console.log('Fetching weather for:', city);
        
        // Try backend first, then fall back to CORS proxy
        let currentData, forecastData;
        
        try {
            // Attempt 1: Use backend API
            const weatherUrl = `${BACKEND_API}/weather?city=${encodeURIComponent(city)}`;
            const forecastUrl = `${BACKEND_API}/forecast?city=${encodeURIComponent(city)}`;
            
            const weatherResponse = await Promise.race([
                fetch(weatherUrl),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
            ]);
            
            if (!weatherResponse.ok) {
                throw new Error('Backend error');
            }

            currentData = await weatherResponse.json();
            console.log('Current weather data:', currentData);

            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error('Forecast error');
            }
            forecastData = await forecastResponse.json();
            console.log('Forecast data:', forecastData);
        } catch (backendError) {
            // Fallback to CORS proxy
            console.log('Backend failed, using CORS proxy:', backendError.message);
            const weatherUrl = `${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
            const forecastUrl = `${API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
            
            const weatherResponse = await fetchWithCORSFallback(weatherUrl);
            if (!weatherResponse.ok) {
                if (weatherResponse.status === 404) {
                    throw new Error('City not found. Please check the spelling and try again.');
                }
                throw new Error(`Failed to fetch weather data. Status: ${weatherResponse.status}`);
            }
            currentData = await weatherResponse.json();

            const forecastResponse = await fetchWithCORSFallback(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data.');
            }
            forecastData = await forecastResponse.json();
        }

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        hideLoading();
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    }
}

// Fetch Weather by Coordinates
async function fetchWeatherByCoordinates(lat, lon) {
    showLoading();
    hideError();
    
    try {
        console.log('Fetching weather for coordinates:', lat, lon);
        
        let currentData, forecastData;
        
        try {
            // Attempt 1: Use backend API
            const weatherUrl = `${BACKEND_API}/weather?lat=${lat}&lon=${lon}`;
            const forecastUrl = `${BACKEND_API}/forecast?lat=${lat}&lon=${lon}`;
            
            const weatherResponse = await Promise.race([
                fetch(weatherUrl),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
            ]);

            if (!weatherResponse.ok) {
                throw new Error('Backend error');
            }

            currentData = await weatherResponse.json();

            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error('Forecast error');
            }
            forecastData = await forecastResponse.json();
        } catch (backendError) {
            // Fallback to CORS proxy
            console.log('Backend failed, using CORS proxy:', backendError.message);
            const weatherUrl = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            const forecastUrl = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            
            const weatherResponse = await fetchWithCORSFallback(weatherUrl);
            if (!weatherResponse.ok) {
                throw new Error('Failed to fetch weather data for your location.');
            }
            currentData = await weatherResponse.json();

            const forecastResponse = await fetchWithCORSFallback(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data.');
            }
            forecastData = await forecastResponse.json();
        }

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        hideLoading();
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showError(error.message || 'Failed to fetch weather data.');
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    const cityName = document.getElementById('cityName');
    const currentDate = document.getElementById('currentDate');
    const weatherIcon = document.getElementById('weatherIcon');
    const temperature = document.getElementById('temperature');
    const weatherDescription = document.getElementById('weatherDescription');
    const feelsLike = document.getElementById('feelsLike');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const pressure = document.getElementById('pressure');

    // Update city name and date
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = formatDate(new Date());

    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Update temperature and description
    temperature.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;

    // Update weather details
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Show the current weather card
    currentWeather.classList.add('show');
}

// Display 5-Day Forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';

    // Get one forecast per day (at 12:00 PM)
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);

    dailyForecasts.forEach(forecast => {
        const forecastCard = createForecastCard(forecast);
        forecastContainer.appendChild(forecastCard);
    });
}

// Create Forecast Card
function createForecastCard(forecast) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.setAttribute('data-testid', 'forecast-card');

    const date = new Date(forecast.dt * 1000);
    const iconCode = forecast.weather[0].icon;

    card.innerHTML = `
        <div class="forecast-date" data-testid="forecast-date">${formatForecastDate(date)}</div>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
             alt="${forecast.weather[0].description}" 
             class="forecast-icon"
             data-testid="forecast-icon">
        <div class="forecast-temp" data-testid="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
        <div class="forecast-description" data-testid="forecast-description">${forecast.weather[0].description}</div>
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

// Utility Functions
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatForecastDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showLoading() {
    loadingSpinner.classList.add('show');
    currentWeather.classList.remove('show');
    forecastContainer.innerHTML = '';
}

function hideLoading() {
    loadingSpinner.classList.remove('show');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.classList.remove('show');
}

// Load default city on page load (optional)
window.addEventListener('load', () => {
    // You can uncomment the line below to load a default city
    // fetchWeatherByCity('London');
});
