let dictionary = [];
const express = require("express");
const fs = require("fs");
const SANAKIRJA_PATH = "./sanakirja.txt";

var app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
// headers/cors
app.use(function (req, res, next) { 
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );

  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-type", "application/json");
  next();
}); 

// GET: hae kaikki sanat
app.get("/words", (req, res) => {
  if (!fs.existsSync(SANAKIRJA_PATH)) { // jos ei olemassa, palauta file not found
    return res.status(404).json({ message: `File not found from ${SANAKIRJA_PATH}` });
  }
  const data = fs.readFileSync(SANAKIRJA_PATH, { encoding: "utf8", flag: "r" });

  //data:ssa on nyt koko tiedoston sisältä
  /*tiedoston sisältä pitää pätkiä ja tehdä taulukko*/
  const splitLines = data.split(/\r?\n/);
  /*tässä voisi käydä silmukassa läpi splitLines:ssa jokaisen rivin*/
  splitLines.forEach((line) => {
    const words = line.split(" "); //sanat taulukkoon words
    console.log(words);
    const word = {
      fin: words[0],
      eng: words[1],
    };
    dictionary.push(word);
    console.log(dictionary);
  });

  res.json(dictionary);
});

// GET: hae sana suomeksi
app.get("/words/:searchFin", (req, res) => {
  if (!fs.existsSync(SANAKIRJA_PATH)) { // jos ei olemassa, palauta file not found
    return res.status(404).json({ message: `File not found from ${SANAKIRJA_PATH}` });
  }
  const data = fs.readFileSync(SANAKIRJA_PATH, { encoding: "utf8", flag: "r" });
  const searchFin = req.params.searchFin.toLowerCase();
  const splitLines = data.split(/\r?\n/);
  splitLines.forEach((line) => {
    const [fin, eng] = line.split(" "); 
    if (fin.toLowerCase() === searchFin) {
      return res.json({fin, eng});
    }
  });

  res.json({ message: `Word not found: ${searchFin}` });
});

// POST: lisää uusi sana (fin, eng)
app.post("/words/", (req, res) => {
  const {fin, eng} = req.body; // {fin: "kissa", eng: "cat"}
  if (!fin || !eng) {
    return res.status(400).json({ message: "'fin' and 'eng' are required" });
  } 

  if (!fs.existsSync(SANAKIRJA_PATH)) {
    fs.writeFileSync(SANAKIRJA_PATH, "", { encoding: "utf8", flag: "w" });
    console.log(`File created at ${SANAKIRJA_PATH}`);
  }

  const newWord = `${fin} ${eng}\n`; // format: kissa cat (+ rivivaihto)
  
  fs.appendFile(SANAKIRJA_PATH, newWord, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error writing to file" });
    }
    console.log(`Added new word: ${newWord}`);
    res.status(201).json({ message: "New word added", word: { fin, eng } });
  });
});

app.listen(3000, () => {
  console.log("Server: listening at port 3000");
});
