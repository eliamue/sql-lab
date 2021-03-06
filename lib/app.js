const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/genders', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT 	 id, group_gender
      FROM     genders
      ORDER BY group_gender
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/kpop', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT 	kpop.id, kpop.name, kpop.members, g.group_gender as group_gender, kpop.debut_year, kpop.owner_id 
    FROM 	  kpop
    JOIN 	  genders as g
    ON 	 	  kpop.gender_id = g.id;
  `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/kpop/:id', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT 	kpop.id, kpop.name, kpop.members, g.group_gender as group_gender, kpop.debut_year, kpop.owner_id 
      FROM 	  kpop
      JOIN 	  genders as g
      ON 	 	  kpop.gender_id = g.id
      WHERE   kpop.id = $1;
    `, [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/kpop/', async(req, res) => {
  try {
    const data = await client.query(`
      INSERT INTO kpop (name, members, gender_id, debut_year, owner_id)
      VALUES ($1, $2, $3, $4, 1)
      RETURNING *`, [req.body.name, req.body.members, req.body.gender_id, req.body.debut_year]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/kpop/:id', async(req, res) => {
  try {
    const data = await client.query(`
      UPDATE kpop
      SET 
          name=$1,
          members=$2,
          gender_id=$3,
          debut_year=$4
      WHERE id=$5
      RETURNING *
    `, [req.body.name, req.body.members, req.body.gender_id, req.body.debut_year, req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/kpop/:id', async(req, res) => {
  try {
    // the SQL query is DELETE
    const data = await client.query('DELETE FROM kpop WHERE id=$1', [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
