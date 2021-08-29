import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

import fs from 'fs';
import express from 'express';

const app = express();

async function getCovidData() {
    const chromeOptions = {
        headless: true,
        defaultViewport: null,
        args: [
            "--incognito",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
    };

    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();

    await page.goto('https://atlasgis.maps.arcgis.com/apps/opsdashboard/index.html#/e1105263db8541bcae0cb46dd4adc448', {
      waitUntil: 'networkidle0',
    });
    
    const html = await page.evaluate(() => document.querySelector('*')!.outerHTML);

    const $ = cheerio.load(html);

    const data = {
        confirmed: $('#ember18').text().trim().replace(/\s/g, '').replace(/[^0-9$.,]/g,''),
        current: $('#ember39').text().trim().replace(/\s/g, '').replace(/[^0-9$.,]/g,''),
        new: $('#ember25').text().trim().replace(/\s/g, '').replace(/[^0-9$.,]/g,''),
        recovered: $('#ember46').text().trim().replace(/\s/g, '').replace(/[^0-9$.,]/g,''),
        deaths: $('#ember53').text().trim().replace(/\s/g, '').replace(/[^0-9$.,]/g,''),
        asOf: new Date().toDateString()
    }

    fs.writeFileSync('./covid.json', JSON.stringify(data));
    console.log('Done fetching data, next fetch is in 12 Hours');

    await browser.close();
}

getCovidData();

setInterval(() => getCovidData(), 600000)

app.get('/covid', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./covid.json', 'utf-8'));

    res.json(data);
});

app.listen(3001, () => {
    console.log('Server running on PORT 3001');
});