"use strict";

const mongoose     = require("mongoose");
module.exports = {
    initilize : function() {
        // reed db Configuration
      let dbConfig = require("./database.js");
      let db = mongoose.connection;

      // mayby should remove out from this file - EventEmitters?
      db.on("error", console.error.bind(console, "connection error:"));

      db.once("open", function() {
        console.log("Succesfully connected to mongoDB");
      });

      // If the Node process ends, close the Mongoose connection.
      process.on('SIGINT', function() {
          mongoose.connection.close(function () {
              console.log('Mongoose disconnected on app termination');
              process.exit(0);
          });
      });
      // Connect to the database.
      mongoose.connect(dbConfig.connectionString,{useNewUrlParser: true,useCreateIndex:true});
    }
};
