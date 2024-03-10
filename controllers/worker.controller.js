const { get } = require("config");
const pool = require("../config/db");
const { errorHandler } = require("../helpers/error.handler");
const bcrypt = require("bcrypt");
const myJwt = require("../services/jwt_service");
const { to } = require("../helpers/to_promise");

const { workerValidation } = require("../validations/worker.validation");

const config = require("config");

const mail_service = require("../services/mail_service");

const uuid = require("uuid");

const addWorker = async (req, res) => {

  const {error,value} = workerValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  console.log("bekzod");

  const {
    first_name,
    last_name,
    birth_date,
    gender,
    passport,
    phone_number,
    email,
    password,
    tg_link,
    graduate,
    skills,
    exprience,
  } = value;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const worker_activation_link = uuid.v4();

    const newWorker = await pool.query(
      `
      INSERT INTO worker (first_name,
                          last_name,
                          birth_date,
                          gender,
                          passport,
                          phone_number,
                          email,
                          tg_link,
                          hashed_password,
                          is_active,
                          graduate,
                          skills,
                          exprience,
                          refresh_token,
                          worker_activation_link)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15) RETURNING *
      `,
      [
        first_name,
        last_name,
        birth_date,
        gender,
        passport,
        phone_number,
        email,
        tg_link,
        hashedPassword,
        false,
        graduate,
        skills,
        exprience,
        null,
        worker_activation_link,
      ]
    );

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/worker/activation/${worker_activation_link}`
    );

    console.log("ok", newWorker.rows[0]);

    const newWorker1 = newWorker.rows[0];

    const payload = {
      id: newWorker1.id,
      is_active: newWorker1.is_active,
    };

    const tokens = myJwt.generateTokens(payload);
    // const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, salt);

    const updateQuery = `
      UPDATE worker
      SET refresh_token = $1
      WHERE id = $2`;

    await pool.query(updateQuery, [tokens.refreshToken, newWorker1.id]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
    });

    res.status(201).send({ newWorker1, ...tokens });
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};
const getAllWorker = async (req, res) => {
  try {
    const admins = await pool.query("SELECT * FROM worker");
    res.status(200).send(admins.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getWorkerById = async (req, res) => {
  const { id } = req.params;
  try {
    const newWorker = await pool.query("SELECT * FROM worker WHERE id = $1", [
      id,
    ]);
    if (newWorker.rows.length == 0) {
      return res.status(404).send({ message: "worker not found" });
    }
    res.status(200).send(newWorker.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateWorker = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    birth_date,
    gender,
    passport,
    phone_number,
    email,
    password,
    tg_link,
    graduate,
    skills,
    exprience,
  } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const worker_activation_link = uuid.v4();

    const workers = await pool.query("SELECT * FROM worker WHERE id=$1", [id]);

    if (workers.rows.length === 0) {
      return res.status(404).send({ message: "Worker not found" });
    }

    const payload = {
      id: workers.rows[0].id,
      is_active: workers.rows[0].is_active,
    };

    const tokens = myJwt.generateTokens(payload);

    const updatespecialist = await pool.query(
      `
      UPDATE worker 
      SET first_name = $1, last_name = $2, birth_date = $3, gender = $4, passport = $5,
      phone_number = $6, email = $7, tg_link = $8, hashed_password = $9, graduate = $10,
      skills = $11, exprience = $12, refresh_token = $13, worker_activation_link = $14
      WHERE id = $15
      RETURNING *
      `,
      [
        first_name,
        last_name,
        birth_date,
        gender,
        passport,
        phone_number,
        email,
        tg_link,
        hashedPassword,
        graduate,
        skills,
        exprience,
        tokens.refreshToken,
        worker_activation_link,
        id,
      ]
    );
    res.status(200).send(updatespecialist.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteWorker = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedWorker = await pool.query(
      `
            DELETE FROM worker WHERE id = $1
            RETURNING *
            `,
      [id]
    );

    if (deletedWorker.rows.length == 0) {
      return res.status(404).send({ message: "worker not found" });
    }

    res.status(200).send(deletedWorker.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const loginWorker = async (req, res) => {
  try {
    const { worker_email, password } = req.body;
    const result = await pool.query("SELECT * FROM worker WHERE email = $1", [
      worker_email,
    ]);

    console.log("result.rows[0] :", result.rows[0]);
    const worker1 = result.rows[0];

    if (!worker1) {
      return res.status(404).json({
        message: "worker not found",
      });
    }

    console.log("worker1.hashed_password :  :   :", worker1.hashed_password);

    const validPassword = bcrypt.compareSync(password, worker1.hashed_password);

    if (!validPassword)
      return res.status(400).send({ message: "Email yoki parol notogri" });

    const payload = {
      id: worker1._id,
      is_active: worker1.is_active,
    };
    const tokens = myJwt.generateTokens(payload);

    // const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    const updateQuery = `
      UPDATE worker
      SET refresh_token = $1
      WHERE id = $2`;

    await pool.query(updateQuery, [tokens.refreshToken, worker1.id]);

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
const logoutWorker = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    // console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookie reshresh topilmadi " });
    }
    console.log("refreshToken  ::  : ", refreshToken);
    const updateQuery = `
        UPDATE worker
        SET refresh_token = ''
        WHERE refresh_token = $1
        RETURNING *`;
    const { rows } = await pool.query(updateQuery, [refreshToken]);
    console.log("rows", rows);
    if (rows.length === 0) {
      return res.status(404).json({
        message: "worker not found with the provided refresh token",
      });
    }
    res.clearCookie("refreshToken");

    const worker = rows[0];
    res.status(200).json({ worker });
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshWorkerToken = async (req, res) => {
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
      return res.status(403).json({ message: "worker not authenticated" });
    }
    const { rows } = await pool.query(
      `SELECT * FROM worker WHERE refresh_token = $1`,
      [refreshToken]
    );

    if (rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Unauthorized (worker not found)" });
    }

    const payload = {
      id: rows[0].id,
      adminRoles: ["READ", "WRITE"],
    };
    const tokens = myJwt.generateTokens(payload);
    const newRefreshToken = tokens.refreshToken;

    await pool.query(`UPDATE worker SET refresh_token = $1 WHERE id = $2`, [
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

const workerActivate = async (req, res) => {
  try {
    const link = req.params.link;
    console.log("link", link);

    const query = `
      SELECT *
      FROM worker
      WHERE worker_activation_link = $1`;

    const { rows } = await pool.query(query, [link]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Activation link not found" });
    }

    const worker = rows[0];

    if (worker.admin) {
      return res.status(400).json({ message: "Worker is already activated" });
    }

    const updateQuery = `
      UPDATE worker
      SET is_active = true
      WHERE worker_activation_link = $1`;

    await pool.query(updateQuery, [link]);

    res.json({
      is_active: true,
      message: "worker successfully activated",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addWorker,
  getWorkerById,
  getAllWorker,
  updateWorker,
  deleteWorker,
  loginWorker,
  workerActivate,
  logoutWorker,
  refreshWorkerToken,
};
