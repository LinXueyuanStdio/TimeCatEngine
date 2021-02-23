var AV = require('leanengine');

// AV.Cloud.beforeSave('Post', (request) => {
//   const post = request.object;
//   if (post) {
//     var acl = new AV.ACL();
//     acl.setPublicReadAccess(true);
//     // 假定已经存在一个 `admin` 角色
//     acl.setRoleWriteAccess('admin', true);
//     post.setACL(acl);
//   } else {
//     throw new AV.Cloud.Error('Invalid Post object.');
//   }
// });