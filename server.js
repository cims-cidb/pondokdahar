const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

console.log(">>> SERVER.JS LOADED AT:", __filename);
console.log(">>> REQUIRE.APP PATH:", path.resolve("./app.js"));
console.log(">>> EXIST?", require("fs").existsSync(path.resolve("./app.js")));

const app = require("./app"); // keep this
console.log(">>> APP IMPORTED FROM:", require.resolve("./app"));

// healthcheck endpoint
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER RUNNING", PORT));
