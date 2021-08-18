const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://admin-divyanshu:me@mongodb@cluster0.i4kl3.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect("mongodb://divyanshu:adminuser@cluster0.i4kl3.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = {
  name= {
    type : String,
    // required: true,
  }
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "<-- Click to Delete"
})

const item2 = new Item({
  name: "Click (+) to Add "
})

const defItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function (err, foundList) {
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName==="Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;

if (listName==="Today") {
  Item.findByIdAndDelete(checkeditemId, function(err){
    if (err) {
      console.log(err);
    }
    res.redirect("/")
  }); 
} else {
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkeditemId}}}, function(err, foundList){
    if (!err) {
      res.redirect("/"+listName);
    }
  });
}
});

app.listen(3000, function () {
  console.log("Server has started...");
});
