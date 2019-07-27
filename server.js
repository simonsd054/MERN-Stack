const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const todoRoutes = express.Router();
const PORT = process.env.PORT || 4000;
const mongoose = require("mongoose");

require("dotenv").config();

// ... other imports
const path = require("path");

let Todo = require("./todo.model");

// ... other app.use middleware
app.use(express.static(path.join(__dirname, "client", "build")));

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(
  process.env.MONGOLAB_URI || "mongodb://127.0.0.1:27017/todos",
  { useNewUrlParser: true }
);
const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established succesfully");
});

todoRoutes.route("/").get(function(req, res) {
  Todo.find(function(err, todos) {
    if (err) {
      console.log(err);
    } else {
      res.json(todos);
    }
  });
});

todoRoutes.route("/:id").get(function(req, res) {
  let id = req.params.id;
  Todo.findById(id, function(err, todo) {
    res.json(todo);
  });
});

todoRoutes.route("/add").post(function(req, res) {
  let todo = new Todo(req.body);
  todo
    .save()
    .then(todo => {
      res.status(200).json({ todo: "todo added succesfully" });
    })
    .catch(err => {
      res.json(400).send("adding new todo failed");
    });
});

todoRoutes.route("/update/:id").post(function(req, res) {
  Todo.findById(req.params.id, function(err, todo) {
    if (!todo) res.status(400).json("data is not found");
    else todo.todo_description = req.body.todo_description;
    todo.todo_responsible = req.body.todo_responsible;
    todo.todo_priority = req.body.todo_priority;
    todo.todo_completed = req.body.todo_completed;

    todo
      .save()
      .then(todo => {
        res.json("Todo Completed");
      })
      .catch(err => {
        res.status(400).json("update not possible");
      });
  });
});

app.use("/todos", todoRoutes);

// Right before your app.listen(), add this:
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, function() {
  console.log("Server is running on PORT:" + PORT);
});
