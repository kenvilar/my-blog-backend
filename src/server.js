import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());

app.get('/hello', function(req, res) {
  console.log('ken hello');
  res.send('Hello');

});

app.post('/hello', function(req, res) {
  res.send(`Hello ${req.body.name}!`);
});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
