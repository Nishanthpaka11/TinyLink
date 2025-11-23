require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 4000;
app.get("/ping",(req,res)=>{
  res.status(200).send("pong");
});
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});
app.listen(port, () => {
  console.log(`TinyLink backend running on port ${port}`);
});
