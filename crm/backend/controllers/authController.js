const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");


// LOGIN

exports.login = async(req,res)=>{

  try {

    const {email,password}=req.body;


    if(!email || !password){

      return res.status(400).json({
        message:"Email and password required"
      });

    }


    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE email=?",
      [email]
    );


    if(rows.length===0){

      return res.status(401).json({
        message:"Invalid credentials"
      });

    }


    const admin = rows[0];


    const match = await bcrypt.compare(
      password,
      admin.password
    );


    if(!match){

      return res.status(401).json({
        message:"Invalid credentials"
      });

    }


    const token = jwt.sign(

      {
        id:admin.id,
        email:admin.email,
        name:admin.name
      },

      process.env.JWT_SECRET,

      {
        expiresIn:"8h"
      }

    );


    return res.json({

      token,

      admin:{
        id:admin.id,
        name:admin.name,
        email:admin.email
      }

    });



  }catch(error){


    console.log("LOGIN ERROR:",error);


    return res.status(500).json({

      message:"Server error",
      error:error.message

    });

  }


};



// CURRENT USER

exports.me=(req,res)=>{

  res.json({
    admin:req.admin
  });

};