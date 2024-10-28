import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
  res.render("index.ejs", {
    content: "Hello World"
  });
});

app.listen(port, () => {
  console.log(`Server listen at port ${port}`);
});
