import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  console.log("Register API Hit");
  try {
    const { name, email, password } = req.body;

    const [existing] = await db.execute("SELECT id FROM users WHERE email=?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO users(name,email,password)
           VALUES(?,?,?)`,
      [name, email, hashedPassword],
    );

    res.json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {

    console.log("========== LOGIN ==========");
    console.log("Body:", req.body);

    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Password:", password);

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      success: true,

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};