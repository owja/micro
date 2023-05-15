const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('dist'));

app.listen(port, () => {
    console.log(`@owja/micro demo listening on port ${port}`)
});