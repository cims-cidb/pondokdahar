const fs = require("fs");
const path = require("path");

const routesDir = path.join(__dirname, "routes");

console.log("CHECKING ROUTES IMPORT...");

fs.readdirSync(routesDir).forEach((file) => {
  const routePath = "./routes/" + file;
  try {
    require(routePath);
    console.log("OK:", file);
  } catch (err) {
    console.log("ERROR in", file, "=>", err.message);
  }
});
