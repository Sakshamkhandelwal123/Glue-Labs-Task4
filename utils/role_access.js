function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(401).json({
        error: "You don't have enough permission to perform this action",
      });
    }
    
    next();
  };
}

module.exports = authRole;

// const { roles } = require("../src/roles/roles")
// const grantAccess = function (action, resource) {
//   return async (req, res, next) => {
//     try {
//       const permission = roles.can(req.user.role)[action](resource);
//       if (!permission.granted) {
//         return res.status(401).json({
//           error: "You don't have enough permission to perform this action",
//         });
//       }
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// module.exports = grantAccess;
