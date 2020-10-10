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

const withDB = async (operations, res, error = null) => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017',
      {useNewUrlParser: true});
    const db = client.db('my-blog');

    operations(db);

    await client.close();
  } catch (e) {
    // res.status(500).json({message: 'Error connecting to the database', e});
    error();
  }
};

app.get('/api/articles/:name', async (req, res) => {
  const articleName = req.params.name;
  await withDB(async (db) => {
    const articleInfo = await db.collection('articles').
      findOne({name: articleName});
    res.status(200).json(articleInfo);
  }, res, () => {
    res.status(500).json(articlesInfo[articleName]);
  });
});

app.post('/api/articles/:name/upvote', async (req, res) => {
  const articleName = req.params.name;
  await withDB(async (db) => {
    const articleInfo = await db.collection('articles').
      findOne({name: articleName});
    await db.collection('articles').updateOne({name: articleName}, {
      '$set': {
        upvotes: articleInfo.upvotes + 1,
      },
    });
    const updatedArticleInfo = await db.collection('articles').
      findOne({name: articleName});
    res.status(200).json(updatedArticleInfo);
  }, res, () => {
    articlesInfo[articleName].upvotes += 1;
    res.status(500).
      send(
        `${articleName} now has ${articlesInfo[articleName].upvotes} upvotes.`);
  });
});

app.post('/api/articles/:name/add-comment', async (req, res) => {
  const {username, text} = req.body;
  const articleName = req.params.name;

  await withDB(async (db) => {
    const articleInfo = await db.collection('articles').
      findOne({name: articleName});
    await db.collection('articles').updateOne({name: articleName}, {
      '$set': {
        comments: articleInfo.comments.concat({username, text}),
      },
    });
    const updatedArticleInfo = await db.collection('articles').
      findOne({name: articleName});
    res.status(200).json(updatedArticleInfo);
  }, res, () => {
    articlesInfo[articleName].comments.push({username, text});
    res.status(200).send(articlesInfo[articleName]);
  });
});

app.listen(8000, () => console.log('Listening on port 8000'));
