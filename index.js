const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");

// Inicializamos app
console.log("Inicializamos la app");

// Conectamos a la base de datos
connection();

// Crear servidor Node
const app = express();
const puerto = 3900;

// Configurar el CORS
app.use(cors());

// Convertir body a objeto JSON
app.use(express.json()); // Para recibir con datos content-type app/json
app.use(express.urlencoded({ extended: true })); // Para codificar el form-urlencoded a un json

// Crear rutas
// !Hardcodeadas
app.get("/", (req, res) => {
  console.log("Se ha ejecutado el request inicial");

  return res.status(200).send(`
      <div>
        <h1>Creando APIs</h1>
      </div>`);
});

app.get("/probando", (req, res) => {
  return res
    .status(200)
    .send({ curso: "Master en APIs", autor: "Esteban Rojas" });
});

//! Rutas de verdad utilizando controladores
const rutas_articulo = require("./routes/article.js");

// Si hacemos esto del '/api' decimos que todos los endpoints tiene que tener el prefijo /api
app.use("/api", rutas_articulo);

// Crear servidor y escuchar las peticiones
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto " + puerto);
});
