const { Router } = require("express");
const multer = require("multer");
const ArticleController = require("../controllers/article.js");

const router = Router();

// El storage

// ! IMPORTANTE, crear las carpetas correspondientes donde se van a guardar los archivos
const almacenamiento = multer.diskStorage({
  destination: function (req, file, cb) {
    // El primero tiene que ser null, segundo el path de donde vamos a guardar las imagenes
    // Se empiza por la raiz del proyecto
    cb(null, "./imagenes/articulos/");
  },
  filename: function (req, file, cb) {
    // Aca el primer parametro null tambien, y despues se guarda el nombre del archivo
    cb(null, "articulo" + Date.now() + file.originalname);
  },
});

const subida = multer({ storage: almacenamiento });

// Cargamos el controlador

// Rutas de prueba
router.get("/test", ArticleController.test);
router.get("/esteban", ArticleController.estebanInfo);

// Rutas utiles
router.post("/new-article", ArticleController.crear);
router.get("/get-articles", ArticleController.showArticles);

// Para agregar parametros, se tiene que poner "/:*nombreParametro*" al final del endpoint
// y si no se quiere que sea obligatorio, se le agrega un ?
router.get(
  "/get-articles-filter/:latest?/:limit?",
  ArticleController.showArticlesFilter
);

router.get("/get-article/:id", ArticleController.getOneArticle);
router.delete("/delete-article/:id", ArticleController.deleteArticle);
router.put("/edit-article/:id", ArticleController.editArticle);

// Aca agremos un middleware para la subida de archivos
// El nombre que se agrega (en este caso file), es el nombre que se tiene que agregar al
// archivo como parametro, es decir, el key tiene que ser file
router.post(
  "/upload-file/:id",
  [subida.single("file")],
  ArticleController.uploadFile
);

router.get("/search-image/:fichero", ArticleController.searchImage);
router.get("/searcher/:string", ArticleController.searcher);

module.exports = router;
