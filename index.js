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

// function for getting summerize wether report from chatGPT uisng API
async function getWetherSummery(wetherdata) {
  const prompt = `Simplify the following weather overview so it's easy to understand and make simple sentences:"${wetherdata.weather_overview}"`;
  // console.log("Weather Overview Content:", wetherdata.weather_overview);
  const apiKey = process.env.gptApiKey;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4", // Use the model available to you
        messages: [{ role: "user", content: prompt }]
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    // console.log("Full response data : ", response.data);
    // console.log("Full response data:", JSON.stringify(response.data, null, 2));


    const summary = response.data.choices[0].message.content;
    // console.log("Simplified Weather Summary:", summary);
    return summary;
} catch (error) {
    console.error("Error fetching summary:", error);
    return null;
}
}

// converting chatGPT response into array
function makeString(str) {
  let weatherArray = str.split(". ");
  weatherArray = weatherArray.map(sentence => sentence.trim());
  if (weatherArray[weatherArray.length - 1] === "") {
    weatherArray.pop();
  }
  // console.log(weatherArray);
  return weatherArray;
  
}

// taking tommorow date
const getTommorowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// taking today date
const getToday = () => {
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);
  return formattedDate;
}

//loading home page
app.get("/", (req,res) => {
  res.render("index.ejs", {
    message: null
  });
});

//
app.post("/wether-report",async(req,res) => {
  console.log(req.body);

  try {
    let city = req.body.city;
    let date = req.body.date;
    const apiKey = process.env.API_KEY;

    // console.log(city);

    const response1 = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city},LK&appid=${apiKey}`);
    const result = response1.data;
    // console.log(result);
    // let city = result.name;
    let lat = result[0].lat;
    let lon = result[0].lon;
    // console.log(lat);
    // console.log(lon);

    let callDate = "";

    if(date == "tommorow"){
      callDate = getTommorowDate();
    }else{
      callDate = getToday(); 
    }

    // console.log(getTommorowDate());

    const response2 = await axios.get(`https://api.openweathermap.org/data/3.0/onecall/overview?lat=${lat}&lon=${lon}&appid=${apiKey}&date=${callDate}`);
    const result2 = response2.data;

    const wetherdata = result2;

    // console.log(wetherdata.weather_overview);
    let response = await getWetherSummery(wetherdata);
    console.log(response);

    let newResponse = makeString(response);
    console.log(newResponse);

    res.render("wether-report.ejs", {
      message : newResponse,
      Date: date
    });

  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("wether-report.ejs", {
      message: error.message,})
  }
});

app.get("/wether-report", (req,res) => {
  res.redirect("/");
})

app.listen(port, () => {
  console.log(`Server listen at port ${port}`);
});
