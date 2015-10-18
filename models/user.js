"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    user_id: DataTypes.STRING,
    access_token: DataTypes.TEXT
  }, {});

  return User;
};