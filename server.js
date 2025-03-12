// server.js - Node.js server for Greenleaf Organics signup and login

// Import necessary modules
const express = require('express');        // Express.js for creating the server
const bodyParser = require('body-parser'); // Body-parser to handle POST request bodies
const fs = require('fs');                 // File system module to work with files

const app = express();
const port = 3000; // You can change this port if needed

// --- Middleware ---

// Serve static files from the 'public' directory
// This makes your HTML, CSS, JS files accessible to the browser
app.use(express.static('public'));

// Use body-parser middleware to parse request bodies in URL-encoded and JSON formats
app.use(bodyParser.urlencoded({ extended: false })); // For parsing URL-encoded bodies
app.use(bodyParser.json());                       // For parsing JSON bodies

// --- Data Storage ---

const usersFilePath = 'users.json'; // Path to the JSON file to store user data

// --- Helper Functions ---

// Function to read user data from users.json file
function readUsersData() {
    try {
        const rawData = fs.readFileSync(usersFilePath); // Try to read data from the file
        return JSON.parse(rawData);                    // Parse the JSON data and return it
    } catch (error) {
        // If the file doesn't exist or there's an error reading/parsing, return an empty array
        console.error("Error reading users data:", error);
        return []; // Initialize with an empty array if file not found or error occurs
    }
}

// Function to write user data to users.json file
function writeUsersData(users) {
    try {
        const data = JSON.stringify(users, null, 2); // Convert users array to JSON string (pretty print with 2 spaces)
        fs.writeFileSync(usersFilePath, data);        // Write the JSON string to the users.json file
        return true;                                // Indicate successful write
    } catch (error) {
        console.error("Error writing users data:", error);
        return false;                               // Indicate write failure
    }
}

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) { // Basic validation: Check if email and password are provided
        return res.status(400).send('Email and password are required.'); // Respond with 400 error if missing
    }

    const users = readUsersData(); // Read existing user data from users.json

    // Check if the email is already registered
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).send('Email already registered.'); // Respond with 409 conflict if email exists
    }

    // Create a new user object
    const newUser = {
        email: email,
        password: password, // **IMPORTANT SECURITY NOTE:** In a real application, you should hash the password!
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    users.push(newUser); // Add the new user to the users array

    if (writeUsersData(users)) { // Write the updated users array back to users.json
        res.status(201).send('Signup successful!'); // Respond with 201 created status on success
    } else {
        res.status(500).send('Signup failed: Could not save user data.'); // Respond with 500 internal server error if write fails
    }
});


// --- Login Endpoint ---
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) { // Basic validation: Check if email and password are provided
        return res.status(400).send('Email and password are required.'); // Respond with 400 error if missing
    }

    const users = readUsersData(); // Read user data from users.json

    // Find user by email
    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).send('Invalid email or password.'); // 401 Unauthorized if user not found
    }

    // **IMPORTANT SECURITY NOTE:**  In a real application, you should compare hashed passwords!
    if (user.password === password) { // For demonstration, we are comparing plain text passwords
        res.status(200).send('Login successful!'); // 200 OK if login is successful
    } else {
        res.status(401).send('Invalid email or password.'); // 401 Unauthorized if password doesn't match
    }
});


// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`); // Log message when server starts
});
