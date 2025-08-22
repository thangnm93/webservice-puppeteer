import express from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const tn = req.query.tn;
  if (!tn) return res.status(400).json({ error: "Missing tn" });

  const url = `https://mailingtechnology.com/tracking/?tn=${tn}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    );
    
    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    });
    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();

    await browser.close();

    res.json({ tn, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
