const apiKey = "e17064111585707881ec513c6bbbb462";

async function getWeatherData(city) {
    if(!city) return;
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const data = await res.json();
        
        if(data.cod === "404") return alert("City not found!");

        // 1. Precise Local Time Logic
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const cityLocalTime = new Date(utcTime + (1000 * data.timezone));
        
        document.getElementById("local-time").innerText = cityLocalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById("local-date").innerText = cityLocalTime.toLocaleDateString([], {weekday: 'long', month: 'short', day: 'numeric'});

        // 2. Weather UI Update
        document.getElementById("city-name").innerText = data.name;
        document.getElementById("temp-main").innerText = Math.round(data.main.temp) + "°C";
        document.getElementById("condition-desc").innerText = data.weather[0].description;
        document.getElementById("humidity").innerText = data.main.humidity + "%";
        document.getElementById("wind").innerText = data.wind.speed + " km/h";

        // 3. Environment Toggle (Sun/Moon)
        const icon = data.weather[0].icon;
        const isNight = icon.includes("n");
        updateMode(isNight);

        // 4. Forecast Fetch
        const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        const fData = await fRes.json();
        updateForecast(fData);

        document.getElementById("weather-display").classList.remove("hidden");
    } catch (e) { console.error(e); }
}

function updateMode(isNight) {
    document.getElementById("sun").style.display = isNight ? "none" : "block";
    document.getElementById("moon").style.display = isNight ? "block" : "none";
    document.getElementById("mode-badge").innerText = isNight ? "🌙 Night Mode" : "☀️ Day Mode";
    document.body.style.background = isNight ? "linear-gradient(135deg, #35549c, #f178d4)" : "linear-gradient(135deg, #edde58, #f178d4, #93c5fd)";
}8

function updateForecast(data) {
    const grid = document.getElementById("forecast-grid");
    grid.innerHTML = "";
    data.list.filter(f => f.dt_txt.includes("12:00:00")).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        grid.innerHTML += `
            <div class="f-card">
                <p><b>${date}</b></p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${Math.round(day.main.temp)}°C</p>
            </div>`;
    });
}

document.getElementById("search-btn").addEventListener("click", () => getWeatherData(document.getElementById("city-input").value));