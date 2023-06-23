# Real-Time Chat Application

This repository contains a real-time chat application built using native WebSockets in Node.js. The application allows two users to engage in a real-time chat session.

## Features

- Real-time communication between two users
- WebSocket-based messaging system
- No third-party libraries like Socket.io used

## Getting Started

Follow the steps below to set up and run the application locally:

1. Clone the repository:
   
   git clone github.com/farooqpk/websocket-project
   
3. Install the dependencies:
   
   npm install
   
4. Start the application:

   npm start

5. Connect to the WebSocket server using an API testing tool like Postman or Insomnia. Set up a WebSocket connection to `ws://localhost:8080`.

6. Upon successful connection, the WebSocket server will send a unique username that you can use for chat communication.

7. To send a chat message, use the following JSON format:

```json
{
  "recipient": "farooq",
  "payload": "How are you?"
}




