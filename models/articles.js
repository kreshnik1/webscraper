"use strict";

let mongoose = require("mongoose");

let ArticlesSchema = mongoose.Schema({
	url:{type:String,required:true, unique:true},
	name:{type:String,required:true},
	price:{type:String,required:true},
    photo_url:{type:String,default: true},
	barcode: { type: String, required: true, unique:true },
    categories :[{type:String}]
});

let Articles = mongoose.model("Articles", ArticlesSchema);

module.exports = Articles;