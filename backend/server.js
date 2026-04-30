const express = require("express"); 
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors({
    origin: "https://chocosain.netlify.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor funcionando 🍫");
});

/* REGISTRO */
app.post("/registro", (req, res) => {
    const { usuario, clave } = req.body;

    if (!usuario || !clave) {
        return res.json({ ok: false, mensaje: "Completa todos los campos" });
    }

    db.query(
        "INSERT INTO usuarios (usuario, clave) VALUES (?, ?)",
        [usuario, clave],
        (err) => {

            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.json({ ok: false, mensaje: "Usuario ya registrado" });
                }
                return res.json({ ok: false, error: err });
            }

            res.json({ ok: true });
        }
    );
});

/* LOGIN */
app.post("/login", (req, res) => {
    const { usuario, clave } = req.body;

    db.query(
        "SELECT * FROM usuarios WHERE usuario=? AND clave=?",
        [usuario, clave],
        (err, result) => {
            if (err) return res.json({ ok: false });

            if (result.length > 0) {
                res.json({ ok: true, usuario: result[0].usuario });
            } else {
                res.json({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
            }
        }
    );
});

/* GUARDAR PEDIDO */
app.post("/guardarPedido", (req, res) => {
    const { usuario, carrito, total, metodo } = req.body;

    console.log("📦 DATOS:", req.body); // 👈 VERIFICAR

    if (!usuario || !carrito || carrito.length === 0) {
        return res.json({ ok: false, mensaje: "Datos incompletos" });
    }

    const productos = JSON.stringify(carrito);

    db.query(
        "INSERT INTO pedidos (usuario, productos, total, metodo_pago) VALUES (?, ?, ?, ?)",
        [usuario, productos, total, metodo],
        (err, result) => {
            if (err) {
                console.log("❌ ERROR MYSQL:", err);
                return res.json({ ok: false, error: err });
            }

            console.log("✅ INSERTADO:", result);
            res.json({ ok: true });
        }
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT} 🚀`);
});