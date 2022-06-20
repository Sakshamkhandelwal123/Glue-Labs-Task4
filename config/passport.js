const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
require("dotenv").config();

// load up the user model
const User = require("../src/models").User;

module.exports = function (passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
    secretOrKey: process.env.SECRET_KEY,
  };

  passport.use(
    "jwt",
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        let user = await User.findByPk(jwt_payload.id);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
