const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { createWorker, setLogging } = require('tesseract.js');
const ejs = require('ejs');

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

// Setting views and styles
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
    case 'image/png':
      console.log(`This is an image == FileType:${userFile.mimetype}`);
      try {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const {
          data: { text }
        } = await worker.recognize(userFile.path);
        // res.send(text); // send a view with the text and a back button
        console.log(text);

        res.render('uploads', { text: text });
      } catch (error) {
        console.log(error);
      }
      break;

    case 'application/pdf':
      console.log(`This is an image == FileType:${userFile.mimetype}`);

      // res.send(userFile.path);
      console.log(userFile);

      // let buf = fs.readFileSync(userFile.path);

      // console.log(buf);

      // gm(buf, 'image.jpg')
      //   .noise('laplacian')
      //   .write(`./uploads/WEZK8.jpg`, function (err) {
      //     if (err) return console.log(err);
      //     console.log('Created an image from a Buffer!');
      //   });

      // try {
      //   await worker.load();
      //   await worker.loadLanguage('eng');
      //   await worker.initialize('eng');
      //   const {
      //     data: { text }
      //   } = await worker.recognize(userFile.path);
      //   res.send(text);
      // } catch (error) {
      //   console.log(error);
      // }
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
});

// Start up server
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
