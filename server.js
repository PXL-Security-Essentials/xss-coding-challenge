const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// -----------------------------------------------
// TODO: Add your comments feature here (Step 1)
// -----------------------------------------------

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
