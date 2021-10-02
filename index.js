let express = require("express");
let app = express();
app.use(express.static('public'));
const port = 5000
let http = require('http').createServer(app);
let io = require('socket.io')(http)

http.listen(port, () => console.log("Server is listening on port " + port))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let players = {};

io.sockets.on("connection", (socket) => {
    console.log("Connected");
    socket.emit('connect', {
        mssg: 'Hola'
    })

    //Join game func
    joinGame(socket);
    //If there is an opponent connected start game
    if (getOpponent(socket)) {
        socket.emit("game.begin", {
            symbol: players[getOpponent(socket).id].symbol,
        })
    }
    socket.on('make.move', (data) => {
        if (!getOpponent(socket)) return;
        socket.emit("move.made", data)
        getOpponent(socket).emit("move.made", data)
    })
    socket.on("disconnect", () => {
        if (getOpponent(socket)) {
            getOpponent(socket).emit("opponent.left")
        }
    })
})

//Func to join game

const joinGame = (socket) => {
    const {
        id
    } = socket;
    players[id] = {
        opponent: unmatched,
        symbol: "X",
        socket: socket
    }
    if (unmatched) {
        players[id].symbol = "O",
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