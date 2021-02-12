var AV = require('leanengine');
var { OBJECT_ID_USER_WATER,
  OBJECT_ID_USER_EXP,
  OBJECT_ID_USER_CHARGE,
  OBJECT_ID_USER_MONEY_CHARGE,
  OBJECT_ID_USER_CURRENCY } = require('./id');
var { ITEM_Package } = require('./type');

AV.Cloud.define('useItem', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName"));
  }
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
      const head2 = JSON.parse(head.structure);
      console.log(head);
      console.log(item.get("subtype"));
      console.log(head2.items);
      if (item.get("subtype") == ITEM_Package) {
        if (head2.items) {
          return AV.Cloud.run('receiveItems', {
            items: head2.items
          }, { user: user });
        }
      }
    })
    .then((res) => {
      if (res) {
        return ownItem.save(null, {
          query: new AV.Query('OwnItem').greaterThanOrEqualTo('count', count),
          fetchWhenSave: true
        })
      }
    })
    .then((ownItem) => {
      if (ownItem) {
        console.log(`当前数量为：${ownItem.get('count')}`);
        console.log(`当前数量为：${ownItem}`);
        return ownItem;
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

AV.Cloud.define('receiveItems', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName"));
  }
  var rewards = request.params.items;
  var rewardMap = new Map();
  const rewardIds = rewards.map(it => {
    rewardMap.set(it.uuid, it.count);
    return it.uuid;
  });
  console.log(`当前items为：${rewardMap}`);
  const innerQuery = new AV.Query('Block');
  innerQuery.containedIn("objectId", rewardIds)
  return new AV.Query('OwnItem')
    .include("user")
    .include("item")
    .matchesQuery('item', innerQuery)
    .find()
    .then((ownItems) => {
      console.log("333");
      console.log(ownItems);
      for (let ownItem of ownItems) {
        const user = ownItem.get("user");
        const item = ownItem.get("item");
        const count = ownItem.get("count");
        console.log("user=" + user.get("nickName") + ", item=" + item.get("title") + ", count=" + count);
      }
      const Block = AV.Object.extend('Block');
      const OwnItem = AV.Object.extend('OwnItem');
      if (ownItems) {
        for (let ownItem of ownItems) {
          const uuid = ownItem.get("item").get("objectId");
          console.log(uuid);
          ownItem.set("count", ownItem.get("count") + rewardMap.get(uuid));
          rewardMap.delete(uuid);
        }
        for (let uuid of rewardMap.keys()) {
          console.log(uuid);
          const ownItem = new OwnItem();
          ownItem.set("user", user);
          ownItem.set("item", AV.Object.createWithoutData("Block", uuid));
          ownItem.set("count", rewardMap[uuid]);
          ownItems.push(ownItem);
        }
        return ownItems;
      } else {
        //都是新的
        const newOwnItems = rewards.map(it => {
          const ownItem = new OwnItem();
          ownItem.set("user", user);
          const item = Block.createWithoutData("Block", it.uuid);
          ownItem.set("item", item);
          ownItem.set("count", it.count);
          return ownItem;
        });
        return newOwnItems;
      }
    })
    .then((newOwnItems) => {
      console.log("444");
      var hits = false;
      for (let ownItem of newOwnItems) {
        const user = ownItem.get("user");
        const item = ownItem.get("item");
        const count = ownItem.get("count");
        console.log("user=" + user.get("nickName") + ", item=" + item.get("title") + ", count=" + count);
        const id = item.get("objectId");
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