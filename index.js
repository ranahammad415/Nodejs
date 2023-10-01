const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chromium  = require("@sparticuz/chromium-min");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/", async (req, res) => {
  res.send(process.env.AWS_LAMBDA_FUNCTION_VERSION);
});

app.get("/api", async (req, res) => {
  let options = {};

    // Optional: If you'd like to use the legacy headless mode. "new" is the default.
    chromium.setHeadlessMode = true;

    // Optional: If you'd like to disable webgl, true is the default.
    chromium.setGraphicsMode = false;

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: process.env.IS_LOCAL ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.IS_LOCAL
        ? "/tmp/localChromium/chromium/linux-1122391/chrome-linux/chrome"
        : await chromium.executablePath(),
      headless: process.env.IS_LOCAL ? false : chromium.headless,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    await page.goto("http://refer.dloyal.com/");
    res.send(await page.title());
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
