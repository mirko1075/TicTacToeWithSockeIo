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