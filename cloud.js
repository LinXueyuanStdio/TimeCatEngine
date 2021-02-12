var AV = require('leanengine');
var { OBJECT_ID_USER_WATER,
  OBJECT_ID_USER_EXP,
  OBJECT_ID_USER_CHARGE,
  OBJECT_ID_USER_MONEY_CHARGE,
  OBJECT_ID_USER_CURRENCY } = require('./id');
var { ITEM_Package } = require('./type');

AV.Cloud.define('useItem', function (request) {
  var ownItemId = request.params.ownItemId;
  var count = parseInt(request.params.count);
  const ownItem = AV.Object.createWithoutData('OwnItem', ownItemId);
  ownItem.increment('count', -count);
  return new AV.Query('OwnItem')
    .include("user")
    .include("item")
    .get(ownItemId)
    .then((ownItem) => {
      const user = ownItem.get("user");
      const item = ownItem.get("item");
      const head = JSON.parse(item.get("structure"));
      console.log(head);
      if (item.get("subtype") == ITEM_Package) {
        if (head.rewards) {
          return AV.Cloud.run('receiveItems', {
            rewards: head.items
          });
        }
      }
    })
    .then((res) => {
      return ownItem.save(null, {
        query: new AV.Query('OwnItem').greaterThanOrEqualTo('count', count),
        fetchWhenSave: true
      })
    })
    .then((ownItem) => {
      console.log(`当前数量为：${ownItem.get('count')}`);
      console.log(`当前数量为：${ownItem}`);
      return ownItem;
    });
});

AV.Cloud.define('receiveItems', function (request) {
  var rewards = request.params.rewards;
  var rewardMap = new Map();
  const rewardIds = rewards.map(it => {
    rewardMap.set(uuid, it.count);
    return it.uuid;
  });
  console.log(`当前id为：${rewards}`);
  return new AV.Query('OwnItem')
    .include("user")
    .include("item")
    .containedIn("item.objectId", rewardIds)
    .then((ownItems) => {
      const user = request.currentUser;
      const Block = AV.Object.extend('Block');
      const OwnItem = AV.Object.extend('OwnItem');
      if (ownItems) {
        for (let ownItem of ownItems) {
          const uuid = ownItem.item.objectId;
          ownItem.set("count", ownItem.get("count") + rewardMap.get(uuid));
          rewardMap.delete(uuid);
        }
        for (let reward of rewardMap) {
          const ownItem = new OwnItem();
          ownItem.set("user", user);
          const item = new Block();
          item.set("objectId", reward.uuid);
          ownItem.set("item", item);
          ownItem.set("count", reward.count);
          ownItems.push(ownItem);
        }
        return ownItems;
      } else {
        //都是新的
        const newOwnItems = rewards.map(it => {
          const ownItem = new OwnItem();
          ownItem.set("user", user);
          const item = new Block();
          item.set("objectId", it.uuid);
          ownItem.set("item", item);
          ownItem.set("count", it.count);
          return ownItem;
        });
        return newOwnItems;
      }
    })
    .then((newOwnItems) => {
      var hits = false;
      for (let ownItem of newOwnItems) {
        const item = ownItem.get("item");
        const count = ownItem.get("count");
        const id = item.get("onjectId");
        if (id == OBJECT_ID_USER_WATER) {
          user.set("water", user.get("water") + count);
          hits = true;
        } else if (id == OBJECT_ID_USER_EXP) {
          user.set("exp", user.get("exp") + count);
          hits = true;
        } else if (id == OBJECT_ID_USER_CURRENCY) {
          user.set("curency", user.get("curency") + count);
          hits = true;
        } else if (id == OBJECT_ID_USER_CHARGE) {
          user.set("charge", user.get("charge") + count);
          hits = true;
        } else if (id == OBJECT_ID_USER_MONEY_CHARGE) {
          user.set("moneyCharge", user.get("moneyCharge") + count);
          hits = true;
        }
      }
      if (hits) {
        user.save();
        newOwnItems = newOwnItems.filter((it) => {
          const id = it.get("item").get("objectId");
          const used = id == OBJECT_ID_USER_WATER ||
            id == OBJECT_ID_USER_EXP ||
            id == OBJECT_ID_USER_CHARGE ||
            id == OBJECT_ID_USER_MONEY_CHARGE ||
            id == OBJECT_ID_USER_CURRENCY
          return !used;
        })
      }
      return AV.Object.saveAll(newOwnItems);
    })
    .catch((error) => {
      console.log(error);
    });
});

AV.Cloud.define('readMail', function (request) {
  var ownMailId = request.params.ownMailId;
  console.log(`当前id为：${ownMailId}`);
  return new AV.Query('OwnMail')
    .include("user")
    .include("mail")
    .get(ownMailId)
    .then((ownMail) => {
      if (ownMail.get("receive") == true) {
        return false;
      } else {
        console.log(`当前为：${ownMail}`);
        const mail = ownMail.get("mail");
        const user = ownMail.get("user");
        const structure = mail.get("structure");
        console.log(structure);
        const head = JSON.parse(structure);
        if (head.rewards) {
          return AV.Cloud.run('receiveItems', {
            rewards: head.rewards
          });
        }
        return true;
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

AV.Cloud.define('userStatistic', function (request) {
  var query = new AV.Query('Block');
  query.equalTo('movie', request.params.movie);
  return query.find().then(function (results) {
    var sum = 0;
    for (var i = 0; i < results.length; i++) {
      sum += results[i].get('stars');
    }
    return sum / results.length;
  });
});