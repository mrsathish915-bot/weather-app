const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const forecastContainer = document.getElementById("forecastContainer");
const errorMessage = document.getElementById("errorMessage");


// ===============================
// Weather Code Information
// ===============================

function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            description: "Clear sky",
            icon: "☀️"
        },

        1: {
            description: "Mainly clear",
            icon: "🌤️"
        },

        2: {
            description: "Partly cloudy",
            icon: "⛅"
        },

        3: {
            description: "Overcast",
            icon: "☁️"
        },

        45: {
            description: "Fog",
            icon: "🌫️"
        },

        48: {
            description: "Fog",
            icon: "🌫️"
        },

        51: {
            description: "Light drizzle",
            icon: "🌦️"
        },

        53: {
            description: "Drizzle",
            icon: "🌦️"
        },

        55: {
            description: "Heavy drizzle",
            icon: "🌧️"
        },

        61: {
            description: "Light rain",
            icon: "🌦️"
        },

        63: {
            description: "Rain",
            icon: "🌧️"
        },

        65: {
            description: "Heavy rain",
            icon: "🌧️"
        },

        71: {
            description: "Light snow",
            icon: "🌨️"
        },

        73: {
            description: "Snow",
            icon: "❄️"
        },

        75: {
            description: "Heavy snow",
            icon: "❄️"
        },

        80: {
            description: "Rain showers",
            icon: "🌦️"
        },

        81: {
            description: "Rain showers",
            icon: "🌧️"
        },

        82: {
            description: "Heavy rain showers",
            icon: "⛈️"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            description: "Thunderstorm with hail",
            icon: "⛈️"
        },

        99: {
            description: "Heavy thunderstorm",
            icon: "⛈️"
        }
    };

    return weatherCodes[code] || {
        description: "Unknown",
        icon: "🌤️"
    };
}


// ===============================
// Get City Coordinates
// ===============================

async function getCityCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to find city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city.");
    }

    return data.results[0];
}


// ===============================
// Get Weather
// ===============================

async function getWeather(latitude, longitude, locationName) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&forecast_days=5` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to get weather data.");
    }

    const data = await response.json();

    displayCurrentWeather(data, locationName);

    displayForecast(data);
}


// ===============================
// Current Weather
// ===============================

function displayCurrentWeather(data, locationName) {

    const current = data.current;

    const weatherInfo =
        getWeatherInfo(current.weather_code);

    cityName.textContent = locationName;

    weatherIcon.textContent =
        weatherInfo.icon;

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    weatherDescription.textContent =
        weatherInfo.description;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;
}


// ===============================
// 5-Day Forecast
// ===============================

function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const daily = data.daily;

    for (let i = 0; i < 5; i++) {

        const weatherInfo =
            getWeatherInfo(daily.weather_code[i]);

        const date =
            new Date(daily.time[i] + "T00:00:00");

        const formattedDate =
            date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
            });

        const maxTemperature =
            Math.round(daily.temperature_2m_max[i]);

        const minTemperature =
            Math.round(daily.temperature_2m_min[i]);

        const rainChance =
            daily.precipitation_probability_max[i];


        const forecastCard =
            document.createElement("div");

        forecastCard.className =
            "forecast-card";


        forecastCard.innerHTML = `

            <div class="forecast-date">
                ${formattedDate}
            </div>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-temperature">
                ${maxTemperature}°C / ${minTemperature}°C
            </div>

            <div class="forecast-description">
                ${weatherInfo.description}
            </div>

            <div class="forecast-description">
                💧 ${rainChance}% rain
            </div>

        `;


        forecastContainer.appendChild(forecastCard);
    }
}


// ===============================
// Search City
// ===============================

searchBtn.addEventListener("click", async function () {

    const city =
        cityInput.value.trim();

    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }

    errorMessage.textContent = "";

    searchBtn.textContent =
        "Searching...";

    searchBtn.disabled = true;


    try {

        const location =
            await getCityCoordinates(city);

        await getWeather(
            location.latitude,
            location.longitude,
            location.name
        );

    }

    catch (error) {

        errorMessage.textContent =
            error.message;

        forecastContainer.innerHTML = "";
    }

    finally {

        searchBtn.textContent =
            "Search";

        searchBtn.disabled = false;
    }

});


// ===============================
// Press Enter to Search
// ===============================

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        searchBtn.click();
    }

});


// ===============================
// Use My Location
// ===============================

locationBtn.addEventListener("click", function () {

    if (!navigator.geolocation) {

        errorMessage.textContent =
            "Geolocation is not supported by your browser.";

        return;
    }

    errorMessage.textContent = "";

    locationBtn.textContent =
        "📍 Getting Location...";

    locationBtn.disabled = true;


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                await getWeather(
                    latitude,
                    longitude,
                    "My Location"
                );

            }

            catch (error) {

                errorMessage.textContent =
                    error.message;

            }

            finally {

                locationBtn.textContent =
                    "📍 Use My Location";

                locationBtn.disabled = false;
            }

        },

        function () {

            errorMessage.textContent =
                "Location permission was denied. Please search for a city.";

            locationBtn.textContent =
                "📍 Use My Location";

            locationBtn.disabled = false;
        }

    );

});


// ===============================
// Default Weather
// ===============================

async function loadDefaultWeather() {

    try {

        const location =
            await getCityCoordinates("Bangalore");

        await getWeather(
            location.latitude,
            location.longitude,
            location.name
        );

    }

    catch (error) {

        errorMessage.textContent =
            "Unable to load default weather.";
    }
}


// Start App

loadDefaultWeather();
