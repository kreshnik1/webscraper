var pageLoad = require('./pageLoader')
const rp = require('request-promise');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

var j = 0,m=0;
var categories_title = [];
var categories_links = [];
var subcategories_links = [];
var articles_urls = [];
var articles = [];
var plus_urls = [];
var plusarticles_urls = [];
var km = 1,mn=0;
let Articles = require("./models/articles.js");

require("./config/dbHelper").initilize();


/*
rp(options1)
    .then(($) => {
         categories_title = [];
         categories_links = [];

        $('.js-sidebarNavList .SidebarNav-headingLink .SidebarNav-headingTitle').each(function(i,link){
            categories_title.push($(link).text());
        });

        $('.js-sidebarNavList .SidebarNav-headingLink ').each(function(i,link){
            categories_links.push($(link).attr("href"));
        });

    categories_links.forEach(function(i){


        const options2 = {
              uri: `https://www.coop.se/`+i,
              transform: function (body) {
                return cheerio.load(body);
              }
            };
            rp(options2)
                .then(($) => {
                console.log($('.u-marginBsm h1').text()+"/n")
                    $('.js-sidebarNavList .SidebarNav-panel  .SidebarNav-heading .SidebarNav-headingLink').each(function(i,link){
                        console.log($(link).attr('href'))

                    });
                    console.log("----------")

                })
                .catch((err) => {
                    console.log(err);
                });
    })

    })
    .then(($) =>{
         console.log("Hey")
    })
    .catch((err) => {
        console.log(err);
    });*/

    pageLoad.fetch('https://www.coop.se/handla-online/').then(function (data) {
        var $ = cheerio.load(data)
        $('.js-sidebarNavList .SidebarNav-headingLink ').each(function(i,link){
            categories_links.push($(link).attr("href"));
            console.log($(link).attr("href"));
        });
        return categories_links;
    }).then(function(){
        return new Promise(function (resolve, reject) {
        categories_links.forEach(function(i){
            pageLoad.fetch('https://www.coop.se/'+i).then(function(data){
                var $ = cheerio.load(data);
                console.log($('.u-marginBsm h1').text()+"/n")
                        $('.js-sidebarNavList .SidebarNav-panel  .SidebarNav-heading .SidebarNav-headingLink').each(function(i,link){
                            j++;
                            subcategories_links.push($(link).attr('href'));
                            console.log($(link).attr('href') + "   " + j)
                    });
                    console.log("----------")
                })

        })
        resolve(subcategories_links);
        })
    })
    .then(function(){

        setTimeout(function(){
            var subsub = [];
            //ktu e boj per 5 linqe
            //teeshtej osht per gjithq
            console.log("---length__"+subcategories_links.length)
            for(var i = 0 ; i < 5 ; i++){
                subsub.push(subcategories_links[i]);
            }
            subsub.forEach(function(i){
                pageLoad.fetch('https://www.coop.se/'+i).then(function(data){
                    var $ = cheerio.load(data);
                    $('.Grid-cell .ItemTeaser-content .ItemTeaser-link ').each(function(i,link){
                       articles_urls.push($(link).attr('href'));
                      //console.log(mn+" - "+$(link).attr('href'))
                        mn++;
                    })
                    $('.Pagination  .Pagination-page').each(function(i,link){
                        if($(link).attr('href')){
                            plus_urls.push($(link).attr('href'));
                            //console.log("PLUS --> " + $(link).attr('href'));
                        }
                    })

                })
            })
        },35000)
    })
    .then(function(){
        setTimeout(function(){
            console.log(articles_urls.length);
            console.log(plus_urls.length)
            articles_urls.forEach(function(i){
                var options2 = {
                  uri: `https://www.coop.se`+i,
                  transform: function (body) {
                    return cheerio.load(body);
                  }
                };
                rp(options2)
                .then(($) => {
                    var categories = [];
                    console.log(km)
                    km++;
                    var code = $('.u-marginBmd').last().text();


                   // console.log(code)
                    var code_split1 = code.split(":");
                    var code_split2 =  code_split1[1].split("\n");
                    var code_split3 = code_split2[0].split(" ");
                    var barcode = code_split3[1];
                    //categories
                    $('.Breadcrumb-container .Breadcrumb-item span').each(function(i,link){
                        categories.push($(link).text());
                    })
                    //ingrediens
                    $('.Tab-panel').each(function(i,link){
                        if($(link).attr('data-id') == '#facts'){
                            //var $$ = $(link).html();
                            $('.u-marginBmd').each(function(i,link){
                                console.log('----------------'+$(link).text()+'------------------');
                            })
                        }
                    })
                    console.log("Article name : "+ $('.ItemInfo-heading').text() + " , " + " - Price : "+$('.ItemInfo-price > span').attr('content')+ " barcode : " + barcode+ " categories : "+categories);

                    let ArticlesData = new Articles({
                        url:'https://www.coop.se'+i,
                        name : $('.ItemInfo-heading').text(),
                        price : $('.ItemInfo-price > span').attr('content'),
                        photo_url : $('.ItemInfo-image img').attr('src'),
                        barcode : barcode,
                        categories:categories
                    });
                //creating the snippet with datas that we need in database
                    Articles.create(ArticlesData, function (error, user) {
                        if (error) {
                            let string = error.message;
                            console.log(string)
                           // return response.redirect('/create');
                          } else {
                              console.log("PO")
                          }
                        });
                })
                .catch((err) => {
                    console.log(err);
                });


            //console.log(i);
           /*
                pageLoad.fetch('https://www.coop.se/'+i).then(function(data){
                    var categories = [];
                    console.log(km)
                    km++;
                    var $ = cheerio.load(data);
                    var code = $('.u-marginBmd').last().text();

                   // console.log(code)
                    var code_split1 = code.split(":");
                    var code_split2 =  code_split1[1].split("\n");
                    var code_split3 = code_split2[0].split(" ");
                    var barcode = code_split3[1];
                    $('.Breadcrumb-container .Breadcrumb-item span').each(function(i,link){
                        categories.push($(link).text());
                    })
                    console.log("Article name : "+ $('.ItemInfo-heading').text() + " , " + " - Price : "+$('.ItemInfo-price > span').attr('content')+ " barcode : " + barcode+ " categories : "+categories);

                   /* let ArticlesData = new Articles({
                        url:'https://www.coop.se'+i,
                        name : $('.ItemInfo-heading').text(),
                        price : $('.ItemInfo-price > span').attr('content'),
                        photo_url : $('.ItemInfo-image img').attr('src'),
                        barcode : barcode,
                        categories:categories
                    });
                //creating the snippet with datas that we need in database
                    Articles.create(ArticlesData, function (error, user) {
                        if (error) {
                            let string = error.message;
                            console.log(string)
                           // return response.redirect('/create');
                          } else {
                              console.log("PO")
                          }
                        });
                  */
                //})
            })
        },85000)
    })/*
    .then(function(){
        setTimeout(function(){
            console.log("PLUS URLS " + plus_urls)
            plus_urls.forEach(function(i){
             pageLoad.fetch('https://www.coop.se/'+subcategories_links[5]).then(function(data){
                    var $ = cheerio.load(data);
                    $('.Grid-cell .ItemTeaser-content .ItemTeaser-link ').each(function(i,link){
                       plusarticles_urls.push($(link).attr('href'));
                    })
                })
            })
        },85000)
    })
    .then(function(){
        setTimeout(function(){
            plusarticles_urls.forEach(function(i){
                pageLoad.fetch('https://www.coop.se/'+i).then(function(data){
                    var categories = [];
                    console.log(km);
                    km++;
                    var $ = cheerio.load(data);
                    var code = $('.u-marginBmd').last().text();

                   // console.log(code)
                    var code_split1 = code.split(":");
                    var code_split2 =  code_split1[1].split("\n");
                    var code_split3 = code_split2[0].split(" ");
                    var barcode = code_split3[1];
                    $('.Breadcrumb-container .Breadcrumb-item span').each(function(i,link){
                        categories.push($(link).text());
                    })
                    console.log("PLUS : Article name : "+ $('.ItemInfo-heading').text() + " , " + " - Price : "+$('.ItemInfo-price > span').attr('content')+ " barcode : " + barcode+ " categories : "+categories);
                   /* var object = {
                        url:'https://www.coop.se'+i,
                        name : $('.ItemInfo-heading').text(),
                        price : $('.ItemInfo-price > span').attr('content'),
                        photo_url : $('.ItemInfo-image img').attr('src'),
                        barcode : barcode
                    }*//*
                    let ArticlesData = new Articles({
                        url:'https://www.coop.se'+i,
                        name : $('.ItemInfo-heading').text(),
                        price : $('.ItemInfo-price > span').attr('content'),
                        photo_url : $('.ItemInfo-image img').attr('src'),
                        barcode : barcode,
                        categories:categories
                    });
                //creating the snippet with datas that we need in database
                    Articles.create(ArticlesData, function (error, user) {
                        if (error) {
                            let string = error.message;
                            console.log(string)
                           // return response.redirect('/create');
                          } else {
                              console.log("PO")
                          }
                        });

                   //articles.push(object);
                   //console.log(object);
                })
            })
        },85000)
    })*/
    .catch(function (error) {
      console.log(error)
    })
