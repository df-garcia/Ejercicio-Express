const WebSocket = require("ws");

//lowdb config
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);

let clients = [];
let messages = db.get("messages").value();

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    messages = db.get("messages").value();
    sendMessages();

    ws.on("message", (message) => {
      db.get("messages").push(JSON.parse(message)).write();
      messages = db.get("messages").value();
      sendMessages();
    });
  });
  const sendMessages = () => {
    messages = db.get("messages").value();
    clients.forEach((client) => client.send(JSON.stringify(messages)));
  };
};

const sendMessages = () => {
  messages = db.get("messages").value();
  clients.forEach((client) => client.send(JSON.stringify(messages)));
};

exports.wsConnection = wsConnection;
exports.sendMessages = sendMessages;
