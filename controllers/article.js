const Article = require("../models/Articles");
const { validarArticulo } = require("../helpers/validate");
const fs = require("fs");
const path = require("path");

const test = (req, res) => {
  return res.status(200).json({ message: "Soy test" });
};

const estebanInfo = (req, res) => {
  return res.status(200).json({
    nombre: "Esteban",
    apellido: "Rojas",
    edad: "25",
  });
};

const crear = (req, res) => {
  // Recogemos los datos del post enviados por el usuario
  let params = req.body;

  // Validar los datos
  try {
    validarArticulo(params);
  } catch (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Faltan datos por enviar" });
  }

  // Creamos el objeto
  const article = new Article(params);

  // Asignar los valores (manual o automatico)
  // Manual
  //? article.title = params.title;

  // Automatico
  article
    .save()
    .then(function (savedArticle) {
      console.log(savedArticle);
    })
    .catch(function (err) {
      console.log(err);
    });

  // Devolvemos el resultado
  return res
    .status(200)
    .json({ status: 200, message: "Article saved", article: params });
};

// ! IMPORTANTE AGREGAR EL ASYNC (creo)
const showArticles = async (req, res) => {
  let consulta = await Article.find({}).exec();
  if (!consulta)
    return res.status(400).json({ status: 400, message: "There is no data" });
  return res.status(200).send({ status: 200, data: consulta });
};

const showArticlesFilter = async (req, res) => {
  // Para obtener los parametros hacemos req.params
  // Estos son definidos en la URL del request de la siguiente manera: ...endpoint/valor/valor2
  const { limit, latest } = req.params;
  // Tambien se pueden sacar los valores mendiante el req.query que vendrian tal que
  // ...endpoint/?test=asd

  const { test } = req.query;
  console.log(`Soy test, ${test}`);

  // El -1 es para decir del mas nuevo al mas viejo, 1 es viceversa

  let consulta = await Article.find({})
    .limit(limit ? parseInt(limit) : undefined)
    .sort({ date: latest === "true" ? -1 : 1 })
    .exec();
  if (!consulta)
    return res.status(400).json({ status: 400, message: "There is no data" });
  return res.status(200).send({
    status: 200,
    limit: limit ? parseInt(limit) : undefined,
    data_length: consulta.length,
    data: consulta,
  });
};

const getOneArticle = (req, res) => {
  // Recogemos el ID
  let { id } = req.params;
  // Buscar el articulo
  Article.findById(id)
    .then((articulo) => {
      // Si no existe, devolver error
      if (!articulo) {
        return res.status(400).json({
          status: "Error",
          mensaje: "No se ha encontrado el artículo",
        });
      }

      // Devolver resultado
      return res.status(200).json({
        status: "Success",
        article: articulo,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        status: "Error",
        mensaje: "Ha ocurrido un error al buscar el artículo",
      });
    });
};

const deleteArticle = async (req, res) => {
  // Recogemos el id
  let { id } = req.params;

  Article.findOneAndDelete({ _id: id }).then((deleted_article) => {
    if (!deleted_article)
      return res
        .status(400)
        .json({ status: 400, message: "Error al borrar el articulo" });

    return res.status(200).json({
      status: 200,
      deleted_article,
      message: "Article deleted successfully",
    });
  });
};

const editArticle = async (req, res) => {
  let { id } = req.params;

  // Recoger los datos del body
  let params = req.body;

  // Validar datos
  try {
    validarArticulo(params);
  } catch (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Faltan datos por enviar" });
  }
  // Buscar y actualizar articulo
  // Si agregamos el new como nuevo parametro, nos devuelve en la respuesta el nuevo articulo
  // Si no lo agregamos, nos devuelve el archivo antes de ser editado
  Article.findOneAndUpdate({ _id: id }, params, { new: true }).then(
    (updated_article) => {
      // Devolver respuesta
      if (!updated_article)
        return res
          .status(400)
          .json({ status: 400, message: "Article doesnt exist" });
      return res.status(200).send({
        status: 200,
        message: "Article updated",
        lastArticle: updated_article,
      });
    }
  );
};

// ! IMPORTANTE, crear las carpetas correspondientes donde se van a guardar los archivos
const uploadFile = (req, res) => {
  // Configuramos multer
  // Recoger el ficher de imagen subido
  if (!req.file && !req.files)
    return res.status(400).json({
      status: 400,
      message: "You must upload a file",
    });

  // Nombre del archivo
  let fileName = req.file.originalname;

  // Extension del archivo
  let fileextension = fileName.split(".")[1];
  // Comprobar extension correcta
  if (!["png", "jpg", "jpeg", "gif"].includes(fileextension)) {
    // Si entra aca es porque es un tipo de archivo que no nos interesa
    // entonces tenemos que borrarlo y devolver respuesta
    fs.unlink(req.file.path, (err) => {
      return res.status(400).json({
        status: 400,
        message: "File extension not allowed",
      });
    });
  } else {
    // Si todo va bien, actualizamos el articulo
    let { id } = req.params;

    // Buscar y actualizar articulo
    // Si agregamos el new como nuevo parametro, nos devuelve en la respuesta el nuevo articulo
    // Si no lo agregamos, nos devuelve el archivo antes de ser editado
    // Si queremos actualizar algo en concreto, creamos el objeto con esa propiedad, en este
    // caso vamos a actualizar image
    Article.findOneAndUpdate(
      { _id: id },
      { image: req.file.filename },
      { new: true }
    ).then((updated_article) => {
      // Devolver respuesta
      if (!updated_article)
        return res
          .status(400)
          .json({ status: 400, message: "Article doesnt exist" });

      // Devolver respuesta
      return res.status(200).json({
        status: 200,
        file: req.file,
        new_article: updated_article,
      });
    });
  }
};

const searchImage = (req, res) => {
  let fichero = req.params.fichero;

  // Creamos la ruta para acceder a la imagen
  let pathFile = "./imagenes/articulos/" + fichero;

  // Con esta funcion verificamos si la imagen existe, ademas la podemos devolver
  // como respuesta
  fs.stat(pathFile, (err, exist) => {
    if (exist) return res.sendFile(path.resolve(pathFile));
    else
      return res
        .status(400)
        .json({ status: 400, message: "File doesnt exist" });
  });
};

const searcher = async (req, res) => {
  // Sacamos el string de busqueda
  let { string } = req.params;

  // Ejecutar consulta // Find OR

  // Aca podemos agregar expresiones regulares, en las opciones la 'i' se refiere a si incluye
  // ese valor en el string donde se este buscando
  let consulta = await Article.find({
    $or: [
      { title: { $regex: string, $options: "i" } },
      { content: { $regex: string, $options: "i" } },
    ],
  })
    // Ordenar
    .sort({ date: -1 })
    .exec();

  // Devolver resultado
  if (!consulta)
    return res
      .status(404)
      .json({ status: 404, message: "There is no articles with " + string });

  return res
    .status(200)
    .json({ status: 200, quantity: consulta.length, consulta });
};

module.exports = {
  test,
  estebanInfo,
  crear,
  showArticles,
  showArticlesFilter,
  getOneArticle,
  deleteArticle,
  editArticle,
  uploadFile,
  searchImage,
  searcher,
};
