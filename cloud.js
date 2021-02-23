var AV = require('leanengine');
var { isFieldId, id2Field, isWaterId, OBJECT_ID_CUBE_STONE } = require('./id');
var { ITEM_Package, ITEM_Cube, ITEM_Data, BLOCK_COMMENT, ACTION_Like } = require('./type');

/**
 * 使用物品
 */
AV.Cloud.define('useItem', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' useItem');
  }
  var ownItemId = request.params.ownItemId;
  var itemsBatchCount = parseInt(request.params.count);
  return new AV.Query('OwnItem')
    .include("user")
    .include("item")
    .get(ownItemId)
    .then((ownItem) => {
      const user = ownItem.get("user");
      const item = ownItem.get("item");
      const head = item.get("structure");
      const head2 = head.structure;
      console.log(head);
      const subtype = item.get("subtype");
      console.log(subtype);
      if (subtype == ITEM_Package) {
        //打开礼包，获得道具
        if (head2.items) {
          return AV.Cloud.run('receiveItems', {
            items: head2.items,
            count: itemsBatchCount
          }, { user: user });
        }
      } else if (subtype == ITEM_Cube) {
        //打开方块，获得对应的方块
        return AV.Cloud.run('receiveCubes', {
          uuid: head2.uuid,
          count: itemsBatchCount
        }, { user: user });
      } else if (subtype == ITEM_Data) {
        //使用数据道具，获得数据
        const targetId = request.params.targetId;
        return AV.Cloud.run('receiveData', {
          tableName: head2.tableName,
          where: head2.where,
          num: head2.num,
          targetId: targetId,
          count: itemsBatchCount
        }, { user: user });
      }
    })
    .then((res) => {
      if (res) {
        const ownItem = AV.Object.createWithoutData('OwnItem', ownItemId);
        ownItem.increment('count', -itemsBatchCount);
        return ownItem.save(null, {
          query: new AV.Query('OwnItem').greaterThanOrEqualTo('count', itemsBatchCount),
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
 * 获得数据
 */
AV.Cloud.define('receiveData', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveData');
  }
  console.log(request.params);
  const tableName = request.params.tableName;
  const where = request.params.where;
  const num = request.params.num;
  const targetId = request.params.targetId;
  const count = request.params.count;
  const obj = AV.Object.createWithoutData(tableName, targetId);
  obj.increment(where, num * count);
  return obj.save();
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
AV.Cloud.define('receiveCubes', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveCube');
  }
  console.log(request.params);
  var cubeId = request.params.uuid;
  var count = request.params.count;
  const Block = AV.Object.extend('Block');
  const OwnCube = AV.Object.extend('OwnCube');
  const cube = Block.createWithoutData("Block", cubeId);
  return new AV.Query('OwnCube')
    .include("user")
    .include("cube")
    .equalTo("user", user)
    .equalTo("cube", cube)
    .first()
    .then((ownCube) => {
      console.log(ownCube);
      if (ownCube) {
        return AV.Cloud.run('receiveItems', {
          items: [{ uuid: OBJECT_ID_CUBE_STONE, count: 5 }],
          count: count
        }, { user: user });
      } else {
        const ownCube = new OwnCube();
        ownCube.set("user", user);
        ownCube.set("cube", cube);
        return ownCube.save();
      }
    })
    .catch((error) => {
      console.log(error);
    });
})
/**
 * 获得物品
 */
AV.Cloud.define('receiveItems', { fetchUser: true }, function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' receiveItems');
  }
  var rewards = request.params.items;
  var rewardsCount = request.params.count;
  var rewardMap = new Map();
  var rewardIds = [];
  var hits = false;
  for (const reward of rewards) {
    console.log(reward.uuid + " " + reward.count);
    const id = reward.uuid;
    const count = reward.count * rewardsCount;
    if (isFieldId(id)) {
      if (isWaterId(id) && user.get("water") + count > 999) {
        return "领取后体力超出 999，拒绝";
      } else {
        user.increment(id2Field(id), count);
        hits = true;
      }
    } else {
      rewardIds.push(id);
      rewardMap.set(id, count);
    }
  }
  if (hits) {
    user.save();
  }
  if (rewardIds.length <= 0) return;
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
    .include("receive")
    .get(ownMailId)
    .then((ownMail) => {
      if (ownMail.get("receive") == true) {
        return false;
      } else {
        console.log(`当前为：${ownMail}`);
        const mail = ownMail.get("mail");
        const user = ownMail.get("user");
        const head = mail.get("structure");
        if (head.rewards) {
          return AV.Cloud.run('receiveItems', {
            items: head.rewards,
            count: 1
          }, { user: user });
        }
        return true;
      }
    })
    .then((ans) => {
      if (ans) {
        const ownMail = AV.Object.createWithoutData('OwnMail', ownMailId);
        ownMail.set('receive', true);
        return ownMail.save();
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

AV.Cloud.define('findAllComments', function (request) {
  const user = request.currentUser;
  if (user) {
    console.log(user.get("nickName") + ' findAllComments');
  }
  const skip = request.params.skip;
  const pageSize = request.params.pageSize;
  const blockId = request.params.blockId;
  const block = AV.Object.createWithoutData("Block", blockId);
  return new AV.Query('Block')
    .equalTo('parent', block)
    .equalTo('title', blockId)
    .equalTo('type', BLOCK_COMMENT)
    .limit(pageSize)
    .skip(skip)
    .include("user")
    .find()
    .then(function (results) {
      var commentQueries = [];
      for (let comment of results) {
        const title = comment.get("title") + "/" + comment.get("objectId");
        const commentQuery = new AV.Query('Block')
          .limit(3)
          .equalTo('parent', block)
          .equalTo('type', BLOCK_COMMENT)
          .include("user")
          .startsWith("title", title)
          .addDescending("comments")
          .addDescending("likes")
          .find();
        commentQueries.push(commentQuery);
      }
      const likeQuery = new AV.Query('Action')
        .equalTo('user', user)
        .equalTo('type', ACTION_Like)
        .containedIn("block", results)
        .find();
      const main = new Promise((resolve, reject) => {
        resolve(results);
      })
      return Promise.all([main, likeQuery, ...commentQueries]);
    })
    .then(async (ans) => {
      const likes = ans[1];
      const map = new Map();
      if (likes.length > 0) {
        for (const like of likes) {
          map.set(like.get("block").get("objectId"), true);
        }
      }
      // const commentQueries = ans[0];
      const main = ans[0];
      for (let index = 0; index < main.length; index++) {
        const comment = main[index];
        const query = ans[index+2];
        // const ans = await query;
        comment.set("hot_children", query);
        const like = map.get(comment.get("objectId"));
        if (like) {
          comment.set("user_like", true);
        }
      }
      return main;
    })
    .then((comments) => {
      for (const comment of comments) {
        console.log("   " + comment.get("objectId") + " -- " + comment.get("user_like") + " -- " + comment.get("title"));
        const children = comment.get("hot_children");
        for (const child of children) {
          console.log("      " + child.get("objectId") + " -- " + child.get("title"));
        }
        console.log("----");
      }
      return comments;
    })
    .catch((error) => {
      console.log(error);
    });
});