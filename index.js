
const express = require('express');

//const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 4000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `)
})

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

app.get('/about', (req, res) => {
  res.send('This is my about route..... ')
})


app.get('/scrape', async (req, res) => {
  try {
    const { hash } = req.query;
    let browser;


     browser = await puppeteer.launch({headless: 'false'});
    const page = await browser.newPage();

    // Modify the URL to include query parameters
    await page.goto('https://finder.kujira.network/kaiyo-1/tx/'+hash);

  // Wait for the data to load (you might need to adjust the selector)
  // await page.waitForSelector('#root > div > div.container.explore > div.md-row.pad-tight.wrap > div:nth-child(1) > div > table > tbody > tr:nth-child(6)');


    // Your Puppeteer scraping logic goes here
    const data = await page.evaluate(() => {
      const data = document.querySelector('#root > div > div.container.explore > div.md-row.pad-tight.wrap > div:nth-child(1) > div > table > tbody > tr:nth-child(6)').innerText.split(":")[1];

      // Define a regular expression pattern to match numeric values and units
      const regex = /(\d+)\n([A-Za-z0-9]+)/g;
      
      // Initialize an object to store the data
      const dataArray = {};
      
      // Use a loop to iterate over matches found by the regular expression
      let match;
      while ((match = regex.exec(data)) !== null) {
        const numericValue = match[1];
        const unit = match[2];
      
        // Check if the unit already exists in the object
        if (dataArray[unit]) {
          // If it exists, push the new numeric value to the array
          dataArray[unit].push(numericValue);
        } else {
          // If it doesn't exist, create a new array with the numeric value
          dataArray[unit] = [numericValue];
        }
      }

        return dataArray;
     
     
     
      });

    await browser.close();

    // Send the scraped data back
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



// Export the Express API
module.exports = app