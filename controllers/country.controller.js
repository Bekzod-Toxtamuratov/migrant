const pool = require("../config/db");

const { errorHandler } = require("../helpers/error.handler");

const { countryValidation } = require("../validations/country.validation");

const addCountry = async (req, res) => {
  const { error, value } = countryValidation(req.body);
  console.log(value);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  const { name, flag } = value;

  try {
    const newCountry = await pool.query(
      `
     INSERT INTO country (name,flag)
     VALUES($1,$2) RETURNING *
    `,
      [name, flag]
    );
    console.log(newCountry.rows[0]);

    res.status(201).send(newCountry.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllCountry = async (req, res) => {
  try {
    const countries = await pool.query("SELECT * FROM country");

    res.status(200).send(countries.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getCountryById = async (req, res) => {
  const { id } = req.params;
  try {
    const countries = await pool.query("SELECT * FROM country WHERE id = $1", [
      id,
    ]);
    if (countries.rows.length == 0) {
      return res.status(404).send({ message: "country not found" });
    }
    res.status(200).send(countries.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateCountry = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { name, flag } = req.body;

  try {
    const updatedCountry = await pool.query(
      `
        UPDATE country SET name = $1, flag = $2  WHERE id = $3
        RETURNING *
        `,
      [name, flag, id]
    );
    console.log("updatedCountry.rows : ", updatedCountry.rows);

    if (updatedCountry.rows.length == 0) {
      return res.status(404).send({ message: "country not found" });
    }

    res.status(200).send(updatedCountry.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteCountry = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCountry = await pool.query(
      `
            DELETE FROM country WHERE id = $1
            RETURNING *
            `,
      [id]
    );
    if (deletedCountry.rows.length == 0) {
      return res.status(404).send({ message: "country not found" });
    }

    res.status(200).send(deletedCountry.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCountry,
  getCountryById,
  getAllCountry,
  updateCountry,
  deleteCountry,
};
