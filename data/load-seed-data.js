const client = require('../lib/client');
// import our seed data:
const kpop = require('./kpop.js');
const gendersData = require('./genders.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const { getGenderIdByGroupGender } = require('../lib/utils.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    const genderResponses = await Promise.all(
      gendersData.map(gender => {
        return client.query(`
          INSERT INTO genders (group_gender)
          VALUES ($1)
          RETURNING *;
        `,
        [gender.group_gender]);
      })
    );

    const genders = genderResponses.map(response => {
      return response.rows[0];
    });

    await Promise.all(
      kpop.map(kpop => {
        const genderId = getGenderIdByGroupGender(genders, kpop.group_gender);

        return client.query(`
                    INSERT INTO kpop (name, members, gender_id, debut_year, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [kpop.name, kpop.members, genderId, kpop.debut_year, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
