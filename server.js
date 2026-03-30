const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer();

app.get("/", (req, res) => {
  res.send("Server Running ✅");
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);

    const lines = data.text.split("\n");
    let results = [];

    lines.forEach(line => {
      const numbers = line.match(/\b\d{10}\b/g);
      if (numbers) {
        numbers.forEach(num => {
          results.push(num + " - Amount");
        });
      }
    });

    res.json({ data: results });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "PDF parse error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
