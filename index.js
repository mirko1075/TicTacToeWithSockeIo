const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.static('public'))
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: ["http://localhost", "http://localhost:5000"],
        methods: ["GET", "POST"],
        allowedHeaders: [],
        credentials: true,
    },
});
let players = {},
    unmatched;


io.sockets.on("connection", (socket) => {
    const {
        id
    } = socket;
    console.log("socket connected", id)
    console.log('players :>> ', players);
    socket.emit('hello', {
        msg: "hello"
    })
    joinGame(socket);

    if (getOpponent(socket)) {
        socket.emit("game.begin", {
            symbol: players[id].symbol,
        });
        getOpponent(socket).emit("game.begin", {
            symbol: players[getOpponent(socket).id].symbol,
        });
    }

    socket.on("make.move", (data) => {
        if (!getOpponent(socket)) {
            return;
        }
        socket.emit("move.made", data);
        getOpponent(socket).emit("move.made", data);
    });

    socket.on("disconnect", () => {
        if (getOpponent(socket)) {
            getOpponent(socket).emit("opponent.left");
        }
    });
});

const joinGame = (socket) => {
    const {
        id
    } = socket;
    players[id] = {
        opponent: unmatched,

        symbol: "X",
        // The socket that is associated with this player
        socket: socket,
    };
    if (unmatched) {
        players[id].symbol = "O";
        players[unmatched].opponent = id;
        unmatched = null;
    } else {
        unmatched = id;
    }
}

const getOpponent = (socket) => {
    const {
        id
    } = socket;
    if (!players[id].opponent) {
        return;
    }
    return players[players[id].opponent].socket;
}

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));