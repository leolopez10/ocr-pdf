const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { createWorker, setLogging } = require('tesseract.js');

setLogging(true);

const worker = createWorker({
  logger: m => console.log(m),
  errorHandler: err => console.error(err)
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
  /* 
     //Check and confirm that we are receiving a file.
     //Check if file is an image
      // read the file to get file type
    * If file is not an image convert it to an image - bmp, jpg, png, pbm
    * Then run file in Tesseract
  */

  let userFile;
  let content = {};

  if (req.file == null || req.file == undefined) {
    console.log('Error: No file uploaded. Please select a file and try again.');
  } else {
    userFile = req.file;
  }

  switch (userFile.mimetype) {
    case 'image/jpeg':
      console.log(`This is an image == FileType:${userFile.mimetype}`);
      try {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const {
          data: { text }
        } = await worker.recognize(userFile.path);
        res.send(text);
      } catch (error) {
        console.log(error);
      }
      break;
    case 'image/png':
      console.log(`This is an image == FileType:${userFile.mimetype}`);
      try {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const {
          data: { text }
        } = await worker.recognize(userFile.path);
        res.send(text);
      } catch (error) {
        console.log(error);
      }
      break;
    default:
      console.log(
        `This is not a not an image == FileType:${userFile.mimetype}` // ! I need to grab any file type and covert it to an image. But I guess I'll be happey with PDF to image.
      );
      fs.readFile(userFile.path, (err, data) => {
        if (err) throw err;
        console.log(data);
        // return data;
      });
      break;
  }

  /*
  // ! Create a function to hold the this
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const {
    data: { text }
  } = await worker.recognize(req.file.path); // ! File path needs to correct all the time when entering here. We also need to stick this in a try catch function.

  // * Send the data to the front end.
   res.send(text);
   res.redirect('/download'); // ! Down load file to machine

  // * Terminate Worker
  await worker.terminate();

  */
});

// Start up server
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
