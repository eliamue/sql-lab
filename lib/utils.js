function getGenderIdByGroupGender(genders, group_gender) {
  const matchedGender = genders.find(gender => {
    return gender.group_gender === group_gender;
  });
  
  return matchedGender.id;
}
  
module.exports = {
  getGenderIdByGroupGender: getGenderIdByGroupGender
};