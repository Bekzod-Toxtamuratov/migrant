const pool = require("../config/db");
const bcrypt = require("bcrypt");
const myJwt = require("../services/jwt_service");
const { to } = require("../helpers/to_promise");

const { adminValidation } = require("../validations/admin.validation");

const { errorHandler } = require("../helpers/error.handler");
// bu pochta uchun;
const mail_service = require("../services/mail_service");
const uuid = require("uuid");
const config = require("config");

const addAdmin = async (req, res) => {
  const { error, value } = adminValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  console.log("addAdmin metodi chaqirildi ");
  const {
    name,
    email,
    password,
    phone_number,
    tg_link,
    is_active,
    is_creator,
    description,
  } = value;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const admin_activation_link = uuid.v4();
    const query = ` INSERT INTO admin (
        name,
        email,
        hashed_password,
        phone_number,
        tg_link,
        is_active,
        is_creator,
        description,
        admin_activation_link
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, is_creator`;

    const { rows } = await pool.query(query, [
      name,
      email,
      hashedPassword,
      phone_number,
      tg_link,
      is_active,
      is_creator,
      description,
      admin_activation_link,
    ]);

    console.log(rows);

    console.log("rows[0] :", rows[0]);

    const newAdmin = rows[0];

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/admin/activation/${admin_activation_link}`
    );

    const payload = {
      id: newAdmin.id,
      is_creator: newAdmin.is_creator,
    };

    const tokens = myJwt.generateTokens(payload);
    // const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, salt);

    const updateQuery = `
      UPDATE admin
      SET refresh_token = $1
      WHERE id = $2`;

    await pool.query(updateQuery, [tokens.refreshToken, newAdmin.id]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
    });

    res.status(201).send({ newAdmin, ...tokens });
  } catch (error) {
    errorHandler(res, error);
  }
};
const getAllAdmin = async (req, res) => {
  try {
    const admins = await pool.query("SELECT * FROM admin");
    res.status(200).send(admins.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await pool.query("SELECT * FROM admin WHERE id = $1", [id]);

    if (admin.rows.length == 0) {
      return res.status(404).send({ message: "admin not found" });
    }

    res.status(200).send(admin.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    password,
    phone_number,
    tg_link,
    is_active,
    is_creator,
    description,
  } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const admin_activation_link = uuid.v4();

    const admins = await pool.query("SELECT * FROM admin where id=$1", [id]);

    if (admins.rows.length == 0) {
      return res.status(404).send({ message: "admin not found" });
    }

    const payload = {
      id: admins.rows[0].id,
      is_active: admins.rows[0].is_active,
    };

    const tokens = myJwt.generateTokens(payload);

    const newAdmin = await pool.query(
      `
      UPDATE admin SET name = $1, email = $2, hashed_password = $3, phone_number = $4, tg_link = $5, is_active = $6, is_creator = $7,refresh_token = $8, description = $9,admin_activation_link=$10
      WHERE id = $11
      `,
      [
        name,
        email,
        hashedPassword,
        phone_number,
        tg_link,
        is_active,
        is_creator,
        tokens.refreshToken,
        description,
        admin_activation_link,
        id,
      ]
    );
    return res.status(200).send({ message: "Update Admin successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAdmin = await pool.query(
      `
            DELETE FROM admin WHERE id = $1
            RETURNING *
            `,
      [id]
    );

    if (deletedAdmin.rows.length == 0) {
      return res.status(404).send({ message: "admin not found" });
    }

    res.status(200).send(deletedAdmin.rows[0]);
  } catch (error) {
    errorHandler(res, error);
  }
};

// *****************************************************************************************************
// kerakli joylari

const loginAdmin = async (req, res) => {
  try {
    const { admin_email, password } = req.body;

    const result = await pool.query("SELECT * FROM admin WHERE email = $1", [
      admin_email,
    ]);

    console.log("result.rows[0] :", result.rows[0]);
    const admin1 = result.rows[0];

    if (!admin1) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    console.log(admin1.hashed_password);

    const validPassword = bcrypt.compareSync(password, admin1.hashed_password);

    if (!validPassword)
      return res.status(400).send({ message: "Email yoki parol notogri" });

    const payload = {
      id: admin1.id,
      is_creator: admin1.is_creator,
    };

    const tokens = myJwt.generateTokens(payload);

    // const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    const updateQuery = `
      UPDATE admin
      SET refresh_token = $1
      WHERE id = $2`;

    await pool.query(updateQuery, [tokens.refreshToken, admin1.id]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.status(200).send(tokens);
  } catch (error) {
    errorHandler(res, error);
  }
};
const logoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    // console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookie reshresh topilmadi " });
    }

    console.log("refreshToken  ::  : ", refreshToken);

    const updateQuery = `
        UPDATE admin
        SET refresh_token = ''
        WHERE refresh_token = $1
        RETURNING *`;

    const { rows } = await pool.query(updateQuery, [refreshToken]);

    console.log("rows", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Admin not found with the provided refresh token",
      });
    }
    res.clearCookie("refreshToken");

    const admin = rows[0];
    res.status(200).json({ admin });
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Check if refreshToken cookie exists
    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: "Refresh token not found in cookies" });
    }

    // Verify the refresh token
    const [verifyError, adminDataFromCookie] = await to(
      myJwt.verifyReshrefToken(refreshToken)
    );

    if (verifyError) {
      return res.status(403).json({ message: "Admin not authenticated" });
    }

    // Query the database for admin data
    const { rows } = await pool.query(
      `SELECT * FROM admin WHERE refresh_token = $1`,
      [refreshToken]
    );

    // Check if admin data exists in the database
    if (rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Unauthorized (Admin not found)" });
    }

    // Generate new tokens
    const payload = {
      id: rows[0].id,
      adminRoles: ["READ", "WRITE"],
    };
    const tokens = myJwt.generateTokens(payload);
    const newRefreshToken = tokens.refreshToken;

    // Update the refresh token in the database
    await pool.query(`UPDATE admin SET refresh_token = $1 WHERE id = $2`, [
      newRefreshToken,
      rows[0].id,
    ]);

    // Set the new refresh token in the response cookie
    res.cookie("refreshToken", newRefreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    // Send the new tokens in the response
    return res.status(200).json(tokens);
  } catch (error) {
    errorHandler(res, error);
  }
};

const adminActivate = async (req, res) => {
  try {
    const link = req.params.link;

    console.log("link", link);
    // Query the database to find the author with the provided activation link
    const query = `
      SELECT *
      FROM admin
      WHERE admin_activation_link = $1`;

    const { rows } = await pool.query(query, [link]);

    // If no author found with the provided activation link, return an error
    if (rows.length === 0) {
      return res.status(400).json({ message: "Activation link not found" });
    }

    const admin = rows[0];

    // If author is already activated, return an error
    if (admin.admin) {
      return res.status(400).json({ message: "Admin is already activated" });
    }

    // Update the author's activation status to true
    const updateQuery = `
      UPDATE admin
      SET is_active = true
      WHERE admin_activation_link = $1`;

    await pool.query(updateQuery, [link]);

    // Send response indicating successful activation
    res.json({
      is_active: true,
      message: "admin activated",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addAdmin,
  getAdminById,
  getAllAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  adminActivate,
};
