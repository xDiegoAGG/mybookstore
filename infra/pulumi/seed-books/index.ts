import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const config = new pulumi.Config();
const dataStackName = config.get("dataStackName") || "mybookstore-data/dev";

const dataStack = new pulumi.StackReference(dataStackName);
const booksTableName = dataStack.getOutput("booksTableName") as pulumi.Output<string>;


new aws.dynamodb.TableItem("book-1-cumbres-borrascosas", {
  tableName: booksTableName,
  hashKey: "id",
  item: JSON.stringify({
    id:           { S: "1" },
    name:         { S: "Cumbres Borrascosas" },
    author:       { S: "Emily Brontë" },
    description:  { S: "Esta edición de Cumbres Borrascosas forma parte de la colección Jardín Secreto de Editorial Alma, caracterizada por libros de tapa dura con un diseño estético y detallado. La obra de Emily Brontë narra la intensa y oscura historia de amor, venganza y obsesión entre Catherine Earnshaw y Heatcliff en los páramos de Yorkshire." },
    price:        { S: "$183.754" },
    countInStock: { S: "3" },
    image:        { S: "/images/img-cumbres-borrascosas.jpeg" },
  }),
});


new aws.dynamodb.TableItem("book-2-como-agua-para-chocolate", {
  tableName: booksTableName,
  hashKey: "id",
  item: JSON.stringify({
    id:           { S: "2" },
    name:         { S: "Como agua para chocolate" },
    author:       { S: "Laura Esquivel" },
    description:  { S: "Tita y Pedro se aman. Pero ella está condenada a permanecer soltera, cuidando a su madre hasta que ésta muera. Y Pedro, para estar cerca de Tita, se casa con la hermana de ella, Rosaura. Las recetas de cocina que Tita elabora, además de construir narrativamente la novela, puntean el paso de las estaciones de su vida, siempre marcada por la presente ausencia de Pedro. Como agua para chocolate es una agridulce comedia de amores y desencuentros, una obra chispeante, tierna y pletórica de talento que se ha convertido en uno de los mayores éxitos de la literatura latinoamericana." },
    price:        { S: "$63.200" },
    countInStock: { S: "12" },
    image:        { S: "/images/img-como-agua-para-chocolate.jpeg" },
  }),
});


new aws.dynamodb.TableItem("book-3-orgullo-y-prejuicio", {
  tableName: booksTableName,
  hashKey: "id",
  item: JSON.stringify({
    id:           { S: "3" },
    name:         { S: "Orgullo y Prejuicio" },
    author:       { S: "Jane Austen" },
    description:  { S: "Orgullo y prejuicio, narra cómo Elizabeth Bennet y Fitzwilliam Darcy se enfrentan a sus prejuicios movidos por el amor que, contra pronóstico, surge entre ellos." },
    price:        { S: "$280.363" },
    countInStock: { S: "1" },
    image:        { S: "/images/img-orgullo-y-prejuicio.jpeg" },
  }),
});


new aws.dynamodb.TableItem("book-4-jane-eyre", {
  tableName: booksTableName,
  hashKey: "id",
  item: JSON.stringify({
    id:           { S: "4" },
    name:         { S: "Jane Eyre" },
    author:       { S: "Charlotte Brontë" },
    description:  { S: "Jane Eyre es una novela clásica de la literatura inglesa escrita por Charlotte Brontë y publicada originalmente en 1847 bajo el seudónimo de Currer Bell. Es considerada una de las primeras obras en explorar la psicología profunda de una protagonista femenina y es un referente del feminismo temprano por su defensa de la independencia y la dignidad de la mujer. La historia sigue la vida de Jane, una joven huérfana desde su difícil infancia hasta su madurez." },
    price:        { S: "$134.250" },
    countInStock: { S: "10" },
    image:        { S: "/images/img-Jane-Eyre.jpeg" },
  }),
});


new aws.dynamodb.TableItem("book-5-en-agosto-nos-vemos", {
  tableName: booksTableName,
  hashKey: "id",
  item: JSON.stringify({
    id:           { S: "5" },
    name:         { S: "En agosto nos vemos" },
    author:       { S: "Gabriel García Márquez" },
    description:  { S: "En agosto nos vemos es la novela póstuma de Gabriel García Márquez, publicada el 6 de marzo de 2024, coincidiendo con el que habría sido el cumpleaños número 97 del autor. La historia se centra en Ana Magdalena Bach, una mujer de unos 50 años que, a pesar de tener un matrimonio aparentemente feliz, mantiene un ritual anual: cada 16 de agosto viaja a una isla del Caribe para visitar la tumba de su madre." },
    price:        { S: "$57.600" },
    countInStock: { S: "8" },
    image:        { S: "/images/img-en-agosto-nos-vemos.jpeg" },
  }),
});


new aws.dynamodb.TableItem("book-6-el-gran-gatsby", {
  tableName: booksTableName,
  hashKey: "id",
  item: JSON.stringify({
    id:           { S: "6" },
    name:         { S: "El gran Gatsby" },
    author:       { S: "F. Scott Fitzgerald" },
    description:  { S: "Una icónica novela de F. Scott Fitzgerald publicada en 1925. Ambientada en los \"locos años veinte\", narra la historia del misterioso millonario Jay Gatsby y su obsesión por reconquistar a su antiguo amor, Daisy Buchanan, todo ello relatado a través de los ojos de su vecino, Nick Carraway." },
    price:        { S: "$57.157" },
    countInStock: { S: "5" },
    image:        { S: "/images/img-el-gran-gatsby.jpeg" },
  }),
});


export const seededBookCount = 6;
export const targetTable = booksTableName;
