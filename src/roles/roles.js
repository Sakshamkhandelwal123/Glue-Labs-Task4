const Role = {
  ADMIN: "admin",
  BASIC: "basic",
};

module.exports = Role;

// const AccessControl = require("accesscontrol");
// const ac = new AccessControl();

// exports.roles = (function () {
//   ac.grant("basic").readAny("tech");

//   ac.grant("admin")
//     .extend("basic")
//     .createAny("tech")
//     .updateAny("tech")
//     .deleteAny("tech");

//   return ac;
// })();
