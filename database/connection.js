const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/my_blog");
    console.log("Conectado correctamente a la base de datos my_blog");
  } catch (error) {
    console.log(error);
    throw new Error("No se ha podido conectar a la base de datos");
  }
};

// Esto funciona para realizar exports como en javascript normal

module.exports = {
  connection,
};
