
const apiKey = '53018b097dc32b4f8e6ef76ee69d6b80';

function getWeather() {
  const city = document.getElementById('city').value;

  const highlights = document.querySelector('.today-highlights');
highlights.classList.add('show');


  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    
    .then(data => {
        document.getElementById('temp').innerHTML = `${Math.round(data.main.temp)}°C`;
        document.getElementById('desc').innerHTML = data.weather[0].description;
        document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      
        // Populate Today’s Highlights
        document.getElementById('feels-like').innerHTML = `${Math.round(data.main.feels_like)}°C`;
        document.getElementById('humidity').innerHTML = `${data.main.humidity}%`;
        document.getElementById('wind').innerHTML = `${Math.round(data.wind.speed)} m/s`;
      
        // Make highlights section visible
        document.querySelector('.today-highlights').style.display = 'block';
      
        setBackground(data.weather[0].main);
        setQuote();
      })
      
      
    .catch(() => {
      alert('City not found, please try again.');
    });

  
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(forecastData => {
      console.log("Forecast Data:", forecastData); 

      const forecastContainer = document.getElementById('forecast-container');
      forecastContainer.innerHTML = ''; 

      // Show first 3 segments from the 5-day forecast
      const dailyForecasts = forecastData.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 3);


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
      <p><strong>${Math.round(day.main.temp)}°C</strong> / feels like ${Math.round(day.main.feels_like)}°C</p>
      <small>${day.weather[0].main}</small>
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
function detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
  
          // Fetch weather based on coordinates
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
              document.getElementById('city').value = data.name; // Auto-fill city input
              document.getElementById('temp').innerHTML = `${Math.round(data.main.temp)}°C`;
              document.getElementById('desc').innerHTML = data.weather[0].description;
              document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
              setBackground(data.weather[0].main);
              setQuote();
            });
  
          // Optional: Also fetch forecast for detected city
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(forecastData => {
              const forecastContainer = document.getElementById('forecast-container');
              forecastContainer.innerHTML = '';
              const dailyForecasts = forecastData.list.slice(0, 3);
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
            });
        },
        () => {
          alert('Location access denied.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }
  