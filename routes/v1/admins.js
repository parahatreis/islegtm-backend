const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();
//
const { Admin } = require("../../models");
const adminAuth = require("../../middleware/adminAuth");

// @route PATCH v1/admins
// @desc Update Admin
// @access Private (Admin)
router.patch("/", adminAuth, async (req, res) => {
  const { admin_password, admin_username } = req.body;

  try {
    // Check admin exists
    let admin = await Admin.findOne({
      where: { admin_id: req.admin.id },
    });
    if (!admin) {
      return res.status(400).json({
        errors: "Admin not found",
      });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const generated_password = await bcrypt.hash(admin_password, salt);

		await Admin.update({
      admin_password: generated_password,
      admin_username,
		}, {
			where: {
				admin_id: req.admin.id
			}
		});

    // Set token(JWT)
    const payload = {
      admin: {
        id: admin.admin_id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: "300s", // it will be expired after 5min
      },
      (err, token) => {
        if (err) throw err;
        return res.json({ token });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

// @route POST v1/admins/login
// @desc Login Admin
// @access Public
router.post("/login", async (req, res) => {
  const { admin_username, admin_password } = req.body;

  if (!admin_username) return res.status(400).send("Input Admin username");
  if (!admin_password) return res.status(400).send("Input Admin password");

  try {
    // Check user exists
    let admin = await Admin.findOne({
      where: { admin_username },
    });
    if (!admin) {
      return res.status(400).json({
        errors: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(admin_password, admin.admin_password);

    if (!isMatch) {
      return res.status(400).json({
        errors: "Password fail",
      });
    }

    // Set token(JWT)
    const payload = {
      admin: {
        id: admin.admin_id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: "86400s", // it will be expired after 5min
      },
      (err, token) => {
        if (err) throw err;
        return res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route GET v1/admins/auth
// @desc Get auth admin
// @access Private(admin)
router.get("/auth", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: {
        admin_id: req.admin.id,
      },
    });

    if (!admin) return res.status(404).send("Admin not found");

    res.json(admin);
  } catch (error) {
    console.log(error);
    res.status(400).send("Server error");
  }
});

// @route GET v1/admins
// @desc Get all admins
// @access Private(admin)
router.get("/", adminAuth, async (req, res) => {
  try {
    const admins = await Admin.findAll();

    res.json(admins);
  } catch (error) {
    console.log(error);
    res.status(400).send("Server error");
  }
});

module.exports = router;
