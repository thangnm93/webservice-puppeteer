import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "chromium";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const tn = req.query.tn;
  if (!tn) return res.status(400).json({ error: "Missing tn" });

  const url = `https://mailingtechnology.com/tracking/?tn=${tn}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromium.path, // Dùng binary chromium
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();

    await browser.close();

    res.json({ tn, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
