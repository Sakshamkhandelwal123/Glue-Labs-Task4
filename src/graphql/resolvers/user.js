const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();

const User = require("../../models").User;
require("../../../config/passport")(passport);

let refreshTokens = [];

const userResolvers = {
  Mutation: {
    SignUp: async (parent, { newUser }) => {
      const { username, password, role } = newUser;
      let user;

      try {
        user = await User.create({
          username,
          password,
          role,
          
          accessToken: jwt.sign({ username }, process.env.SECRET_KEY, {
            expiresIn: 86400 * 30,
          }),
          
          refreshToken: jwt.sign({ username }, process.env.SECRET_KEY, {
            expiresIn: 86400 * 365,
          }),
        });

        refreshTokens.push(user.refreshToken);

        return user;
      } catch (error) {
        throw new Error(error);
      }
    },

    LogIn: async (parent, { oldUser }) => {
      const { username, password } = oldUser;
      let user;

      try {
        user = await User.findOne({
          where: {
            username,
          },
        });

        if (!user) {
          throw new Error("Authentication failed. User not found.");
        }

        user.comparePassword(password, (err, isMatch) => {
          if (isMatch && !err) {
            
            var token = jwt.sign(
              JSON.parse(JSON.stringify(user)),
              process.env.SECRET_KEY,
              { expiresIn: 86400 * 30 }
            );

            var token2 = jwt.sign(
              JSON.parse(JSON.stringify(user)),
              process.env.SECRET_KEY,
              { expiresIn: 86400 * 365 }
            );

            jwt.verify(token, process.env.SECRET_KEY, function (err, data) {
              if (err) {
                throw new Error(err);
              }
            });

            jwt.verify(token2, process.env.SECRET_KEY, function (err, data) {
              if (err) {
                throw new Error(err);
              }
            });

            return {
              success: true,
              accessToken: `JWT ${token}`,
              refreshToken: `JWT ${token2}`,
              role: user.role,
            };
          } 
          
          throw new Error("Authentication failed. Wrong password.");
        });
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = userResolvers;
