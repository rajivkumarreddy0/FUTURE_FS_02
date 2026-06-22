const mysql = require("mysql2/promise");
require("dotenv").config();

const connectionOptions = {
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 30000,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = mysql.createPool(
  process.env.DATABASE_URL
    ? { uri: process.env.DATABASE_URL, ...connectionOptions }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "crm_db",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        ...connectionOptions,
      }
);


const initDB = async () => {
  let conn;

  try {
    // wait for Railway database startup
    await new Promise(resolve => setTimeout(resolve, 5000));

    conn = await pool.getConnection();

    console.log("✅ Database connected");


    // Admin table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);


    // Leads table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        source ENUM('Website','LinkedIn','Referral','Email','Other') DEFAULT 'Website',
        status ENUM('New','Contacted','Converted','Lost') DEFAULT 'New',
        notes TEXT,
        follow_up_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
      )
    `);



    // Create default admin
    const bcrypt = require("bcryptjs");

    const [existing] = await conn.query(
      "SELECT id FROM admins WHERE email = ?",
      [process.env.ADMIN_EMAIL]
    );


    if (existing.length === 0) {

      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );


      await conn.query(
        "INSERT INTO admins (name,email,password) VALUES (?,?,?)",
        [
          "Rajiv kumar reddy",
          process.env.ADMIN_EMAIL,
          hashedPassword
        ]
      );

      console.log("✅ Default admin created");
    }


    console.log("✅ Database initialized successfully");


  } catch (err) {

    console.error(
      "❌ Database init error:",
      err.message
    );

  } finally {

    if (conn) {
      conn.release();
    }

  }
};


module.exports = {
  pool,
  initDB
};