const ws = new WebSocket("ws://localhost:3000");

ws.onmessage = (msg) => {
  renderMessages(JSON.parse(msg.data));
};

const renderMessages = (data) => {
  const html = data
    .map(
      (item) => `<p>${item.author} says: ${item.message} (ts: ${item.ts})</p>`
    )
    .join(" ");
  document.getElementById("messages").innerHTML = html;
};

const handleSubmit = (evt) => {
  evt.preventDefault();
  const message = document.getElementById("message");
  const author = document.getElementById("author");
  const ts = new Date().getTime();

  newMsg = {
    message: message.value,
    author: author.value,
    ts: ts.toString(),
  };
  //console.log(newMsg);
  ws.send(JSON.stringify(newMsg));
  message.value = "";
  author.value = "";
};

const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit);
