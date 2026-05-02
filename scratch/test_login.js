// Test full login flow as the client would
const http = require("http");

async function testProxy(path, body) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ path, method: "POST", body });
    const options = {
      hostname: "localhost", port: 3001, path: "/api/wp-proxy",
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on("error", (e) => resolve({ status: 0, body: { error: e.message } }));
    req.write(payload); req.end();
  });
}

async function main() {
  console.log("=== Test 1: Wrong password ===");
  const r1 = await testProxy("/jwt-auth/v1/token", { username: "ks05460@gmail.com", password: "wrongpass" });
  console.log("Status:", r1.status, "| Message:", r1.body.message);

  console.log("\n=== Test 2: Unknown user ===");
  const r2 = await testProxy("/jwt-auth/v1/token", { username: "nobody@nowhere.com", password: "test" });
  console.log("Status:", r2.status, "| Message:", r2.body.message);

  console.log("\n=== Test 3: Register duplicate ===");
  const r3 = await testProxy("/pixza/v1/register", { username: "testuser999", email: "testuser999@test.com", password: "Test@12345", name: "Test" });
  console.log("Status:", r3.status, "| Message:", r3.body.message);

  console.log("\n=== Test 4: Register new user ===");
  const ts = Date.now();
  const r4 = await testProxy("/pixza/v1/register", { username: `user${ts}`, email: `user${ts}@test.com`, password: "Test@12345", name: "Test User" });
  console.log("Status:", r4.status, "| Body:", JSON.stringify(r4.body));
}

main();
