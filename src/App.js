import "./styles.css";
import React from "react";
export default function App() {
  const [city, setCity] = React.useState("");
  const [weatherData, setWeatherData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const API_KEY = "f999e999e9cc48400c2d82f330486681"; // Replace with your OpenWeatherMap API key
  const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  const fetchWeather = async () => {
    if (!city) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.cod === "200") {
        setWeatherData(data);
        updateBackground(data.list[0].weather[0].main); // Update background based on weather
      } else {
        setError(data.message || "City not found.");
      }
    } catch (err) {
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const updateBackground = (weatherCondition) => {
    const body = document.body;
    body.className = ""; // Reset classes
    body.classList.add(weatherCondition.toLowerCase()); // Add weather-specific class

    // Add weather-specific effects
    const particles = document.getElementById("particles-js");
    if (weatherCondition === "Snow") {
      particles.style.background = "linear-gradient(135deg, #e0ffff, #f0f8ff)";
    } else if (weatherCondition === "Rain") {
      particles.style.background = "linear-gradient(135deg, #4682b4, #6a5acd)";
    } else if (weatherCondition === "Thunderstorm") {
      particles.style.background = "linear-gradient(135deg, #483d8b, #000080)";
    } else {
      particles.style.background = "transparent";
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          setError("Unable to retrieve your location.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeatherData({ city: data, list: [data] });
        updateBackground(data.weather[0].main); // Update background based on weather
      } else {
        setError(data.message || "Unable to fetch weather data.");
      }
    } catch (err) {
      setError("An error occurred while fetching weather data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-app">
      <h1>Weather App</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Search</button>
        <button onClick={getLocation}>Use My Location</button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          Loading...
        </div>
      )}
      {error && <div className="error">{error}</div>}

      {weatherData && (
        <div className="weather-info">
          <h2>
            {weatherData.city.name}, {weatherData.city.country}
          </h2>
          <img
            src={`http://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}@2x.png`}
            alt={weatherData.list[0].weather[0].description}
          />
          <p>{weatherData.list[0].weather[0].description}</p>
          <p>Temperature: {weatherData.list[0].main.temp}°C</p>
          <p>Humidity: {weatherData.list[0].main.humidity}%</p>
          <p>Wind Speed: {weatherData.list[0].wind.speed} m/s</p>

          <h3>5-Day Forecast</h3>
          <div className="forecast">
            {weatherData.list
              .filter((item, index) => index % 8 === 0)
              .map((item, index) => (
                <div key={index} className="forecast-item">
                  <p>{new Date(item.dt * 1000).toLocaleDateString()}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt={item.weather[0].description}
                  />
                  <p>{item.weather[0].description}</p>
                  <p>Temp: {item.main.temp}°C</p>
                  <p>Humidity: {item.main.humidity}%</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
