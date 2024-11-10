import express from "express";
import axios from "axios";
import bodyparser from "body-parser";
import dotenv from "dotenv";
import {addDays, format} from 'date-fns';

dotenv.config();
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true}));

app.get("/", (req,res) => {
  res.render("index.ejs", {
    message: null
  });
});

app.post("/",async(req,res) => {
  console.log(req.body);

  try {
    let city = req.body.city;
    const apiKey = process.env.API_KEY;

    console.log(city);

    // const response1 = await axios.get(`http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},LK&appid=${apiKey}`);
    const response1 = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city},LK&appid=${apiKey}`);
    const result = response1.data;
    console.log(result);
    // let city = result.name;
    let lat = result[0].lat;
    let lon = result[0].lon;
    // console.log(lat);
    // console.log(lon);

    // taking tommorow date
    const getTommorowDate = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    // console.log(getTommorowDate());

    const response2 = await axios.get(`https://api.openweathermap.org/data/3.0/onecall/overview?lat=${lat}&lon=${lon}&appid=${apiKey}&date=${getTommorowDate()}`);
    const result2 = response2.data;

    // console.log(result2.weather_overview);

    res.render("index.ejs", {
      message : result2.weather_overview,
      City: city
    });

  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      message: error.message,})
  }
});

app.listen(port, () => {
  console.log(`Server listen at port ${port}`);
});
