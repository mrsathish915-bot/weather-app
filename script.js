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


// Search weather when button is clicked

searchBtn.addEventListener("click", getWeather);
locationBtn.addEventListener("click", getLocationWeather);

// Also search when Enter is pressed

cityInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});


// Main weather function

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        errorMessage.textContent = "Please enter a city name.";
        return;
    }


    errorMessage.textContent = "Loading weather...";


    try {

        // Find the city's coordinates

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }

        const geoData = await geoResponse.json();


        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found.");
        }


        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;


        // Get weather data

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );


        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather data.");
        }


        const weatherData = await weatherResponse.json();

        const current = weatherData.current;


        // Display city

        cityName.textContent =
            `${location.name}, ${location.country}`;


        // Display temperature

        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;


        // Display humidity

        humidity.textContent =
            `${current.relative_humidity_2m}%`;


        // Display wind speed

        windSpeed.textContent =
            `${current.wind_speed_10m} km/h`;


        // Display weather condition

        const weatherInfo =
            getWeatherInfo(current.weather_code);

        weatherIcon.textContent =
            weatherInfo.icon;

        weatherDescription.textContent =
            weatherInfo.description;


        errorMessage.textContent = "";

    }

    catch (error) {

        console.error(error);

        errorMessage.textContent =
            "City not found. Please try another city.";

    }

}


// Convert weather code into description and icon

function getWeatherInfo(code) {

    if (code === 0) {
        return {
            description: "Clear sky",
            icon: "☀️"
        };
    }

    if (code === 1 || code === 2) {
        return {
            description: "Partly cloudy",
            icon: "⛅"
        };
    }

    if (code === 3) {
        return {
            description: "Overcast",
            icon: "☁️"
        };
    }

    if (code >= 45 && code <= 48) {
        return {
            description: "Foggy",
            icon: "🌫️"
        };
    }

    if (code >= 51 && code <= 67) {
        return {
            description: "Rain",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            description: "Snow",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            description: "Rain showers",
            icon: "🌦️"
        };
    }

    if (code >= 95 && code <= 99) {
        return {
            description: "Thunderstorm",
            icon: "⛈️"
        };
    }


    return {
        description: "Unknown weather",
        icon: "🌤️"
    };

}
// Get weather using current location

function getLocationWeather() {

    if (!navigator.geolocation) {
        errorMessage.textContent =
            "Geolocation is not supported by your browser.";
        return;
    }

    errorMessage.textContent =
        "Getting your location...";

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {

                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
                );

                const data = await response.json();

                const current = data.current;

                cityName.textContent = "📍 Your Location";

                temperature.textContent =
                    `${Math.round(current.temperature_2m)}°C`;

                humidity.textContent =
                    `${current.relative_humidity_2m}%`;

                windSpeed.textContent =
                    `${current.wind_speed_10m} km/h`;

                const weatherInfo =
                    getWeatherInfo(current.weather_code);

                weatherIcon.textContent =
                    weatherInfo.icon;

                weatherDescription.textContent =
                    weatherInfo.description;

                errorMessage.textContent = "";

            } catch (error) {

                errorMessage.textContent =
                    "Unable to get weather data.";

            }

        },

        function() {

            errorMessage.textContent =
                "Please allow location access to use this feature.";

        }

    );

}
