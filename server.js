// librairies
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');

// recipes data
const recipes = require('./list.json');

// vars
const app = express();
const port = 3000;
const jwtSecret = 'OurSuperLongRandomSecretToSignOurJWTgre5ezg4jyt5j4ui64gn56bd4sfs5qe4erg5t5yjh46yu6knsw4q';

// users data
const db = {
  users: [
    {
      id: 32,
      password: 'welcomeadmin',
      username: 'Viktk',
      color: '#c23616',
      favorites: [21453, 462],
      email: 'admin@victorcao.me',
    },
  ]
};

/* Middlewares */
// parse request body
app.use(bodyParser.json());

// cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

  // response to preflight request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  }
  else {
    next();
  }
});

// prepare authorization middleware
const authorizationMiddleware = jwt({ secret: jwtSecret, algorithms: ['HS256'] });

/* Routes */
// Page d'accueil du serveur : GET /
app.get('/', (req, res) => {
  console.log('>> GET /');
  res.sendFile( __dirname + '/index.html');
});

// Liste des recettes : GET /recipes
app.get('/recipes', (req, res) => {
  console.log('>> GET /recipes');
  res.json(recipes);
});


// Login : POST /login
app.post('/login', (req, res) => {
  console.log('>> POST /login', req.body);
  const { email, password } = req.body;

  // authentication
  const user = db.users.find(user => user.email === email && user.password === password);

  // http response
  if (user) {
    const jwtContent = { userId: user.id };
    const jwtOptions = { 
      algorithm: 'HS256', 
      expiresIn: '3h' 
    };
    console.log('<< 200', user.username);
    res.json({ 
      logged: true, 
      pseudo: user.username,
      token: jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions),
    });
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    res.sendStatus(401);
  }
});

app.get('/checkToken', authorizationMiddleware, (req, res) => {
  // authentication
  const user = db.users.find(user => user.id === req.user.userId);

  // http response
  if (user) {
    console.log('<< 200', user.username);
    res.json({ 
      logged: true, 
      pseudo: user.username,
    });
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    res.sendStatus(401);
  }
});

// Favorites recipes : GET /favorites
app.get('/favorites', authorizationMiddleware, (req, res) => {
  console.log('>> GET /favorites', req.user);

  const user = db.users.find(user => user.id === req.user.userId);
  console.log('<< 200');
  res.json({ 
    favorites: recipes.filter((recipe) => user.favorites.includes(recipe.id)), 
  });
});

// Error middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.log('<< 401 UNAUTHORIZED - Invalid Token');
    res.status(401).send('Invalid token');
  }
});

/*
 * Server
 */
app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
