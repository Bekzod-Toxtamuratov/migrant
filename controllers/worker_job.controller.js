const pool = require("../config/db");

const { errorHandler } = require("../helpers/error.handler");

const {
  worker_jobValidation,
} = require("../validations/worker_job.validation");

const addWorker_job = async (req, res) => {
  console.log("dad");

  const { error, value } = worker_jobValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }
  const { worker_id, job_id } = value;

  try {
    const newWOrker_job = await pool.query(
      `
     INSERT INTO worker_job (worker_id,job_id)
     VALUES($1,$2) RETURNING *
    `,
      [worker_id, job_id]
    );
    console.log(newWOrker_job.rows[0]);

    res.status(201).send(newWOrker_job.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllWorker_job = async (req, res) => {
  try {
    const workers = await pool.query(
      `
      SELECT * FROM  worker_job
    `
    );
    return res.status(200).send(workers.rows);
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error });
  }
};
const getWorker_jobById = async (req, res) => {
  const { id } = req.params;
  try {
    const workers = await pool.query("SELECT * FROM worker_job WHERE id = $1", [
      id,
    ]);
    if (workers.rows.length == 0) {
      return res.status(404).send({ message: "worker_job not found" });
    }
    res.status(200).send({ worker: workers.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateWorker_job = async (req, res) => {
  const { worker_id, job_id } = req.body;

  const { id } = req.params;
  try {
    const updateWorker = await pool.query(
      `
        UPDATE worker_job set worker_id=$1, job_id=$2  WHERE id=$3
        `,
      [worker_id, job_id, id]
    );
    if (updateWorker.rowCount == 0) {
      return res.status(404).send({ message: "worker_job not found" });
    }
    return res.status(201).send({ message: "successfully updated " });
  } catch (error) {
    console.log(error);
    res.status(404).send({ error: error });
  }
};

const deleteWorker_job = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteWOrker = await pool.query(
      `
        DELETE FROM worker_job WHERE id=$1
        `,
      [id]
    );
    if (deleteWOrker.rowCount == 0) {
      return res.status(404).send({ message: "worker_job not found" });
    }
    return res.status(201).send({ message: "deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(403).send(error);
  }
};

module.exports = {
  addWorker_job,
  deleteWorker_job,
  updateWorker_job,
  getWorker_jobById,
  getAllWorker_job,
};
