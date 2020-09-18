var express = require("express");
var router = express.Router();
const ws = require("../wslib");
const Joi = require("joi");

//lowdb config
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// GET All Messages
router.get("/chat/api/messages", function (req, res, next) {
  const messages = db.get("messages").value();
  if (!messages) {
    return res.status(404).send("No messages found");
  }
  res.json(messages);
});

// GET A Message by TS
router.get("/chat/api/messages/:ts", function (req, res, next) {
  const ts = req.params.ts;
  const message = db.get("messages").find({ ts: ts }).value();
  if (!message) {
    return res.status(404).send("No message found");
  }
  res.json(message);
});

// POST A Message
router.post("/chat/api/messages", function (req, res, next) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .pattern(new RegExp("([A-Za-z0-9.-]+[ ][A-Za-z0-9. -]+)"))
      .required(),
    ts: Joi.string().min(5).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send("Please complete the fields (message, author)");
  }

  const newMessage = {
    id: db.get("messages").value().length + 1,
    message: req.body.message,
    author: req.body.author,
    ts: req.body.ts,
  };
  db.get("messages").push(newMessage).write();
  ws.sendMessages();
  res.json(newMessage);
});

// PUT A Message
router.put("/chat/api/messages", function (req, res, next) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .pattern(new RegExp("([A-Za-z0-9.-]+[ ][A-Za-z0-9. -]+)"))
      .required(),
    ts: Joi.string().min(5).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send("Please complete the fields (message, author)");
  }

  db.get("messages")
    .find({ ts: req.body.ts })
    .assign({ message: req.body.message, author: req.body.author })
    .write();
  ws.sendMessages();
  res.json(db.get("messages").find({ ts: req.body.ts }).value());
});

// DELETE A Message by TS
router.delete("/chat/api/messages/:ts", function (req, res, next) {
  const ts = req.params.ts;
  const message = db.get("messages").find({ ts: ts }).value();
  if (!message) {
    return res.status(404).send("The message was not found");
  }
  db.get("messages").remove({ ts: ts }).write();
  ws.sendMessages();
  res.json(message);
});

module.exports = router;
