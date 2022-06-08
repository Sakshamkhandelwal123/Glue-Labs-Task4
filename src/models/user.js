"use strict";
var bcrypt = require("bcrypt-nodejs");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      newPassword: DataTypes.STRING,
      role: {
        type: String,
        default: "basic",
        enum: ["basic", "admin"],
      },
      accessToken: {
        type: String,
      },
      refreshToken: {
        type: String,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.beforeSave((user, options) => {
    if (user.changed("password")) {
      user.password = bcrypt.hashSync(
        user.password,
        bcrypt.genSaltSync(10),
        null
      );
    }
  });

  User.prototype.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }

      cb(null, isMatch);
    });
  };

  User.prototype.changePassword = function (newPass, cb) {
    this.password = bcrypt.hashSync(newPass, bcrypt.genSaltSync(10), null);
    User.update(
      {
        newPassword: this.password,
        password: this.password,
      },
      { where: { username: this.username } }
    );

    cb(null);
  };
  return User;
};
