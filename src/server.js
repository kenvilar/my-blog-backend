import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';

const articlesInfo = {
  'learn-react': {
    name: 'learn-react',
    upvotes: 0,
    comments: [],
  },
  'learn-node': {
    name: 'learn-node',
    upvotes: 0,
    comments: [],
  },
  'my-thoughts-on-resumes': {
    name: 'my-thoughts-on-resumes',
    upvotes: 0,
    comments: [],
  },
};

const app = express();

app.use(bodyParser.json());

app.get('/api/articles/:name', (req, res) => {
  const articleName = req.params.name;

  try {
    const client = MongoClient.connect('mongodb://localhost:27017',
      {useNewUrlParser: true});
    const db = client.db('my-blog');

    const articleInfo = db.collection('articles').
      findOne({name: articleName});
    res.status(200).json(articleInfo);

    client.close();
  } catch (e) {
    // res.status(500).json({message: 'Error connecting to the database', e});
    res.status(500).json(articlesInfo[articleName]);
  }
});

app.post('/api/articles/:name/upvote', (req, res) => {
  const articleName = req.params.name;

  try {
    const client = MongoClient.connect('mongodb://localhost:27017',
      {useNewUrlParser: true});
    const db = client.db('my-blog');

    const articleInfo = db.collection('articles').findOne({name: articleName});
    db.collection('articles').updateOne({name: articleName}, {
      '$set': {
        upvotes: articleInfo.upvotes + 1,
      },
    });
    const updatedArticleInfo = db.collection('articles').
      findOne({name: articleName});

    res.status(200).json(updatedArticleInfo);
    client.close();
  } catch (e) {
    // res.status(500).json({message: 'Error connecting to the database', e});
    articlesInfo[articleName].upvotes += 1;
    res.status(500).
      send(
        `${articleName} now has ${articlesInfo[articleName].upvotes} upvotes.`);
  }
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const {username, text} = req.body;
  const articleName = req.params.name;

  articlesInfo[articleName].comments.push({username, text});

  res.status(200).send(articlesInfo[articleName]);
});

app.listen(8000, () => console.log('Listening on port 8000'));
