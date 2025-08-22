import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const trackingNumber = req.query.tn;

  if (!trackingNumber) {
    return res.status(400).json({ error: "Missing tn (tracking number)" });
  }

  const url = `https://mailingtechnology.com/tracking/?tn=${trackingNumber}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // lấy HTML (nếu bạn muốn tự parse bằng PHP)
    const html = await page.content();

    // ví dụ: lấy text đầu tiên có class "tracking-result"
    const trackingData = await page.evaluate(() => {
      const node = document.querySelector(".tracking-result");
      return node ? node.innerText.trim() : null;
    });

    await browser.close();

    res.json({
      trackingNumber,
      html,          // toàn bộ HTML
      trackingData,  // text đã parse sơ bộ
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scraping failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
