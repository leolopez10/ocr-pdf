const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { createWorker } = require('tesseract.js');

const worker = createWorker({
  logger: m => console.log(m)
});

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, './uploads');
  },
  filename: (req, file, callBack) => {
    callBack(null, file.originalname);
  }
});

const upload = multer({ storage: storage });
// .single('avatar');

app.set('view engine', 'ejs');
app.use(express.static('public'));

//routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('avatar'), async (req, res) => {
  //   console.log(req.file);
  //   console.log(req.body);

  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const {
    data: { text }
  } = await worker.recognize(req.file.path);

  res.send(text);
  // res.redirect('/download');

  await worker.terminate();
});

// Start up server
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
