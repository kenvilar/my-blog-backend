import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';

const articlesInfo = {
  'learn-react': {
    name: 'learn-react',
    upvotes: 0,
    comments: [],
  },
  'learn-angular': {
    name: 'learn-node',
    upvotes: 0,
    comments: [],
  },
  'learn-vue': {
    name: 'learn-vue',
    upvotes: 0,
    comments: [],
  },
};

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

const withDB = async (operations, res, error = null) => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017',
      {useNewUrlParser: true});
    const db = client.db('my-blog');

    await operations(db);

    await client.close();
  } catch (e) {
    // res.status(500).json({message: 'Error connecting to the database', e});
    await error();
  }
};

app.get('/api/articles/:name', async (req, res) => {
  const articleName = req.params.name;
  await withDB(async (db) => {
    const articleInfo = await db.collection('articles').
      findOne({name: articleName});
    await res.status(200).json(articleInfo);
  }, res, async () => {
    await res.status(200).json(articlesInfo[articleName]);
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
    await res.status(200).json(updatedArticleInfo);
  }, res, async () => {
    articlesInfo[articleName].upvotes += 1;
    await res.status(200).send(articlesInfo[articleName]);
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
    await res.status(200).json(updatedArticleInfo);
  }, res, async () => {
    await articlesInfo[articleName].comments.push({username, text});
    await res.status(200).send(articlesInfo[articleName]);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Listening on port 8000'));
