import express from "express";
import fs from "fs";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";

let userData = JSON.parse(fs.readFileSync("./data/users.json", { encoding: "utf-8" }));
let reelsData = JSON.parse(fs.readFileSync("./data/reels.json", { encoding: "utf-8" }));

const date = new Date();
reelsData.forEach((reel) => (reel.createdAt = (date.getDate() + Math.random() * 10).toString()));

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(compression());
app.use(cors({ origin: "*" }));

// app.get("/", (req, res) => {
//   return res.send("Hello there! ✨✨");
// });
app.get("/users", (req, res) => {
  res.json(userData);
});

app.get("/users/:username", (req, res) => {
  let user = userData.filter((user) =>
    user.username.toLowerCase().includes(req.params.username.toLowerCase()),
  );
  res.json(user);
});

app.post("/users", async (req, res) => {
  let newUser = { ...req.body };
  try {
    userData.push(newUser);
    await fs.promises.writeFile("./data/users.json", JSON.stringify(userData));
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  return res.status(201).json({ newUser });
});

app.patch("/users/:username", async (req, res) => {
  let userIndex = userData.findIndex(
    (user) => user.username.toLowerCase() === req.params.username.toLowerCase(),
  );
  if (userIndex < 0) {
    return res
      .status(404)
      .json({ message: `No user found with username "${req.params.username}"` });
  }
  userData[userIndex] = req.body;
  await fs.promises.writeFile("./data/users.json", JSON.stringify(userData));
  res.json(userData[userIndex]);
});

app.get("/reels", (req, res) => {
  res.json(reelsData);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});
