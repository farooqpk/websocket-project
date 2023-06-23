const http = require("http");
const { EventEmitter } = require("events");
const {
  generateAcceptValue,
} = require("../utils/acceptUtils/generateAcceptValue");
const {
  generateUniqueUserName,
} = require("../utils/userNameUtils/generateUniqueUserName");
const { createFrame } = require("../utils/frameUtils/createFrame");
const { parseFrame } = require("../utils/frameUtils/parseFrame");

// ..............................................................................................//

// here we extending EventEmitter class to create events
class WebSocketServer extends EventEmitter {
  constructor() {
    super();
    // this globally unique identifier used to create acceptvalue to send with acceptance header
    this.GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    // Map is used to store key value (here we used to store users with their username)
    this.clients = new Map();
    // The opcode specifies the type/purpose of data contained within the frame
    this.OPCODES = { text: 0x01, close: 0x08 };
    this.init();
  }

  init() {
    if (this.server) throw new Error("Server already initialized");
    try {
      this.createServer();
      this.setupUpgradeServer();
    } catch (error) {
      console.error("Error initializing WebSocket server:", error);
    }
  }

  // create http server
  createServer() {
    this.server = http.createServer((req, res) => {
      // if make normal http request then we send upgrade requried status code
      const UPGRADE_REQUIRED = 426;
      const body = http.STATUS_CODES[UPGRADE_REQUIRED];
      res.writeHead(UPGRADE_REQUIRED, {
        "Content-Type": "text/plain",
        Upgrade: "WebSocket",
      });
      res.end(body);
    });
  }

  setupUpgradeServer() {
    // handshake between server and client
    // here we upgrade from http server to websocket server
    this.server.on("upgrade", (req, socket) => {
      // if there is no websocket header we well return 400
      if (req.headers.upgrade !== "websocket") {
        socket.end("HTTP/1.1 400 Bad Request");
        return;
      }

      const acceptKey = req.headers["sec-websocket-key"];
      // here we pass both acceptkey(from client) and GUID to create acceptValue
      const acceptValue = generateAcceptValue(acceptKey, this.GUID);

      // handshake acceptance header
      const responseHeaders = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${acceptValue}`,
      ];

      // Create a new user
      const user = {
        username: generateUniqueUserName(),
        socket,
      };
      //add the user to map
      this.clients.set(user.username, user);

      // send header as a acceptance of handshake
      // "\r\n" is used to break to new line
      socket.write(responseHeaders.concat("\r\n").join("\r\n"));

      //...HANDSHAKE COMPLETED... //

      // when user created we send his username to send msg each other
      // also we should send data as frame after websocket connection established
      socket.write(createFrame(`your username is: ${user.username}`));

      //data event
      socket.on("data", (buffer) => {
        // we will get buffer data in the form of frame
        this.handleData(user, buffer);
      });
    });
  }


  handleData(user, buffer) {
    const message = parseFrame(buffer, this.OPCODES);

    // if opcode is close
    if (message === this.OPCODES.close) {
      user.socket.write(createFrame("connection is closed"));
      user.socket.destroy();
      this.clients.delete(user.username);
      return;
    }

    if (message) {
      try {
        const Msgdata = JSON.parse(message);
        if (
          !Msgdata.recipient ||
          !Msgdata.payload ||
          Msgdata.recipient === "" ||
          Msgdata.payload === ""
        ) {
          user.socket.write(
            createFrame({
              ErrMsg: `Invalid message format: Missing recipient or payload`,
            })
          );
          return;
        } else {
          // if correct formate
          this.sendMessage(user.username, Msgdata.recipient, Msgdata.payload);
        }
      } catch (error) {
        user.socket.write(
          createFrame({
            ErrMsg: "Invalid message format: Must be in JSON format",
          })
        );
        return;
      }
    } else {
      user.socket.write(createFrame({ ErrMsg: "message shouldn't be empty!" }));
      return;
    }
  }


  sendMessage(senderName, recipientName, payload) {
    // access recipeient from client map
    const recipient = this.clients.get(recipientName);

    if (recipient) {
      // construct the message object
      const message = {
        sender: senderName,
        payload: payload,
      };

      //send message to the recipient
      recipient.socket.write(createFrame(message));
    } else {
      // return message to user to indicate recipent not found
      const user = this.clients.get(senderName);
      user.socket.write(createFrame({ ErrMsg: `${recipientName} not found` }));
    }
  }

  listen(port) {
    this.server.listen(port, () =>
      console.log(`WebSocket server listening on port ${port}`)
    );
  }
}

const ws = new WebSocketServer();

ws.listen(8080);
