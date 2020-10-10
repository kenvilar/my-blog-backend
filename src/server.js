import express from 'express';

const app = express();

app.get('/hello', function(req, res) {
  console.log('ken hello');
  res.send('Hello');
});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
