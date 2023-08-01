# Book Cricket Game
## Steps to follow -> 
1. Connect to server
2. Create Game
3. Join Game
4. Play
5. Broadcast state
6. Full Game example
7. Code!

---

__Step 1.__

Connect() function will establish a connection between your application and the book cricket game server using web socket programming.

Client <----------------> Server

---------------------> Connect();

<--------------------- JSON(clientId);

get client id from the response received after connecting successfully with the game server.

---

__Step 2.__

<em>Create Game</em>

```
Client ({
    Method: "create",
    clientId: <cuid>
})

```
``` 
Server ({
    method: "create",
    game: {
        id: <guid>,
        createdBy: <cuid>,
        clients: [],
    }
}) 
```

---
__Step 3.__

<em>Join Game</em>

```
<!-- Client who has created the game as well as other client has to join the game. -->

Client ({
    Method: "join",
    clientId: <cuid>,
    gameId: <guid>
})

```

``` 
Server ({
    method: "join",
    game: {
        id: <guid>,
        totalRuns: int,
        outCount: int,
        clients: [ cuid ]
    }
}) 
```

Client can share this game id with other users and they can join using this game id.

On joining server will broadcast a message to both the clients to show that players have gathered and are ready to play.

---

__Step4.__

<em>Play Game</em>

**Beacon request**

<em>
A type of request in which client don't wait for a response from server. 
</em>

```
Client ({
    Method: "play",
    clientId: <cuid>,
    gameId: <guid>,
    runsScored: int,
})

```

---

__Step5.__

<em>Broadcast State</em>

``` 
<!-- Server will now broadcast this message every half a second or in a second and server is the authorotaive of the state. -->

Server ({
    method: "update",
    game: {
        gameId: <guid>
        state: [
                {
                    clientId: <cuid>,
                    totalRuns: int,
                    outCount: int,
                    numberOfBallsPlayed: int
                },{
                    clientId: <cuid>,
                    totalRuns: int,
                    outCount: int,
                    numberOfBallsPlayed: int
                }
            ]
    }
}) 

```


