const pool = require("../config/db");
const bcrypt = require("bcrypt");
const myJwt = require("../services/jwt_service");
const { to } = require("../helpers/to_promise");

const { employerValidation } = require("../validations/employer.validation");

const { errorHandler } = require("../helpers/error.handler");
// bu pochta uchun;
const mail_service = require("../services/mail_service");
const uuid = require("uuid");
const config = require("config");

const addEmployer = async (req, res) => {
  const { error, value } = employerValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }
  const {
    company_name,
    industry,
    country_id,
    address,
    location,
    contact_name,
    contact_passport,
    contact_email,
    contact_phone,
    password,
  } = value;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // hashed_password;

    const employers = await pool.query(
      `
    INSERT INTO employer (company_name,
    industry,
    country_id,
    address,
    location,
    contact_name,
    contact_passport,
    contact_email,
    contact_phone,
    hashed_password,
    refresh_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ,$9, $10, $11) RETURNING *
    `,
      [
        company_name,
        industry,
        country_id,
        address,
        location,
        contact_name,
        contact_passport,
        contact_email,
        contact_phone,
        hashedPassword,
        null,
      ]
    );
    const employer1 = employers.rows[0];
    console.log("emloyer1 ", employer1);

    const payload = {
      id: employer1.id,
      location: employer1.location,
    };
    const tokens = myJwt.generateTokens(payload);

    const updateQuery = `
      UPDATE employer
      SET refresh_token = $1
      WHERE id = $2`;

    await pool.query(updateQuery, [tokens.refreshToken, employer1.id]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
    });

    return res.status(201).send({ employer1, ...tokens });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllEmployer = async (req, res) => {
  try {
    const employers = await pool.query("SELECT * FROM employer");
    res.status(200).send(employers.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getEmployerById = async (req, res) => {
  const { id } = req.params;
  try {
    const employers = await pool.query("SELECT * FROM employer WHERE id = $1", [
      id,
    ]);

    if (employers.rows.length == 0) {
      return res.status(404).send({ message: "employer not found" });
    }

    res.status(200).send(employers.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updatEmployer = async (req, res) => {
  console.log("update bosildi ");
  const { id } = req.params;
  console.log("id", id);
  const {
    company_name,
    industry,
    country_id,
    address,
    location,
    contact_name,
    contact_passport,
    contact_email,
    contact_phone,
    password,
  } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const employers = await pool.query("SELECT * FROM employer where id=$1", [
      id,
    ]);

    if (employers.rows.length == 0) {
      return res.status(404).send({ message: "employer not found" });
    }

    console.log("ok", employers.rows[0]);

    const payload = {
      id: employers.rows[0].id,
      industry: employers.rows[0].industry,
    };
    const tokens = myJwt.generateTokens(payload);

    const updateEneployer = await pool.query(
      ` UPDATE employer SET company_name =$1, industry = $2,country_id= $3, address= $4, location= $5, 
        contact_name= $6,
        contact_passport= $7,
        contact_email= $8,
        contact_phone= $9,
        hashed_password= $10,
        refresh_token=$11
        WHERE id = $12
        RETURNING *
    `,
      [
        company_name,
        industry,
        country_id,
        address,
        location,
        contact_name,
        contact_passport,
        contact_email,
        contact_phone,
        hashedPassword,
        tokens.refreshToken,
        id,
      ]
    );

    res.status(200).send(updateEneployer.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteEnemployer = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEnemloyer = await pool.query(
      `
            DELETE FROM employer WHERE id = $1
            RETURNING *
            `,
      [id]
    );

    if (deletedEnemloyer.rows.length == 0) {
      return res.status(404).send({ message: "employer  not found" });
    }

    res.status(200).send(deletedEnemloyer.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const loginEmployer = async (req, res) => {
  try {
    const { employer_email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM employer WHERE contact_email = $1",
      [employer_email]
    );

    console.log("result.rows[0] :", result.rows[0]);
    const employer1 = result.rows[0];

    if (!employer1) {
      return res.status(404).json({
        message: "employer not found",
      });
    }

    console.log(
      "employer1.hashed_password :  :   :",
      employer1.hashed_password
    );

    const validPassword = bcrypt.compareSync(
      password,
      employer1.hashed_password
    );

    if (!validPassword)
      return res.status(400).send({ message: "Email yoki parol notogri" });

    const payload = {
      id: employer1._id,
      location: employer1.location,
    };
    const tokens = myJwt.generateTokens(payload);

    // const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    const updateQuery = `
      UPDATE employer
      SET refresh_token = $1
      WHERE id = $2`;

    await pool.query(updateQuery, [tokens.refreshToken, employer1.id]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.status(200).send(tokens);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};
const logoutEmployer = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    // console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookie reshresh topilmadi " });
    }
    console.log("refreshToken  ::  : ", refreshToken);
    const updateQuery = `
        UPDATE employer
        SET refresh_token = ''
        WHERE refresh_token = $1
        RETURNING *`;
    const { rows } = await pool.query(updateQuery, [refreshToken]);
    console.log("rows", rows);
    if (rows.length === 0) {
      return res.status(404).json({
        message: "employer not found with the provided refresh token",
      });
    }
    res.clearCookie("refreshToken");

    const worker = rows[0];
    res.status(200).json({ worker });
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshEmployerToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: "Refresh token not found in cookies" });
    }

    const [verifyError, adminDataFromCookie] = await to(
      myJwt.verifyReshrefToken(refreshToken)
    );

    if (verifyError) {
      return res.status(403).json({ message: "Employer not authenticated" });
    }

    const { rows } = await pool.query(
      `SELECT * FROM employer WHERE refresh_token = $1`,
      [refreshToken]
    );

    if (rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Unauthorized (employer not found)" });
    }

    const payload = {
      id: rows[0].id,
      adminRoles: ["READ", "WRITE"],
    };
    const tokens = myJwt.generateTokens(payload);
    const newRefreshToken = tokens.refreshToken;

    await pool.query(`UPDATE employer SET refresh_token = $1 WHERE id = $2`, [
      newRefreshToken,
      rows[0].id,
    ]);

    res.cookie("refreshToken", newRefreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    return res.status(200).json(tokens);
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addEmployer,
  getAllEmployer,
  getEmployerById,
  updatEmployer,
  deleteEnemployer,
  loginEmployer,
  logoutEmployer,
  refreshEmployerToken,
};
