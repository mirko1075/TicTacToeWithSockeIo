let socket = io();
console.log('socket :>> ', socket);
let symbol;
$(function () {
    $(".board button").attr("disabled", true);
    $(".board> button").on("click", makeMove);
    socket.on("hello", (data) => {
        console.log("data", data); +
        $("#status").text("Connected!");
    })

    // Called when a user makes a move
    socket.on("move.made", function (data) {
        // Put the symbol on the board
        $("#" + data.position).text(data.symbol);
        // If the symbol is the same as the player's symbol,
        // we can assume it is their turn

        myTurn = data.symbol !== symbol;

        // If the game is still going, show who's turn it is
        if (!isGameOver()) {
            if (gameTied()) {
                $("#messages").text("Game Drawn!");
                $(".board button").attr("disabled", true);
            } else {
                renderTurnMessage();
            }
            // If the game is over
        } else {
            // Show the message for the loser
            if (myTurn) {
                $("#messages").text("Game over. You lost.");
                // Show the message for the winner
            } else {
                $("#messages").text("Game over. You won!");
            }
            // Disable the board
            $(".board button").attr("disabled", true);
        }
    });

    // Set up the initial state when the game begins
    socket.on("game.begin", function (data) {
        // The server will asign X or O to the player
        symbol = data.symbol;
        // Give X the first turn
        myTurn = symbol === "X";
        renderTurnMessage();
    });

    // Disable the board if the opponent leaves
    socket.on("opponent.left", function () {
        $("#messages").text("Your opponent left the game.");
        $(".board button").attr("disabled", true);
    });
});

function getBoardState() {
    let obj = {};
    // We will compose an object of all of the Xs and Ox
    // that are on the board
    $(".board button").each(function () {
        obj[$(this).attr("id")] = $(this).text() || "";
    });
    console.log('obj :>> ', obj);
    return obj;
}

function gameTied() {
    let state = getBoardState();
    if (
        state.a0 !== "" &&
        state.a1 !== "" &&
        state.a2 !== "" &&
        state.b0 !== "" &&
        state.b1 !== "" &&
        state.b2 !== "" &&
        state.b3 !== "" &&
        state.c0 !== "" &&
        state.c1 !== "" &&
        state.c2 !== ""
    ) {
        return true;
    }
}

function isGameOver() {
    let state = getBoardState(),
        winMatches = ["XXX", "OOO"],
        // These are all of the possible winning combinations
        boardRows = [
            state.a0 + state.a1 + state.a2,
            state.b0 + state.b1 + state.b2,
            state.c0 + state.c1 + state.c2,
            state.a0 + state.b1 + state.c2,
            state.a2 + state.b1 + state.c0,
            state.a0 + state.b0 + state.c0,
            state.a1 + state.b1 + state.c1,
            state.a2 + state.b2 + state.c2,
        ];

    // Chewck if there is a compbination of either 'XXX' or 'OOO'
    for (let i = 0; i < boardRows.length; i++) {
        if (boardRows[i] === winMatches[0] || boardRows[i] === winMatches[1]) {
            return true;
        }
    }
}

function renderTurnMessage() {
    // Disable the board when it's the opponent's turn
    if (!myTurn) {
        $("#messages").text("Your opponent's turn");
        $(".board button").attr("disabled", true);
    } else {
        // Enable the board when it is my turn
        $("#messages").text("Your turn.");
        $(".board button").removeAttr("disabled");
    }
}

function makeMove(e) {
    e.preventDefault();
    // Check if it's not my turn
    if (!myTurn) {
        return;
    }
    // The space is already checked
    if ($(this).text().length) {
        return;
    }

    // Emit the move, creting data to localize the move
    socket.emit("make.move", {
        symbol: symbol,
        position: $(this).attr("id"),
    });
}