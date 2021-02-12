const OBJECT_ID_USER_WATER = "602320bb286a8427b94b898e";
const OBJECT_ID_USER_EXP = "6023206d9c05de42545dd133";
const OBJECT_ID_USER_CHARGE = "60221e449c05de42545d8a4d";
const OBJECT_ID_USER_MONEY_CHARGE = "602322339c05de42545dd15d";
const OBJECT_ID_USER_CURRENCY = "60221d94286a8427b94b40b0";

function isFieldId(id) {
  return id == OBJECT_ID_USER_WATER ||
    id == OBJECT_ID_USER_EXP ||
    id == OBJECT_ID_USER_CHARGE ||
    id == OBJECT_ID_USER_MONEY_CHARGE ||
    id == OBJECT_ID_USER_CURRENCY;
}
function isWaterId(id) {
  return id == OBJECT_ID_USER_WATER;
}
function id2Field(id) {
  if (id == OBJECT_ID_USER_WATER) return "water";
  if (id == OBJECT_ID_USER_EXP) return "exp";
  if (id == OBJECT_ID_USER_CHARGE) return "charge";
  if (id == OBJECT_ID_USER_MONEY_CHARGE) return "moneyCharge";
  if (id == OBJECT_ID_USER_CURRENCY) return "currency";
  return null;
}
module.exports = {
  isFieldId, id2Field, isWaterId
}