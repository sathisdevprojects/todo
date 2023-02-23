//jshint esversion:6
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// creating database using mongoose
mongoose.set("strictQuery", true);
mongoose
  .connect(
    "mongodb+srv://admin-sathish:S7868004273@atlascluster.6wg9fcf.mongodb.net/todoDb"
  )
  .then(() => {
    console.log("dataBaseConnected");
  })
  .catch((err) => {
    console.log(err);
  });

// creating mongoose Schema
const todoSchema = {
  name: String,
};
const Todo = mongoose.model("Todo", todoSchema);

const first = new Todo({
  name: "eg..buy a cloth..!",
});
const second = new Todo({
  name: " use + to add todo.. ✌",
});
const third = new Todo({
  name: "use checkbox to Scartch out..✔",
});
const defaultItems = [first, second, third];

const listSchema = {
  name: String,
  items: [todoSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Todo.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Todo.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("database Updated");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { kindOfDay: "Today", additem: foundItems });
    }
  });
});

// getting a post request item

app.post("/", function (req, res) {
  const newitem = req.body.newitem;
  const listname = req.body.list;
  const item = new Todo({
    name: newitem,
  });
  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listname);
    });
  }
});
app.post("/delete", function (req, res) {
  const checkId = req.body.checkBox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Todo.findByIdAndRemove(checkId, function (err) {
      if (!err) {
        console.log("deleted successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkId } } },
      function (err, found) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:post", function (req, res) {
  const listname = _.capitalize(req.params.post);

  List.findOne({ name: listname }, function (err, listdetail) {
    if (!err) {
      if (!listdetail) {
        const list = new List({
          name: listname,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + listname);
      } else {
        res.render("list", {
          kindOfDay: listdetail.name,
          additem: listdetail.items,
        });
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server strated on port 3000");
});
