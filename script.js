let usuarioActual = null;

window.onerror = function(msg, url, line, col, error) {
    console.log("💥 ERROR GLOBAL:", msg, "en línea", line);
};

const URL = "https://enduring-second-economy.ngrok-free.dev";

let carrito = [];
let total = 0;

function mostrar(id){
    document.querySelectorAll(".pantalla").forEach(p=>{
        p.classList.remove("activa");
    });
    document.getElementById(id).classList.add("activa");
}

function registrar(){

    console.log("ENTRÓ A REGISTRAR");

    let usuario = document.getElementById("usuario").value.trim();
    let clave = document.getElementById("clave").value.trim();

    if(usuario === "" || clave === ""){
        mostrarMensaje("Completa todos los campos ❌");
        return;
    }

    fetch("https://enduring-second-economy.ngrok-free.dev/registro", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ usuario, clave })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data); // 👈 DEBUG

        if(!data.ok){
    mostrarMensaje(data.mensaje || "Error ❌");
    return;
}

// 🔥 AQUÍ ESTÁ LA SOLUCIÓN
usuarioActual = usuario;
localStorage.clear();
localStorage.setItem("usuario", usuario);

mostrarMensaje("✅ Usuario registrado correctamente");
mostrar("catalogo");
    })
    .catch(err => {
        console.log(err);
        mostrarMensaje("❌ Error conectando con servidor");
    });
}

function login(){
    let usuario = document.getElementById("usuario").value.trim();
    let clave = document.getElementById("clave").value.trim();

    if(usuario === "" || clave === ""){
        mostrarMensaje("Completa todos los campos ❌");
        return;
    }

    fetch("https://enduring-second-economy.ngrok-free.dev/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, clave })
    })
    .then(res => res.json())
    .then(data => {

        console.log("LOGIN RESPONSE:", data);

        if(!data.ok){
            mostrarMensaje("❌ Usuario o contraseña incorrectos");
            return;
        }

        // 🔥 AQUÍ ESTÁ LA CLAVE
        usuarioActual = data.usuario;
        localStorage.setItem("usuario", data.usuario);

        mostrarMensaje("💜 Bienvenido " + data.usuario);
        mostrar("catalogo");
    })
    .catch(err => {
        console.log(err);
        mostrarMensaje("Error en login ❌");
    });
}

function agregarCarrito(btn){

    let producto = btn.closest(".producto");

    let nombre = producto.querySelector("h3").textContent;
    let precio = parseInt(producto.querySelector("p:nth-of-type(2)").textContent.replace("$",""));
    let imagen = producto.querySelector("img").src;
    let cantidad = parseInt(producto.querySelector(".cantidad").value);

    if(isNaN(cantidad) || cantidad < 1){
        alert("Cantidad inválida ❌");
        return;
    }

    let existe = carrito.find(p => p.nombre === nombre);

    if(existe){
        existe.cantidad += cantidad;
    }else{
        carrito.push({ nombre, precio, cantidad, imagen });
    }

    total += precio * cantidad;

    mostrarMensaje("🛒 Producto agregado 💜");
}

function irCarrito(){
    let lista = document.getElementById("lista-carrito");
    lista.innerHTML = "";

    if(carrito.length === 0){
        lista.innerHTML = "<p>🛒 Tu carrito está vacío</p>";
        document.getElementById("total").innerHTML = "$0";
        mostrar("carritoSec");
        return;
    }

    carrito.forEach((p, index)=>{
        let li = document.createElement("li");

        li.innerHTML = `
        <div class="card-carrito">
            <img src="${p.imagen}">
            <div class="info">
                <h4>${p.nombre}</h4>
                <p>Cantidad: ${p.cantidad}</p>
                <span>$${p.precio * p.cantidad}</span>
                <button class="btn-eliminar">❌</button>
            </div>
        </div>
        `;

        // 🔥 evento seguro
        li.querySelector(".btn-eliminar").onclick = () => eliminarProducto(index);

        lista.appendChild(li);
    });

    document.getElementById("total").innerHTML = `
        💰 Total: <b>$${total}</b>
    `;

    mostrar("carritoSec");
}

function mostrarMensaje(texto){
    let msg = document.getElementById("mensaje");
    msg.textContent = texto;

    msg.style.opacity = "1";

    setTimeout(()=>{
        msg.style.opacity = "0";
    }, 3000);
}

function eliminarProducto(index){
    total -= carrito[index].precio * carrito[index].cantidad;
    carrito.splice(index, 1);
    irCarrito();
}

function irFactura(){

    console.log("GENERANDO FACTURA");

    if(carrito.length === 0){
        alert("Carrito vacío ❌");
        return;
    }

    let user = usuarioActual || localStorage.getItem("usuario");

if(!user){
    alert("Debes iniciar sesión ❌");
    mostrar("inicio");
    return;
}

    let contenedor = document.getElementById("factura");

    contenedor.innerHTML = `
<div id="pdf" class="factura-box">
    <div style="text-align:center;">
        <img src="logo.jpeg" style="width:200px;">
        <h2>🍫 ChocoSain</h2>
    </div>

    <p><b>Cliente :</b> ${user}</p>
    <p><b>Fecha :</b> ${new Date().toLocaleString()}</p>

        <table>
            <tr>
                <th>Producto</th>
                <th>Cant</th>
                <th>Total</th>
            </tr>
            ${carrito.map(p => `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.cantidad}</td>
                    <td>$${p.precio * p.cantidad}</td>
                </tr>
            `).join("")}
        </table>

        <h3>Total: $${total}</h3>
    </div>
    `;

    mostrar("facturaSec");
}

