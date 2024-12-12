const Article = require("../models/Articles");

const validarArticulo = (params) => {
  let validar_titulo =
    !validator.isEmpty(params.title) &&
    validator.isLength(params.title, { min: 5, max: undefined });
  let validar_contenido = !validator.isEmpty(params.content);
  if (!validar_titulo || !validar_contenido)
    throw new Error("No se ha validad la informacion");
};

module.exports = {
  validarArticulo,
};
