var AV = require('leanengine');
var { isFieldId, id2Field, isWaterId } = require('./id');
var { ITEM_Package } = require('./type');

/**
 * 使用物品
 */
AV.Cloud.define('useItem', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' useItem');
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
        return ownItem;
      }
    })
    .catch((error) => {
      console.log(error);
    });
});
/**
 * 获得体力
 */
AV.Cloud.define('receiveWater', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveWater');
  }
  var water = request.params.water;
  user.increment("water", water);
  return user.save();
});
/**
 * 获得经验
 */
AV.Cloud.define('receiveExp', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveExp');
  }
  var exp = request.params.exp;
  user.increment("exp", exp);
  return user.save();
});
/**
 * 获得源石
 */
AV.Cloud.define('receiveCharge', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveCharge');
  }
  var charge = request.params.charge;
  user.increment("charge", charge);
  return user.save();
});
/**
 * 获得付费源石
 */
AV.Cloud.define('receiveMoneyCharge', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveMoneyCharge');
  }
  var moneyCharge = request.params.moneyCharge;
  user.increment("moneyCharge", moneyCharge);
  return user.save();
});
/**
 * 一次写入所有字段
 */
AV.Cloud.define('receiveForUser', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveExp');
  }
  var exp = request.params.exp;
  var charge = request.params.charge;
  var moneyCharge = request.params.moneyCharge;
  var currency = request.params.currency;
  if (exp > 0) {
    user.increment("exp", exp);
  }
  if (charge > 0) {
    user.increment("charge", charge);
  }
  if (moneyCharge > 0) {
    user.increment("moneyCharge", moneyCharge);
  }
  if (currency > 0) {
    user.increment("currency", currency);
  }
  return user.save();
});
/**
 * 获得物品
 */
AV.Cloud.define('receiveItems', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveItems');
  }
  var rewards = request.params.items;
  var rewardMap = new Map();
  var rewardIds = [];
  var hits = false;
  for (const reward of rewards) {
    console.log(reward.uuid + " " + reward.count);
    const id = reward.uuid;
    const count = reward.count;
    if (isFieldId(id)) {
      if (isWaterId(id) && user.get("water") + count > 999) {
        return "领取后体力超出 999，拒绝";
      } else {
        user.increment(id2Field(id), count);
        hits = true;
      }
    } else {
      rewardIds.push(id);
      rewardMap.set(id, reward.count);
    }
  }
  if (hits) {
    user.save();
  }
  const innerQuery = new AV.Query('Block');
  innerQuery.containedIn("objectId", rewardIds)
  return new AV.Query('OwnItem')
    .matchesQuery('item', innerQuery)
    .include("user")
    .include("item")
    .include("count")
    .find()
    .then((ownItems) => {
      console.log("already owns:");
      for (let ownItem of ownItems) {
        const nickName = ownItem.get("user").get("nickName");
        const title = ownItem.get("item").get("title");
        const count = ownItem.get("count");
        console.log("user=" + nickName + ", item=" + title + ", count=" + count);
      }
      const OwnItem = AV.Object.extend('OwnItem');
      if (ownItems) {
        for (let ownItem of ownItems) {
          const uuid = ownItem.get("item").get("objectId");
          console.log(uuid);
          ownItem.set("count", ownItem.get("count") + rewardMap.get(uuid));
          rewardMap.delete(uuid);
        }
        for (let uuid of rewardMap.keys()) {
          const ownItem = new OwnItem();
          ownItem.set("user", user);
          ownItem.set("item", AV.Object.createWithoutData("Block", uuid));
          ownItem.set("count", rewardMap.get(uuid));
          ownItems.push(ownItem);
        }
        return ownItems;
      } else {
        //都是新的
        const newOwnItems = rewards.map(it => {
          const ownItem = new OwnItem();
          ownItem.set("user", user);
          ownItem.set("item", AV.Object.createWithoutData("Block", it.uuid));
          ownItem.set("count", it.count);
          return ownItem;
        });
        return newOwnItems;
      }
    })
    .then((newOwnItems) => {
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
            items: head.rewards
          }, { user: user });
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