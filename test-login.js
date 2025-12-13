const http = require("http");

const data = JSON.stringify({
  email: "daharculinaryholdings@gmail.com",
  password: "Iktafa#2020",
});

const options = {
  hostname: "localhost",
  port: 4000,
  path: "/api/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);

  let responseData = "";
  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("Response:", responseData);
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
});

req.write(data);
req.end();
