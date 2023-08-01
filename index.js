const http = require("http");
const webSocket = require("websocket").server;
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(9090, () => {
  console.log("express listening on port 9090");
});

const httpServer = http.createServer();

httpServer.listen(3000, () => {
  console.log("http listening at port 3000");
});

// Web Socket code
const webSocketServer = new webSocket({
  httpServer: httpServer,
});

const clients = {};
const games = {};

webSocketServer.on("request", (request) => {
  // connect
  const connection = request.accept(null, request.origin);
  // events
  connection.on("open", () => {
    console.log("opened");
  });
  connection.on("close", () => {
    console.log("closed");
  });
  connection.on("message", (message) => {
    const result = JSON.parse(message.utf8Data);
    // If the user want to create a new game
    if (result.method === "create") {
      const clientId = result.clientId;
      const gameId = uuidv4();
      games[gameId] = {
        id: gameId,
        createdBy: clientId,
        clients: [],
      };
      connection.send(
        JSON.stringify({
          method: "create",
          game: {
            gameId: gameId,
          },
        })
      );
    }
    else if(result.method === "join") {
      const clientId = result.clientId;
      const gameId = result.gameId;
      const game = games[gameId];
      if(game.clients.length < 2) {
              game.clients.push({
                id: clientId,
                totalRuns: 0,
                outCount: 0,
              });
              const clientDetail = game.clients.filter(
                (client) => client.id === clientId
              );
              let joinPayload = {
                method: "join",
                game: {
                  gameId: result.gameId,
                  totalRuns: clientDetail.totalRuns,
                  outCount: clientDetail.outCount,
                  clients: game.clients,
                },
              };
              // Send all clients this message whenever a new client joins
              game.clients.forEach((client) => {
                // Every client have a different connection
                clients[client.id].connection.send(JSON.stringify(joinPayload));
              });
      }
      // In real game before pushing client we also need to check wether the client is already joined or not.
    }
    else if(result.method === "play") {
      updateGameState();
      let cId = result.clientId;
      let gId = result.gameId;
      let rScored = result.runsScored;
      const clientIndex = games[gId].clients.findIndex(
        (client) => client.id === cId
      );
      if(rScored === 0) {
        if (clientIndex !== -1) {
          if (games[gId].clients[clientIndex].outCount !== 3) {
            games[gId].clients[clientIndex].totalRuns += 0;
            games[gId].clients[clientIndex].outCount += 1;
          }
        }
      }
      else if(rScored === 1 || rScored === 2) {
        if (clientIndex !== -1) {
          if (games[gId].clients[clientIndex].outCount !== 3) {
            games[gId].clients[clientIndex].totalRuns += 2;
          }
        }
      }
      else if(rScored === 3 || rScored === 4) {
        if (clientIndex !== -1) {
          if (games[gId].clients[clientIndex].outCount !== 3) {
            games[gId].clients[clientIndex].totalRuns += 4;
          }
        }
      }
      else if(rScored === 5 || rScored === 6) {
        if (clientIndex !== -1) {
          if (games[gId].clients[clientIndex].outCount !== 3) { 
            games[gId].clients[clientIndex].totalRuns += 6;
          }
        }
      }
      else if(rScored === 7 || rScored === 8) {
        if (clientIndex !== -1) {
          if (games[gId].clients[clientIndex].outCount !== 3) {
            games[gId].clients[clientIndex].totalRuns += 1;
          }
        }
      }
    }
  });
  // generate a new client Id -> Will use mongodb next time
  const clientId = uuidv4();
  clients[clientId] = {
    connection: connection,
  };
  const payLoad = {
    method: "connect",
    clientId: clientId,
  };
  // Send back the client connect
  connection.send(JSON.stringify(payLoad));
});

function updateGameState () {
  const gamesList = Object.keys(games);
  for(const g of gamesList) {
    let updatePayload = {
      "method": "update",
      "game": games[g],
    }
    Object.values(games[g].clients).forEach((c) => {
      clients[c.id].connection.send(JSON.stringify(updatePayload));
    });
  }
  setTimeout(updateGameState,500);
}
