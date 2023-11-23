import chai from 'chai';  
import supertest from 'supertest'; 
import { generateMockProduct } from '../src/moking/utils.moking.js';

const expect = chai.expect; 
const requester = supertest("http://localhost:8080");  


describe("Testing PokeShop App", () => {
        describe("Testing login and session with Cookies:", () => {
            before(function(){
                this.cookie;
                this.mockUser = {
                     first_name: "Usuario de prueba 10",
                     last_name: "Apellido de prueba 10",
                     email : "correodeprueba10@gmail.com", 
                     age: "99",
                     password : "Messi123"
                };
            });
                it("Test Registro Usuario: Debe poder registrar correctamente un usuario", async function(){
                console.log(this.mockUser);  
                const {
                    statusCode,
                    ok,
                    _body
                } = await requester.post('/api/sessions/register').send(this.mockUser);
                console.log(statusCode);
                console.log(_body);
                expect(ok).to.be.ok;
                expect(_body.status).to.be.deep.equal('success')
                expect(statusCode).is.equal(200); 
            });
                it("Test Login Usuario: Debe poder hacer login correctamente con el usuario registrado previamente", async function(){
                const mockLogin = {
                    email: this.mockUser.email,
                    password: this.mockUser.password
                };
                const result = (await requester.post("/api/sessions/login").send(mockLogin)); 
                const cookieResult = result.headers['set-cookie'][0]; 
                console.log(cookieResult); 
                expect(result.statusCode).is.equal(200); 
                const cookieData = cookieResult.split('='); 
                this.cookie = {
                    name: cookieData[0],
                    value: cookieData[1]
                };
                expect(this.cookie.name).to.be.ok.and.eql('coderCookieToken');
                expect(this.cookie.value).to.be.ok 
            });
                it("Test Ruta Protegida: Debe enviar la cookie que contiene el usuario y destructurarlo correctamente.", async function () {
                const response = await requester.get("/api/sessions/current").set('Cookie', [`${this.cookie.name}=${this.cookie.value}`]);
            
             if (response.status === 200) {
             expect(response.body).to.have.property('status').that.eqls('ok');
             expect(response.body).to.have.property('payload').that.is.an('object');
             expect(response.body.payload).to.have.property('email').that.eqls(this.mockUser.email);
             } else if (response.status === 401) {
             expect(response.body).to.have.property('status').that.eqls('error');
             } else {
            console.log("Código de estado no manejado:", response.status);
             }
            });
        });
        describe("Testing Products Api", () => {
            before(async function(){
                this.cookie;
                this.mockUser = {
                    first_name: "Usuario de prueba 115",
                    last_name: "Apellido de prueba 115",
                    email : "correodeprueba116@gmail.com", 
                    age: "99",
                    password : "123456",
                    adminRole:true,
                    premiumRole:false
               };
                await requester.post("/api/sessions/register").send(this.mockUser); 
                this.mockLogin = {
                    email: this.mockUser.email,
                    password: this.mockUser.password
                }
                const result = (await requester.post("/api/sessions/login").send(this.mockLogin)); 
                const cookieResult = result.headers['set-cookie'][0];  
                expect(result.statusCode).is.equal(200); 
                const cookieData = cookieResult.split('='); 
                this.cookie = {
                    name: cookieData[0],
                    value: cookieData[1]
                };
                expect(this.cookie.value).to.be.ok 
            });
                it("Obtener Productos: El API GET /api/products debe devolver un array con los productos", async () => {
                  const { statusCode, ok, _body } = await requester.get("/api/products");
                  expect(statusCode).to.be.eql(200);
                  expect(ok).to.be.true;
                  expect(_body.payload).to.be.an("array");
            });
                it("Deberia crear un producto si estas loggeado y tu rol lo permite - POST /api/products/", async function () {
                  const productMock = generateMockProduct();
                  const createProductResponse = await requester
                    .post("/api/products")
                    .set('Cookie', [`${this.cookie.name}=${this.cookie.value}`])
                    .send(productMock);
                  expect(createProductResponse.statusCode).to.be.eql(200);
                  expect(createProductResponse.body).to.be.an("object");
            });
                it("Si se quiere crear un producto sin estar loggeado, deberia retornar un status 401 - POST /api/products", async function () {
                  const productMock = generateMockProduct();
                  const { statusCode, ok } = await requester
                    .post("/api/products")
                    .send(productMock);
                  expect(ok).to.be.not.ok;
                  expect(statusCode).to.be.eql(401);
            });
            /*
            describe("Case: User logger", () => {
                before(async function(){
                    this.cookie;
                    this.mockUser = {
                        first_name: "Usuario de prueba 112",
                        last_name: "Apellido de prueba 112",
                        email : "correodeprueba112@gmail.com", 
                        age: "99",
                        password : "123456",
                        rol: "admin"
                   };
                    await requester.post("/api/sessions/register").send(this.mockUser);
                    this.mockLogin = {
                        email: this.mockUser.email,
                        password: this.mockUser.password
                    }
                    const result = (await requester.post("/api/sessions/login").send(this.mockLogin)); 
                    const cookieResult = result.headers['set-cookie'][0];  
                    expect(result.statusCode).is.equal(200); 
                    const cookieData = cookieResult.split('='); 
                    this.cookie = {
                        name: cookieData[0],
                        value: cookieData[1]
                    };
                    expect(this.cookie.value).to.be.ok 
                });
                it("Crear Producto: El API POST /api/products debe crear un nuevo producto correctamente", async function(){
                  const productMock = generateMockProduct();
                  expect(this.cookie.name).to.be.ok.and.eql('coderCookieToken');
                  const {
                    ok,
                    statusCode
                  } = await requester
                    .post('/api/products')
                    .set('Cookie', `${this.cookie.name}=${this.cookie.value}`)
                    .send(productMock);
                  console.log('Response:', { ok, statusCode });
                  expect(ok).to.be.true;
                  expect(statusCode).to.be.equal(200); 
              });
        });
        
                it("Obtener Productos: El API GET /api/products debe devolver un array con los productos", async function(){
                  const {
                        ok,
                        statusCode,
                        _body
                  } = (await requester.get('/api/products').send());
                  console.log('Response:', { ok, statusCode, _body });
                  expect(ok).to.be.true;
                  expect(statusCode).to.be.equal(200)
                  expect(_body).to.have.property("payload").and.to.be.a("array")
                })
          */
        }); 
        describe("Testing Carts Api",()=>{
            describe("Normal user is logged in cases", ()=> {
                before(async function(){
                    this.cookieCart;
                    this.cookieToken;
                    const {_body} = await requester.get("/api/products").send()
                    this.product = _body.payload[0]
                    this.mockUser = {
                        first_name: "Usuario de prueba 115",
                        last_name: "Apellido de prueba 115",
                        email : "correodeprueba116@gmail.com", 
                        age: "99",
                        password : "123456",
                        rol: "admin"
                   };
                    await requester.post("/api/sessions/register").send(this.mockUser);
                    const result = await requester.post("/api/sessions/login").send({ email: this.mockUser.email, password: this.mockUser.password});
                    let not_founded = true;
                    let cookieTokenResult = ''
                    let i = 0;
                    while(not_founded){
                        let cookie = result.headers["set-cookie"][i]
                        if(cookie.split('=')[0] === 'commerceCookieToken'){
                            not_founded = false;
                            cookieTokenResult = cookie;
                        }
                        i++
                    }
                    not_founded = true;
                    i = 0;
                    let cookieCartResult
                    while(not_founded){
                        let cookie = result.headers["set-cookie"][i]
                        if(cookie.split('=')[0] === 'cartCookie'){
                            not_founded = false;
                            cookieCartResult = cookie;
                        }
                        i++
                    }
                    expect(cookieTokenResult).to.be.ok;
                    expect(cookieCartResult).to.be.ok;
                    this.cookieCart = {
                        name: cookieCartResult.split('=')[0],
                        value: cookieCartResult.split('=')[1]
                    }
                    if(cookieTokenResult){
                        const {_body} = await requester.get("/api/sessions/current").set('Cookie', [`${cookieTokenResult.split('=')[0]}=${cookieTokenResult.split('=')[1]}`]);
                        this.cookieToken = {
                            name: cookieTokenResult.split('=')[0],
                            value: _body,
                            jwt: cookieTokenResult.split('=')[1] 
                        }
                    }
                })
                it("Añadir producto a carrito: El API PUT /apis/carts/:cid/product debe dejar añadir un producto", async function(){
                    const productMock = {product_id: this.product._id, quantity: 2}
                    expect(this.cookieToken.name).to.be.ok.and.eql('commerceCookieToken');
                    const {statusCode, _body, ok} = await requester.put("/api/carts/"+this.cookieToken.value.cart+"/product")
                        .set('Cookie',[`${this.cookieCart.name}=${this.cookieCart.value}`,`${this.cookieToken.name}=${this.cookieToken.jwt}`])
                        .send(productMock);
                    expect(ok).to.be.ok;
                    expect(statusCode).to.be.equal(200)
                    expect(_body).to.have.property("products")
                })
                it("Aumentar cantidad de producto en carrito: El API PUT /apis/carts/:cid/product/:pid debe modificar la cantidad del producto", async function(){
                    expect(this.cookieToken.name).to.be.ok.and.eql('commerceCookieToken');
                    const {statusCode, _body, ok} = await requester.put("/api/carts/"+this.cookieToken.value.cart+"/product/"+this.product._id)
                        .set('Cookie',[`${this.cookieCart.name}=${this.cookieCart.value}`,`${this.cookieToken.name}=${this.cookieToken.jwt}`])
                        .send({quantity: 5});
                    expect(statusCode).to.be.equal(200)
                    expect(_body).to.have.property("products")
                    expect(_body.products[0].quantity).to.be.deep.equal(5)
                })
                it("Eliminar productos de carrito: El API DELETE /apis/carts/:cid debe dejar eliminar todos los productos del carrito", async function(){
                    expect(this.cookieToken.name).to.be.ok.and.eql('commerceCookieToken');
                    const {statusCode, _body, ok} = await requester.delete("/api/carts/"+this.cookieToken.value.cart)
                        .set('Cookie',[`${this.cookieCart.name}=${this.cookieCart.value}`,`${this.cookieToken.name}=${this.cookieToken.jwt}`])
                        .send();
                    expect(statusCode).to.be.equal(200)
                    expect(_body).to.have.property("data").and.to.have.property("cid").and.to.be.deep.equal(this.cookieToken.value.cart)
                })
            })
        })
    });