function descargarPDF(){

    let elemento = document.getElementById("pdf");

    if(!elemento){
        alert("Genera la factura primero ❌");
        return;
    }

    console.log("Generando PDF REAL...");

    html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {

        let imgData = canvas.toDataURL("image/png");

        let pdf = new window.jspdf.jsPDF("p", "mm", "a4");

        let imgWidth = 210;
        let pageHeight = 297;

        let imgHeight = canvas.height * imgWidth / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("factura.pdf");

    }).catch(err => {
        console.log(err);
        alert("Error generando PDF ❌");
    });
}

function irPago(){
    let pantalla = document.getElementById("pagoSec");

    pantalla.innerHTML = `
        <div class="pago-box">
            <h2>💳 Pago</h2>

            <p>Total: <b>$${total}</b></p>

            <select id="metodo">
                <option value="">Selecciona método</option>
                <option value="pse">PSE 🏦</option>
                <option value="nequi">Nequi 📱</option>
                <option value="efectivo">Efectivo 💵</option>
            </select>

            <div id="formPago"></div>

            <button onclick="pagar()">Pagar ahora</button>
        </div>
    `;

    document.getElementById("metodo").addEventListener("change", mostrarFormulario);

    mostrar("pagoSec");
}

function mostrarFormulario(){
    let metodo = document.getElementById("metodo").value;
    let form = document.getElementById("formPago");

    if(metodo === "pse"){
        form.innerHTML = `
            <select id="banco">
                <option value="">Selecciona banco</option>
                <option>Bancolombia</option>
                <option>Davivienda</option>
                <option>BBVA</option>
                <option>Banco de Bogotá</option>
            </select>
            <input id="documento" placeholder="Documento">
            <input id="correo" placeholder="Correo">
        `;
    }
    else if(metodo === "nequi"){
        form.innerHTML = `
            <input id="telefono" placeholder="Número de celular">
        `;
    }
    else if(metodo === "efectivo"){
        form.innerHTML = `<p>Pagas al recibir 💵</p>`;
    }
    else{
        form.innerHTML = "";
    }
}

function pagar(){

    console.log("ENTRÓ A PAGAR 🔥");

    let metodo = document.getElementById("metodo").value;

    if(!metodo){
        alert("Selecciona un método ❌");
        return;
    }

    let usuario = localStorage.getItem("usuario");

if(!usuario){
    alert("Usuario no encontrado ❌");
    return;
}

    let pantalla = document.getElementById("pagoSec");

    // 🔥 VALIDACIONES SEGÚN MÉTODO
    if(metodo === "pse"){
        let banco = document.getElementById("banco").value;
        let documento = document.getElementById("documento").value;

        if(!banco || !documento){
            alert("Completa datos PSE ❌");
            return;
        }

        pantalla.innerHTML = `
            <div class="pago-box">
                <h2>🔄 Redirigiendo a ${banco}...</h2>
                <div class="loader"></div>
            </div>
        `;

        metodo = "PSE - " + banco;
    }

    if(metodo === "nequi"){
        let telefono = document.getElementById("telefono").value;
        if(!telefono){
            alert("Ingresa número ❌");
            return;
        }
    }

    if(metodo === "efectivo"){
        metodo = "Efectivo";
    }

    // 🔥 GUARDAR EN MYSQL
    setTimeout(() => {

        fetch("https://enduring-second-economy.ngrok-free.dev/guardarPedido", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                usuario,
                carrito,
                total,
                metodo
            })
        })
        .then(res => res.json())
        .then(data => {

            console.log("RESPUESTA:", data);

            if(!data.ok){
                alert("No se guardó ❌");
                return;
            }

            pantalla.innerHTML = `
                <div class="pago-box exito">
                    <h2>✅ Pago exitoso</h2>
                    <p>Total: $${total}</p>
                    <p>Método: ${metodo}</p>
                    <button onclick="reiniciar()">Finalizar</button>
                </div>
            `;
        })
        .catch(err => {
            console.log(err);
            alert("Error con servidor ❌");
        });

    }, 2000);
}

function reiniciar(){
    carrito = [];
    total = 0;
    location.reload();
}

function animacionClick(e){
    for(let i=0;i<10;i++){
        let d = document.createElement("div");

        d.className = "animacion";
        d.style.left = (e.pageX + (Math.random()*20-10)) + "px";
        d.style.top = (e.pageY + (Math.random()*20-10)) + "px";

        document.body.appendChild(d);

        setTimeout(()=>d.remove(), 500);
    }
}

document.addEventListener("click", animacionClick);