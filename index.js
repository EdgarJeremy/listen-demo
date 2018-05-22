const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const listener = require("./src/listener");
const bodyParser = require("body-parser");
const session = require("express-session");
const uuid = require("uuid/v4");
const PORT = 3000;

/**
 * Middleware & setups
 */
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(session({
    secret: "exilevilify",
    cookie: {
        maxAge: 36000000
    },
    resave: true,
    saveUninitialized: false
}));
listener.listen(io);
app.use((req,res,next) => {
    req.socketid = req.headers["x-socket-id"];
    next();
});
/**
 * Routes
 */
app.post("/login", (req, res) => {
    let post = req.body;
    post.id = uuid();
    post.socketid = req.socketid;
    /** 
     * Query database untuk login disini
     * Silahkan letakkan tiga line dibawah setelah data berhasil di retrieve dari database.
     */
    listener.addUser(post);
    req.session.userdata = post;
    res.json({ status: true, data: req.session.userdata });
});

app.get("/cek_status", (req, res) => {
    let userdata = req.session.userdata;
    if(userdata) {
        userdata.socketid = req.socketid;
        listener.addUser(userdata);
    }
    res.json({ status: userdata ? true : false, data: userdata });
});

app.get("/logout", (req, res) => {
    let id = req.session.userdata.id;
    req.session.destroy((err) => {
        console.log(err);
        if(!err) listener.logoutUser(id);
        res.json({ status: err === undefined });
    });
});

server.listen(PORT, () => {
    console.log(`Server running di port ${PORT}`);
});