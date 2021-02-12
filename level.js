/**
 * 等级为 level 时的最大经验值限制
 */
function expLimit(level) {
  if (level == 0) { return 12; }
  if (level == 1) { return 12; }
  if (2 <= level && level <= 4) { return 8; }
  if (5 <= level && level <= 7) { return 16; }
  if (level == 8) { return 24; }
  if (level == 9) { return 48; }
  if (level == 10) { return 56; }
  if (level == 11) { return 56; }
  if (level == 12) { return 64; }
  if (level == 13) { return 76; }
  if (14 <= level && level <= 18) { return 82; }
  if (level == 19) { return 100; }
  if (level == 20) { return 110; }
  if (level == 21) { return 138; }
  if (level == 22) { return 138; }
  if (level == 23) { return 142; }
  if (level == 24) { return 146; }
  if (level == 25) { return 151; }
  if (level == 26) { return 155; }
  if (level == 27) { return 160; }
  if (level == 28) { return 165; }
  if (level == 29) { return 170; }
  if (level == 30) { return 174; }
  if (level == 31) { return 181; }
  if (level == 32) { return 185; }
  if (level == 33) { return 191; }
  if (level == 34) { return 197; }
  if (level == 35) { return 202; }
  if (level == 36) { return 209; }
  if (level == 37) { return 230; }
  if (level == 38) { return 252; }
  if (level == 39) { return 278; }
  if (level == 40) { return 306; }
  if (level == 41) { return 342; }
  if (level == 42) { return 383; }
  if (level == 43) { return 430; }
  if (level == 44) { return 481; }
  if (level == 45) { return 558; }
  if (level == 46) { return 647; }
  if (level == 47) { return 850; }
  if (level == 48) { return 871; }
  if (level == 49) { return 950; }
  if (level == 50) { return 1010; }
  if (level == 51) { return 1172; }
  if (level == 52) { return 1359; }
  if (level == 53) { return 1576; }
  if (54 <= level && level <= 64) { return 1770; }
  if (65 <= level && level <= 75) { return 2655; }
  if (76 <= level && level <= 100) { return 3540; }
  if (101 <= level && level <= 164) { return 4425; }
  return 4425;
}
/**
 * 等级为 level 时的最大累计经验值限制
 */
function expAccLimit(level) {
  var sum = 0;
  for (let i = 0; i <= level; i++) {
    sum += expLimit(i);
  }
  return sum;
}

/**
 * 当前等级为 level 时的最大体力上限
 */
function waterLimit(level) {
  if (level == 0 || level == 1 || level == 2) { return 20; }
  if (level == 3 || level == 4) { return 21; }
  if (level == 5 || level == 6) { return 22; }
  if (level == 7 || level == 8) { return 23; }
  if (level == 9 || level == 10) { return 24; }
  if (level == 11 || level == 12) { return 25; }
  if (level == 13 || level == 14) { return 26; }
  if (level == 15) { return 27; }
  if (level == 16) { return 28; }
  if (level == 17) { return 30; }
  if (level == 18) { return 35; }
  if (level == 19) { return 40; }
  if (level == 20) { return 45; }
  if (level == 21) { return 50; }
  if (level == 22) { return 55; }
  if (level == 23) { return 60; }
  if (level == 24) { return 70; }
  if (level == 25) { return 80; }
  if (level == 26) { return 85; }
  //27级及以后
  return level + 58;
}

module.exports = {
  expLimit, expAccLimit, waterLimit
}