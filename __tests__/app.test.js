require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns kpop', async() => {

      const expectation = [
        {
          'name': 'BTS',
          'members': 7,
          'debut_year': 2013,
        },
        {
          'name': 'Mamamoo',
          'members': 4,
          'debut_year': 2014,
        },
        {
          'name': 'BlackPink',
          'members': 4,
          'debut_year': 2016,
        },
        {
          'name': '(G)I-dle',
          'members': 6,
          'debut_year': 2018,
        },
        {
          'name': 'SHINEE',
          'members': 4,
          'debut_year': 2008,
        }
      ];

      const data = await fakeRequest(app)
        .get('/kpop')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns kpop/:id ', async() => {

      const expectation = [
        {
          'name': 'BTS',
          'members': 7,
          'debut_year': 2013,
        }
      ];
      const data = await fakeRequest(app)
        .get('/kpop/1')
        .expect('Content-Type', /json/)
        .expect(200);
    
      expect(data.body).toEqual(expectation);
    });
  });
});
