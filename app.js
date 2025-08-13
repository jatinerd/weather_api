import express from "express";
import https from "https";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use(express.static(__dirname));

const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

// console.log("PORT:", port);
// console.log("API_KEY:", apiKey);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/index.html");
  console.log("GET request received for /");
});

app.post("/", (req, res) => {
  const unit = "metric";
  const city = req.body.cityName;

  const url = `https://api.openweathermap.org/data/2.5/weather?units=${unit}&q=${city}&appid=${apiKey}`;

  if (!apiKey) {
    console.error("API_KEY is missing!");
    return res.status(500).send("API key not configured.");
  }

  // console.log("REQUEST URL:", url);

  https.get(url, (response) => {
    console.log("STATUS CODE:", response.statusCode);

    response.on("data", (data) => {
      const weatherData = JSON.parse(data);

      if (weatherData.cod !== 200) {
        console.error("Error fetching weather data:", weatherData.message);
        return res.status(500).send("Error fetching weather data.");
      }

      const weatherDescription = weatherData.weather[0].description;
      const temperature = weatherData.main.temp;
      const icon = weatherData.weather[0].icon;
      const imageURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      res.write(`<h1>Current weather in ${city}:  ${weatherDescription}</h1>`);
      res.write(`<h1>\nTemperature:  ${temperature}°C\n</h1>`);
      res.write(`<img src="${imageURL}">`);
      res.sendFile(__dirname + "/showdata.html");
      console.log("Weather data sent to the client.");
    });
    response.on("end", () => {});
  });
});
