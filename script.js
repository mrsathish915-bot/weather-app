// Get HTML elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const errorMessage = document.getElementById("errorMessage");


// Weather code information
function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            description: "Clear Sky",
            icon: "☀️"
        },

        1: {
            description: "Mainly Clear",
            icon: "🌤️"
        },

        2: {
            description: "Partly Cloudy",
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
            description: "Light Drizzle",
            icon: "🌦️"
        },

        53: {
            description: "Drizzle",
            icon: "🌦️"
        },

        55: {
            description: "Heavy Drizzle",
            icon: "🌧️"
        },

        61: {
            description: "Light Rain",
            icon: "🌦️"
        },

        63: {
            description: "Rain",
            icon: "🌧️"
        },

        65: {
            description: "Heavy Rain",
            icon: "🌧️"
        },

        71: {
            description: "Light Snow",
            icon: "🌨️"
        },

        73: {
            description: "Snow",
            icon: "❄️"
        },

        75: {
            description: "Heavy Snow",
            icon: "❄️"
        },

        80: {
            description: "Rain Showers",
            icon: "🌦️"
        },

        81: {
            description: "Rain Showers",
            icon: "🌧️"
        },

        82: {
            description: "Heavy Rain Showers",
            icon: "⛈️"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            description: "Thunderstorm with Hail",
            icon: "⛈️"
        },

        99: {
            description: "Heavy Thunderstorm",
            icon: "⛈️"
        }
    };

    return weatherCodes[code] || {
        description: "Unknown Weather",
        icon: "🌤️"
    };
}


// Find city coordinates
async function findCity(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to find the city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city name.");
    }

    return data.results[0];
}


// Get current weather
async function getWeather(latitude, longitude, name) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to get weather data.");
    }

    const data = await response.json();

    const current = data.current;

    const weatherInfo =
        getWeatherInfo(current.weather_code);


    // Update weather card
    cityName.textContent = name;

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


// Search city
async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }

    errorMessage.textContent = "";

    searchBtn.textContent = "Searching...";
    searchBtn.disabled = true;

    try {

        const location = await findCity(city);

        await getWeather(
            location.latitude,
            location.longitude,
            location.name
        );

    } catch (error) {

        errorMessage.textContent =
            error.message;

    } finally {

        searchBtn.textContent = "Search";
        searchBtn.disabled = false;
    }
}


// Search button click
searchBtn.addEventListener("click", searchCity);


// Press Enter to search
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchCity();
    }

});


// Use My Location
locationBtn.addEventListener("click", function() {

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

        async function(position) {

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

            } catch (error) {

                errorMessage.textContent =
                    error.message;
            }


            locationBtn.textContent =
                "📍 Use My Location";

            locationBtn.disabled = false;

        },


        function() {

            errorMessage.textContent =
                "Unable to get your location. Please allow location permission.";

            locationBtn.textContent =
                "📍 Use My Location";

            locationBtn.disabled = false;
        }

    );

});
