const express = require('express');
const path = require('path');
const app = express();
const port = 8000

// Serve static files from the "static" directory
app.use(express.static(path.join(__dirname, 'static')));

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
