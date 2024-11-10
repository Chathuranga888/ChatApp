import express from "express";
import axios from "axios";
import bodyparser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true}));

app.get("/", (req,res) => {
  res.render("index.ejs", {
    City: null,
    Lat: null,
    Lon: null
  });
});

app.post("/",async(req,res) => {
  console.log(req.body);

  try {
    let zipCode = req.body.zipcode;
    // console.log(zipCode);
    const apiKey = process.env.API_KEY;
    console.log(apiKey);

    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},LK&appid=${apiKey}`);
    const result = response.data;
    // console.log(result);
    let city = result.name;
    // console.log(city);
    let lat = result.lat;
    // console.log(lat);
    let lon = result.lon;
    // console.log(lon);
    res.render("index.ejs", {
      City: city,
      Lat: lat,
      Lon: lon 
    });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      content: error.message,})
  }
});

app.listen(port, () => {
  console.log(`Server listen at port ${port}`);
});
