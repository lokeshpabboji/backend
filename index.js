const express  = require("express");
const cors = require('cors');
const rootRouter =  require("./routes/index");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/v1", rootRouter);



app.listen(3000, () => {
    console.log("app is listening on port 3000");
})