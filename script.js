// Select DOM elements
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container');

// API key for weather data
const apiKey = '7fd918d15d389dd328f8b20d071bad6c'; 

// Event listener for the search button
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value); // Update weather info for the input city
        cityInput.value = ''; // Clear the input field
        cityInput.blur(); // Remove focus from input field
    }
});

// Event listener for pressing 'Enter' in the city input field
cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value); // Update weather info for the input city
        cityInput.value = ''; // Clear the input field
        cityInput.blur(); // Remove focus from input field
    }
});

// Function to fetch data from the OpenWeatherMap API
async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

// Function to get the appropriate weather icon based on weather condition ID
function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id <= 800) return 'clear.svg';
    else return 'clouds.svg';
}

// Function to get the current date formatted as "Wed, 07 Aug"
function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('en-GB', options);
}

// Function to update the weather information section
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);
    
    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection); // Show the "not found" section if city is not found
        return;
    }
    
    // Destructure relevant data from the response
    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    // Update UI elements with the fetched data
    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + ' °C';
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + '%';
    windValueTxt.textContent = speed + ' M/s';
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city); // Fetch and display the 5-day forecast
    showDisplaySection(weatherInfoSection); // Show the weather info section
}

// Function to update the 5-day weather forecast section
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);

    const todayDate = new Date().toISOString().split('T')[0]; // Today's date
    const forecastItems = {}; // Object to store forecast items by date

    forecastsData.list.forEach(forecastWeather => {
        const forecastDate = forecastWeather.dt_txt.split(' ')[0]; // Extract date from the timestamp

        if (forecastDate > todayDate && !forecastItems[forecastDate]) {
            forecastItems[forecastDate] = forecastWeather; // Store the first forecast for the date
        }
    });

    forecastItemsContainer.innerHTML = ''; // Clear previous forecast items

    // Iterate over the collected forecast items and update the UI
    Object.keys(forecastItems).forEach(date => {
        updateForecastItems(forecastItems[date]);
    });
}

// Function to create and add forecast items to the UI
function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short'
    };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    // Create HTML for each forecast item
    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    // Insert the new forecast item into the container
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Function to show a specific display section and hide others
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none'); // Hide all sections

    section.style.display = 'flex'; // Show the selected section
}
