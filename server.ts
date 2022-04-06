import puppeteer from "puppeteer";
import cheerio from "cheerio";

import express from "express";
import mongoose from "mongoose";

import dotenv from 'dotenv';
dotenv.config();

import { dataModel } from "./models/data";

const uri = `mongodb+srv://uwuxia:${process.env.DATABASE_PASSWORD}@cluster0.0dooz.mongodb.net/uwu?retryWrites=true&w=majority`;
mongoose.connect(uri);

let modelId: string;

dataModel.find().then((result) => {
  if (result.length) {
    modelId = result[0]._id;
  }
});

const app = express();

async function getCovidData() {
  const chromeOptions = {
    headless: true,
    defaultViewport: null,
    args: ["--incognito", "--no-sandbox", "--single-process", "--no-zygote"],
  };

  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();

  await page.goto(
    "https://atlasgis.maps.arcgis.com/apps/opsdashboard/index.html#/e1105263db8541bcae0cb46dd4adc448",
    {
      waitUntil: "networkidle0",
    }
  );

  const html = await page.evaluate(
    () => document.querySelector("*")!.outerHTML
  );

  const $ = cheerio.load(html);

  const data = {
    confirmed: $("#ember18")
      .text()
      .trim()
      .replace(/\s/g, "")
      .replace(/[^0-9$.,]/g, ""),
    current: $("#ember39")
      .text()
      .trim()
      .replace(/\s/g, "")
      .replace(/[^0-9$.,]/g, ""),
    new: $("#ember25")
      .text()
      .trim()
      .replace(/\s/g, "")
      .replace(/[^0-9$.,]/g, ""),
    recovered: $("#ember46")
      .text()
      .trim()
      .replace(/\s/g, "")
      .replace(/[^0-9$.,]/g, ""),
    deaths: $("#ember53")
      .text()
      .trim()
      .replace(/\s/g, "")
      .replace(/[^0-9$.,]/g, ""),
    asOf: new Date().toDateString(),
  };

  if (modelId) {
    await dataModel.findByIdAndUpdate(modelId, data);
  } else {
    const datamod = new dataModel(data);
    const datam = await datamod.save();
    modelId = datam._id;
  }

  console.log("Done fetching data, next fetch is in 12 Hours");

  await browser.close();
}

getCovidData();

setInterval(() => getCovidData(), 600000);

app.use(express.static("./front-end/build"));

app.get("/covid", async (req, res) => {
  const data = await dataModel.findById(modelId);

  res.json(data);
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server running on PORT " + port);
});
