// 404 frontendan malumot notogri kelsa 404 xabarini yuboramiz
const errorHandler = (res, error) => {
  res.status(400).send({ message: `xatolik : ${error}` });
};

module.exports = {
  errorHandler,
};
