const pool = require("../config/db");
const { errorHandler } = require("../helpers/error.handler");

const {
  applicationValidation,
} = require("../validations/application.validation");

const addAplication = async (req, res) => {
  const { error, value } = applicationValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  const { vacancy_id, worker_id, application_date } = value;
  try {
    const newApplication = await pool.query(
      `
     INSERT INTO  application(vacancy_id,worker_id,application_date)
     VALUES($1,$2,$3) RETURNING *
    `,
      [vacancy_id, worker_id, application_date]
    );
    console.log(newApplication.rows[0]);

    res.status(201).send(newApplication.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllAplication = async (req, res) => {
  try {
    const Applications = await pool.query(
      `
        SELECT * FROM  application
      `
    );
    return res.status(200).send(Applications.rows);
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error });
  }
};
const getApplicationById = async (req, res) => {
  const { id } = req.params;
  try {
    const applications = await pool.query(
      "SELECT * FROM application WHERE id = $1",
      [id]
    );
    if (applications.rows.length == 0) {
      return res.status(404).send({ message: "application not found" });
    }
    res.status(200).send({ application: applications.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateApplication = async (req, res) => {
  const { vacancy_id, worker_id, application_date } = req.body;
  const { id } = req.params;
  try {
    const updateApplication = await pool.query(
      `
        UPDATE application set vacancy_id=$1, worker_id=$2, application_date=$3 WHERE id=$4
        `,
      [vacancy_id, worker_id, application_date, id]
    );
    if (updateApplication.rowCount == 0) {
      return res.status(404).send({ message: "application not found" });
    }
    return res.status(201).send({ message: "successfully updated " });
  } catch (error) {
    console.log(error);
    res.status(404).send({ error: error });
  }
};

const deleteApplication = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteApplication = await pool.query(
      `
          DELETE FROM application WHERE id=$1
      `,
      [id]
    );
    if (deleteApplication.rowCount == 0) {
      return res.status(404).send({ message: "application not found" });
    }
    return res.status(201).send({ message: "deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(403).send(error);
  }
};

module.exports = {
  addAplication,
  getAllAplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
