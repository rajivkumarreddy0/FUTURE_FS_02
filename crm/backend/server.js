const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");

const authRoutes = require("./routes/auth");
const leadsRoutes = require("./routes/leads");

const app = express();


// CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://future-fs-02-olive-six.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ]
}));


// middleware
app.use(express.json());


// routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);


// test route
app.get("/", (req,res)=>{
  res.json({
    message:"CRM API running ✅"
  });
});


// start server
const PORT = process.env.PORT || 5000;


app.listen(PORT, async()=>{

  console.log(`🚀 Server running on port ${PORT}`);

  try {

    await initDB();

    console.log("✅ Database ready");

  } catch(err){

    console.log("❌ Database failed");
    console.log(err.message);

  }

});