const express = require("express");
const bodyParser =  require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname +"/date.js");
const _ = require("lodash");
const app= express();
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome"
});
const item2 = new Item({
  name: "Add"
});
const item3 = new Item({
  name: "Delete"
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  item: [itemsSchema]
}
const List = mongoose.model("List", listSchema);




app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.get("/",function(req,res){
  Item.find({}, function(err, resultItems){
    if (resultItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully inserted many");
        }
      });
      res.redirect("/");
    }

    else{
    res.render("lists" , {listTitle:"Today", newListItems : resultItems});
  }
  })
  //let day = date();
});
app.post("/",function(req,res){
  let itemName = req.body.newItem;
  let listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.item.push(item);
      foundList.save();
      res.redirect("/" +listName);
    });
  }
});
app.post("/delete",function(req,res){
  const checked = req.body.checkBox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checked,function(err){
      if (!err){
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull:{item: {_id: checked}}}, function(err, foundList){
      res.redirect("/" + listName);
  });
}
});
app.listen("3000",function(){
  console.log("radhika");
});
app.get("/:parameterName",function(req, res){
  const parameterName = _.capitalize(req.params.parameterName);

  List.findOne({name: parameterName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("Doesn't Exist")
        const list =  new List({
          name: parameterName,
          item: defaultItems
        });
        list.save();
        res.redirect("/" + parameterName);
      }
      else{
        console.log("Exists")
        res.render("lists" , {listTitle: foundList.name, newListItems : foundList.item});
      }
    }
  });

});
