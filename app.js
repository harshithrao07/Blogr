const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
var _ = require('lodash');
const app = express();
const mongoose = require("mongoose");

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-harshith:Test123@cluster0.ydoselo.mongodb.net/webprojectDB");
mongoose.set('strictQuery', true);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use( express.static( "public" ) );

const homeStartingContent = "Created by Harshith Rao."

const blogSchema = {
  title: String,
  content: String
};
const Blog = mongoose.model("Blog",blogSchema);

const userSchema = {
  fname : String,
  lname: String,
  phone: Number,
  email: String,
  username: String,
  password: String
}

const User = mongoose.model("User",userSchema);

app.post("/",function(req,res){
  const person = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    phone: req.body.phone,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });
  person.save(function(err){
    if(!err){
      res.redirect("/home");
    }
  })
});

app.post("/login",function(req,res){
  const fun = async () => {
  const result = await User.find({ username: `${req.body.username}` })
  if (result.length > 0) {
      for (let x in result) {
          if (req.body.username === result[x].username && req.body.password === result[x].password) {
              res.redirect("home");
          }
          else {
              res.redirect("fail");
          }
      }
  }
  else {
      res.redirect("fail");
  }
  }
  fun();
});


app.get("/", function(req, res) {
  res.render("index");
});

app.get("/pricing",function(req,res){
  res.render("pricing");
});

app.get("/compose",function(req,res){
  res.render("compose");
})

app.get("/fail",function(req,res){
  res.render("fail");
});

app.get("/create",function(req,res)
{
  res.render("create");
})

app.get("/home",function(req,res){
  Blog.find({},function(err,blogPosts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: blogPosts
      });
  });
});

app.get("/index",function(req,res){
  res.render("index");
});

app.post("/compose", function(req, res) {
  const post = new Blog({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  post.save(function(err){
    if(!err){
        res.redirect("/home");
    }
  });

});

app.get("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  Blog.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
        title: post.title,
        body: post.content
      });
    });
  });

  app.get("/delete/:deleteId", (req, res) => {
      let deleteId = req.params.deleteId;
      Blog.deleteOne({_id: deleteId}, (err) => {
          if (!err) {
            res.redirect("/home");
          }
      })
  })

  app.get("/update/:updateId", (req, res) => {
      let updateId = req.params.updateId;
      Blog.findOne({_id: updateId}, (err, doc) => {
          res.render("update", {title: doc.title, content: doc.content, id: updateId});
      })
  })

  app.post("/update", (req, res) => {
      const updateId = req.body.id;
      const updatedTitle = req.body.title;
      const updatedContent = req.body.post;

      Blog.updateOne({_id: updateId}, {
          title: updatedTitle,
          content: updatedContent
      }).then(() => res.redirect("/home"));
  })

// ToDoList Codes down below
  const itemSchema = {
    name: String
  };
  const Item = mongoose.model("Item",itemSchema);

  const item1 = new Item({
    name : "Welcome to your ToDoList!"
  });

  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });

  const item3 = new Item({
    name: "← Hit this to delete an item"
  });

const defaultItems = [item1, item2, item3];

  app.get("/list", function(req, res) {
    Item.find({}, function(err, foundItems){
      if(foundItems.length == 0)
      {
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Items have been successfully inserted");
          }
        });
        res.redirect("/");
      }
      else{
              const day = date.getDate()
            res.render("list", {listTitle: day, newListItems: foundItems});
      }
    });
  })

  app.post("/list", function(req, res){

    const itemName = req.body.newItem;

    const item = new Item({
      name: itemName
    });
    item.save();
    res.redirect("/list");
  });

  app.post("/delete",function(req,res){
    const checkedItemID = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(err){
        console.log(err)
      }
      else{
        console.log("Item successfully deleted");
        res.redirect("/list");
      }
    })
  });

app.listen(3000,function(){
  console.log("Server has started in port 3000");
})
