// Import required modules
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Import custom module for JSON manipulation
const JSONManipulator = require('./JSONManipulator');

// Create an instance of express app
const app = express();

// Set up CORS middleware to allow cross-origin resource sharing
app.use(cors());

// Set up session middleware to store session data
app.use(session({
   secret: 'keyboard cat', // Secret used to sign the session ID cookie
   resave: false, // Do not save session if unmodified
   saveUninitialized: true, // Save uninitialized session
   cookie: { secure: false } // Use secure cookies if HTTPS is enabled
}));

// Create an instance of JSONManipulator class
const manipulator = new JSONManipulator("qwe");

// Generate a unique key for the captcha (Alternatively, a fixed key can be used for testing purposes)
const secretKey = 'cats';

// Log the secret key for debugging purposes
console.log(secretKey);

// Parse request body as JSON
app.use(bodyParser.json());

// Define paths to JSON files and images
const jsonsPath  = path.join(__dirname, 'data/untrasted');
const jsonsPath_trasted  = path.join(__dirname, 'data/trasted');
const imagesPath = path.join(__dirname, 'images_to_annotate');

// Read the list of untrusted JSON files and select a random file
const imag_jsons = fs.readdirSync(jsonsPath);
const randomJson = imag_jsons[Math.floor(Math.random() * imag_jsons.length)];

// Read the list of trusted JSON files and select a random file
const imag_jsons_trasted = fs.readdirSync(jsonsPath_trasted);
let randomJson_trasted = imag_jsons_trasted[Math.floor(Math.random() * imag_jsons_trasted.length)];

// Serve an untrusted captcha image
app.get('/api/captcha/untrasted', (req, res) => {
	
	// Check if the request has the correct secret key
	const requestSecretKey = req.headers.secretkey;
	if (!requestSecretKey || requestSecretKey !== secretKey) {
		res.status(401).send({ error: 'Unauthorized' });
		return;
	}
	
	// Read the path to the image from the selected JSON file
	const path_to_image = manipulator.read(path.join(jsonsPath, randomJson)).path_to_image;
	const imagePath = path.join(imagesPath, path_to_image);
	
	// Send the image file to the client
	res.sendFile(imagePath);
});

// Serve a trusted captcha image
app.get('/api/captcha/trusted', (req, res) => {
	
	// Select a new random trusted JSON file
	randomJson_trasted = imag_jsons_trasted[Math.floor(Math.random() * imag_jsons_trasted.length)];
	
	// Check if the request has the correct secret key
	const requestSecretKey = req.headers.secretkey;
	if (!requestSecretKey || requestSecretKey !== secretKey) {
		res.status(401).send({ error: 'Unauthorized' });
		return;
	}
	
	// Read the path to the image from the selected trusted JSON file
	const path_to_image = manipulator.read(path.join(jsonsPath_trasted, randomJson_trasted)).path_to_image;
	const imagePath = path.join(imagesPath, path_to_image);
	
	// Send the image file to the client
	res.sendFile(imagePath);
});

app.post('/api/captcha/trusted', (req, res) => {
  // Check if the captcha is trusted or not
  if (req.body.trusted) {
    const userAnswer = req.body.userAnswer;

    // Get the correct answer from the trusted json file
    const correctAnswer = manipulator.read(path.join(jsonsPath_trasted, randomJson_trasted)).object_area;

    // Create an object with the user's answer
    const answer = {
      "1:1": userAnswer[15][0],
      "1:2": userAnswer[0][0],
      "1:3": userAnswer[1][0],
      "1:4": userAnswer[2][0],
      "2:1": userAnswer[3][0],
      "2:2": userAnswer[4][0],
      "2:3": userAnswer[5][0],
      "2:4": userAnswer[6][0],
      "3:1": userAnswer[7][0],
      "3:2": userAnswer[8][0],
      "3:3": userAnswer[9][0],
      "3:4": userAnswer[10][0],
      "4:1": userAnswer[11][0],
      "4:2": userAnswer[12][0],
      "4:3": userAnswer[13][0],
      "4:4": userAnswer[14][0]
    };

    // Compare the user's answer with the correct answer
    if (JSON.stringify(answer) === JSON.stringify(correctAnswer)) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else { // if the captcha is not trusted
    const userAnswer = req.body.userAnswer;

    // Create an object with the user's answer
    const answer = {
      "1:1": userAnswer[15][0],
      "1:2": userAnswer[0][0],
      "1:3": userAnswer[1][0],
      "1:4": userAnswer[2][0],
      "2:1": userAnswer[3][0],
      "2:2": userAnswer[4][0],
      "2:3": userAnswer[5][0],
      "2:4": userAnswer[6][0],
      "3:1": userAnswer[7][0],
      "3:2": userAnswer[8][0],
      "3:3": userAnswer[9][0],
      "3:4": userAnswer[10][0],
      "4:1": userAnswer[11][0],
      "4:2": userAnswer[12][0],
      "4:3": userAnswer[13][0],
      "4:4": userAnswer[14][0]
    };

    // Find the positions of the checkboxes that were checked
    const result = Object.entries(answer)
      .filter(([key, value]) => value === 1)
      .map(([key, value]) => key);
  
  const id = manipulator.read(path.join(jsonsPath, randomJson)).id;
  for(let i = 0; i < result.length; i++){
	  manipulator.change_field_by(1, id, result[i])
  }
  res.json({ success: true });
  }
  
});


app.listen(3000, () => {
    console.log('API endpoint listening on port 3000');
});

