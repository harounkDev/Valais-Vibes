// Replace with your actual API key
const apiKey = '53018b097dc32b4f8e6ef76ee69d6b80';

function getWeather() {
  const city = document.getElementById('city').value;

  // 1) Fetch CURRENT weather
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      // Update current weather info
      document.getElementById('temp').innerHTML = `${Math.round(data.main.temp)}°C`;
      document.getElementById('desc').innerHTML = data.weather[0].description;
      document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      // Change background & quote
      setBackground(data.weather[0].main);
      setQuote();
    })
    .catch(() => {
      alert('City not found, please try again.');
    });

  // 2) Fetch FORECAST (next 3 segments)
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(forecastData => {
      console.log("Forecast Data:", forecastData); // Debug: view in browser console

      const forecastContainer = document.getElementById('forecast-container');
      forecastContainer.innerHTML = ''; // Clear previous results

      // Show first 3 segments from the 5-day forecast
      const dailyForecasts = forecastData.list.slice(0, 3);

      // Fallback if no data
      if (!dailyForecasts.length) {
        forecastContainer.innerHTML = "<p>No forecast data available.</p>";
        return;
      }

      // Render each forecast segment
      dailyForecasts.forEach(day => {
        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        forecastContainer.innerHTML += `
          <div class="forecast-day">
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="">
            <p>${Math.round(day.main.temp)}°C</p>
            <small>${day.weather[0].main}</small>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching forecast data.');
    });
}

function setBackground(weather) {
  // Map weather conditions to local images
  const backgrounds = {
    clear: '../images/clear.jpg',
    clouds: '../images/clouds.jpg',
    rain: '../images/rain.jpg',
    snow: '../images/snow.jpg',
    default: '../images/default.jpg'
  };

  // Lowercase the weather condition, then pick or default
  document.body.style.backgroundImage = `url(${
    backgrounds[weather.toLowerCase()] || backgrounds.default
  })`;
}

function setQuote() {
  // Randomly choose a quote
  const quotes = [
    "Every mountain top is within reach if you just keep climbing.",
    "Nature is not a place to visit. It is home.",
    "In every walk with nature, one receives far more than he seeks.",
    "Adventure awaits around every corner."
  ];
  document.getElementById('quote').innerHTML =
    quotes[Math.floor(Math.random() * quotes.length)];
}

function autocompleteCity() {
  const input = document.getElementById('city').value;
  const suggestionsList = document.getElementById('suggestions');

  // Don't search until user types at least 2 chars
  if (input.length < 2) {
    suggestionsList.innerHTML = '';
    return;
  }

  // Fetch city suggestions from OpenWeatherMap Geocoding
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      suggestionsList.innerHTML = '';
      data.forEach(place => {
        const li = document.createElement('li');
        li.textContent = `${place.name}, ${place.country}`;
        li.onclick = () => {
          document.getElementById('city').value = place.name;
          suggestionsList.innerHTML = '';
        };
        suggestionsList.appendChild(li);
      });
    });
}
