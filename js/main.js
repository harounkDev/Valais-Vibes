const apiKey = '53018b097dc32b4f8e6ef76ee69d6b80';

function getWeather(cityName) {
  const city = cityName || document.getElementById('city').value.trim();

  if (!city) {
    alert('Please enter a city.');
    return;
  }

  const highlights = document.querySelector('.today-highlights');
  highlights.classList.add('show');

  // 1. CURRENT WEATHER
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    })
    .then(data => {
      document.getElementById('temp').innerHTML = `${Math.round(data.main.temp)}°C`;
      document.getElementById('desc').innerHTML = data.weather[0].description;
      document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      // Today's highlights
      document.getElementById('feels-like').innerHTML = `${Math.round(data.main.feels_like)}°C`;
      document.getElementById('humidity').innerHTML = `${data.main.humidity}%`;
      document.getElementById('wind').innerHTML = `${Math.round(data.wind.speed)} m/s`;

      document.querySelector('.today-highlights').style.display = 'block';
      setBackground(data.weather[0].main);
      setQuote();
    })
    .catch(() => {
      alert('City not found, please try again.');
    });

  // 2. 3-DAY FORECAST
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(forecastData => {
      const forecastContainer = document.getElementById('forecast-container');
      forecastContainer.innerHTML = '';

      const dailyForecasts = forecastData.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 3);
      if (!dailyForecasts.length) {
        forecastContainer.innerHTML = "<p>No forecast data available.</p>";
        return;
      }

      dailyForecasts.forEach(day => {
        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        forecastContainer.innerHTML += `
          <div class="forecast-day">
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="">
            <p><strong>${Math.round(day.main.temp)}°C</strong> / feels like ${Math.round(day.main.feels_like)}°C</p>
            <small>${day.weather[0].main}</small><br>
            <small>💧 ${day.main.humidity}%</small><br>
            <small>🌬️ ${Math.round(day.wind.speed)} m/s</small>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching forecast data.');
    });
}

// Set background image based on weather
function setBackground(weather) {
  const backgrounds = {
    clear: '../images/clear.jpg',
    clouds: '../images/clouds.jpg',
    rain: '../images/rain.jpg',
    snow: '../images/snow.jpg',
    default: '../images/default.jpg'
  };
  document.body.style.backgroundImage = `url(${backgrounds[weather.toLowerCase()] || backgrounds.default})`;
}

// Set random quote
function setQuote() {
  const quotes = [
    "Every mountain top is within reach if you just keep climbing.",
    "Nature is not a place to visit. It is home.",
    "In every walk with nature, one receives far more than he seeks.",
    "Adventure awaits around every corner."
  ];
  document.getElementById('quote').innerHTML = quotes[Math.floor(Math.random() * quotes.length)];
}

// Autocomplete feature
function autocompleteCity() {
  const input = document.getElementById('city').value;
  const suggestionsList = document.getElementById('suggestions');

  if (input.length < 2) {
    suggestionsList.innerHTML = '';
    return;
  }

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
          getWeather(place.name);  // 👈 Now trigger getWeather() only after value is set
        };
        suggestionsList.appendChild(li);
      });
    });
}

// Detect user's location
function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          document.getElementById('city').value = data.name;
          getWeather(data.name);  // Use detected city
        });
    }, () => {
      alert('Location access denied.');
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}
