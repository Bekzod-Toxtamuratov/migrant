const pool = require("../config/db");
const { errorHandler } = require("../helpers/error.handler");

const { jobValidation } = require("../validations/job.validation");

const addJob = async (req, res) => {
  const { error, value } = jobValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  const { worker_id, job_id } = value;
  try {
    const newJob = await pool.query(
      `
     INSERT INTO job (worker_id,job_id)
     VALUES($1,$2) RETURNING *
    `,
      [worker_id, job_id]
    );
    console.log(newJob.rows[0]);
    res.status(201).send(newJob.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllJob = async (req, res) => {
  try {
    const jobs = await pool.query("SELECT * FROM job");

    res.status(200).send(jobs.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getJobsById = async (req, res) => {
  const { id } = req.params;
  try {
    const jobs = await pool.query("SELECT * FROM job WHERE id = $1", [id]);
    if (jobs.rows.length == 0) {
      return res.status(404).send({ message: "job not found" });
    }
    res.status(200).send(jobs.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateJobs = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { worker_id, job_id } = req.body;

  try {
    const updatedJobs = await pool.query(
      `
        UPDATE job SET worker_id = $1, job_id = $2  WHERE id = $3
        RETURNING *
        `,
      [worker_id, job_id, id]
    );
    console.log("updatedJobs.rows : ", updatedJobs.rows);

    if (updatedJobs.rows.length == 0) {
      return res.status(404).send({ message: "job not found" });
    }

    res.status(200).send(updatedJobs.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteJobs = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedJobs = await pool.query(
      `
            DELETE FROM job WHERE id = $1
            RETURNING *
            `,
      [id]
    );

    if (deletedJobs.rows.length == 0) {
      return res.status(404).send({ message: "job not found" });
    }

    res.status(200).send(deletedJobs.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addJob,
  getJobsById,
  getAllJob,
  updateJobs,
  deleteJobs,
};
