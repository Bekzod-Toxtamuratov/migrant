const pool = require("../config/db");
const { errorHandler } = require("../helpers/error.handler");
const { vacancyValidation } = require("../validations/vacancy.validation");

const addVacancy = async (req, res) => {
  const { error, value } = vacancyValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }
  const { employer_id, city, job_id, salary } = value;

  try {
    const newVacancy = await pool.query(
      `
      INSERT INTO  vacancy(employer_id,city,job_id,salary)
      VALUES($1,$2,$3,$4) RETURNING *
    `,
      [employer_id, city, job_id, salary]
    );
    console.log(newVacancy.rows[0]);

    res.status(201).send(newVacancy.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllVacancy = async (req, res) => {
  try {
    const vacancies = await pool.query(
      `
        SELECT * FROM  vacancy
        `
    );
    return res.status(200).send(vacancies.rows);
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error });
  }
};
const getVacancyById = async (req, res) => {
  const { id } = req.params;
  try {
    const vacancies = await pool.query("SELECT * FROM vacancy WHERE id = $1", [
      id,
    ]);
    if (vacancies.rows.length == 0) {
      return res.status(404).send({ message: "vacancy not found" });
    }
    res.status(200).send({ vacancy: vacancies.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateVacancy = async (req, res) => {
  const { employer_id, city, job_id, salary } = req.body;
  const { id } = req.params;
  try {
    const updateVacancy = await pool.query(
      `
        UPDATE vacancy set employer_id=$1, city=$2,job_id=$3,salary=$4 WHERE id=$5
        `,
      [employer_id, city, job_id, salary, id]
    );
    if (updateVacancy.rowCount == 0) {
      return res.status(404).send({ message: "vacancy not found" });
    }
    return res.status(201).send({ message: "successfully updated " });
  } catch (error) {
    console.log(error);
    res.status(404).send({ error: error });
  }
};

const deleteVacancy = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteVacancy = await pool.query(
      `
        DELETE FROM vacancy WHERE id=$1
        `,
      [id]
    );
    if (deleteVacancy.rowCount == 0) {
      return res.status(404).send({ message: "vacancy not found" });
    }
    return res.status(201).send({ message: "deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(403).send(error);
  }
};

module.exports = {
  addVacancy,
  getAllVacancy,
  getVacancyById,
  updateVacancy,
  deleteVacancy,
};
