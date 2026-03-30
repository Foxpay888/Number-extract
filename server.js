const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });

// 👉 index.html serve karega
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  const filePath = req.file.path;

  try {
    const data = await pdfParse(fs.readFileSync(filePath));
    const text = data.text;

    const lines = text.split("\n");
    let results = new Set();

    lines.forEach(line => {
      let mobiles = line.match(/\b[6-9]\d{9}\b/g);
      let upi = line.match(/\b\d{10}(?=@)\b/g);
      let amounts = line.match(/(₹|INR)?\s?\d{1,3}(,\d{3})*(\.\d{1,2})?/g);

      let amount = "N/A";
      if (amounts) {
        amount = amounts
          .map(a => parseFloat(a.replace(/[^0-9.]/g, "")))
          .filter(a => !isNaN(a))
          .sort((a, b) => b - a)[0];
      }

      let numbers = [];
      if (mobiles) numbers.push(...mobiles);
      if (upi) numbers.push(...upi);

      numbers.forEach(num => {
        results.add(`${num} - Amount: ${amount}`);
      });
    });

    fs.unlinkSync(filePath);
    res.json({ data: Array.from(results) });

  } catch (err) {
    res.status(500).send("Error processing PDF");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
