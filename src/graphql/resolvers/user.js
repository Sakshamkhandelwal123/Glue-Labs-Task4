const User = require("../../models").User;
let refreshTokens = [];
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../../../config/passport")(passport);

const userResolvers = {
  Mutation: {
    SignUp: (parent, { newUser }) => {
      User.create({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role || "basic",
        accessToken: jwt.sign({ username: newUser.username }, "nodeauthsecret", {
          expiresIn: 86400 * 30,
        }),
        refreshToken: jwt.sign(
          { username: newUser.username },
          "nodeauthsecret",
          { expiresIn: 86400 * 365 }
        ),
      })
        .then((user) => {
          refreshTokens.push(user.refreshToken)
          return user;
        })
        .catch((error) => {
          throw new Error(error);
        });
    },
    LogIn: (parent, { oldUser }) => {
      User.findOne({
        where: {
          username: oldUser.username,
        },
      })
        .then((user) => {
          if (!user) {
            throw new Error("Authentication failed. User not found.")
          }
          user.comparePassword(oldUser.password, (err, isMatch) => {
            if (isMatch && !err) {
              var token = jwt.sign(
                JSON.parse(JSON.stringify(user)),
                "nodeauthsecret",
                { expiresIn: 86400 * 30 }
              );
    
              var token2 = jwt.sign(
                JSON.parse(JSON.stringify(user)),
                "nodeauthsecret",
                { expiresIn: 86400 * 365 }
              );
    
              jwt.verify(token, "nodeauthsecret", function (err, data) {
                if (err) {
                  throw new Error(err);
                }
              });
    
              jwt.verify(token2, "nodeauthsecret", function (err, data) {
                if (err) {
                  throw new Error(err);
                } 
              });
    
              return({
                success: true,
                accessToken: "JWT " + token,
                refreshToken: "JWT " + token2,
                role: user.role,
              });
            } else {
                throw new Error("Authentication failed. Wrong password.")
            }
          });
        })
        .catch((error) => {throw new Error(error)});
    }
  },
};

module.exports = userResolvers;
