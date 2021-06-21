require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const { getGenderIdByGroupGender } = require('../lib/utils.js');

describe('post put and delete routes', () => {
  describe('routes', () => {
    let token;
    let genders;

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

      const genderData = await fakeRequest(app).get('/genders');
      genders = genderData.body;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });
      
    test('/POST kpop creates a single kpop group', async() => {

      const genderId = getGenderIdByGroupGender(genders, 'male');
      // make a request to create the new kpop
      const data = await fakeRequest(app)
        .post('/kpop')
        .send({
          name: 'new kpop group',
          members: 5,
          gender_id: genderId,
          debut_year: 2015
        })
        .expect('Content-Type', /json/)
        .expect(200);

      // make a request to see all kpop
      const dataKpop = await fakeRequest(app)
        .get('/kpop')
        .expect('Content-Type', /json/)
        .expect(200);

      const postedKpop = { 
        'members': 5,
        'debut_year': 2015, 
        'id': 6, 
        'name': 'new kpop group',
        'gender_id': genderId, 
        'owner_id': 1,
      };

      const newKpop = { 
        'members': 5,
        'debut_year': 2015, 
        'id': 6, 
        'name': 'new kpop group',
        'group_gender': 'male', 
        'owner_id': 1,
      };
      
      // check that the post request responds with the new kpop
      expect(data.body).toEqual(postedKpop);
      // check that the get request contians the new kpop
      expect(dataKpop.body).toContainEqual(newKpop);
    });

    test('/PUT kpop updates a single kpop group', async() => {

      const genderId = getGenderIdByGroupGender(genders, 'male');
      // make a request to update the new kpop
      const data = await fakeRequest(app)
        .put('/kpop/6')
        .send({
          name: 'new kpop group',
          members: 5,
          gender_id: genderId,
          debut_year: 2015
        })
        .expect('Content-Type', /json/)
        .expect(200);
  
      // make a request to see all kpop games
      const dataKpop = await fakeRequest(app)
        .get('/kpop')
        .expect('Content-Type', /json/)
        .expect(200);

      const putKpop = { 
        'members': 5,
        'debut_year': 2015, 
        'id': 6, 
        'name': 'new kpop group',
        'gender_id': genderId, 
        'owner_id': 1,
      };
  
      const newKpop = { 
        'members': 5,
        'debut_year': 2015, 
        'id': 6, 
        'name': 'new kpop group',
        'group_gender': 'male', 
        'owner_id': 1,
      };
        
      // check that the put request responds with the new kpop game
      expect(data.body).toEqual(putKpop);
      // check that the get request contians the new Kpop 
      expect(dataKpop.body).toContainEqual(newKpop);
    });

    test('/DELETE kpop deletes a single kpop group', async() => {

      // make a request to update the new kpop
      await fakeRequest(app)
        .delete('/kpop/6')
        .expect('Content-Type', /json/)
        .expect(200);
    
      // make a request to see all kpop
      const dataKpop = await fakeRequest(app)
        .get('/kpop')
        .expect('Content-Type', /json/)
        .expect(200);
    
      const newKpop = { 
        'members': 5,
        'debut_year': 2015, 
        'id': 6, 
        'name': 'new kpop group', 
        'group_gender': 'male',
        'owner_id': 1,
      };
    
      // check that the get request contians the new kpop game
      expect(dataKpop.body).not.toContainEqual(newKpop);
    });
  });
});