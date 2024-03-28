const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Set port to 3000 or process.env.PORT (if deployed)

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
