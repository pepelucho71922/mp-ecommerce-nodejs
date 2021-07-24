var express = require('express');
var exphbs  = require('express-handlebars');
var mercadopago = require('mercadopago');
var port = process.env.PORT || 3000

console.log();

var app = express();

mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN_MP,
    integrator_id: process.env.INTEGRATOR_ID_MP
})

const payer= {
    name:"Lalo",
    surname: "Landa",
    email: "test_user_46542185@testuser.com",
    phone:{
        area_code: "11",
        number: 22223333
    },
    address:{
        zip_code: "1111",
        street_name: "Falsa",
        street_number: 123
    }  
  };
 
const  payment_methods = {
    exclude_payment_methods: [{
        id: "diners",
    }],
    exclude_payment_types: [{
        id: "atm",
    },],
    installments: 6
};

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', async function (req, res) {
    const items = [{
        id: "1234",
        tittle: req.query.title,
        description: "“Dispositivo móvil de Tienda e-commerce”",
        picture_url: req.get('host') + req.query.img.slice(1),
        quantity: +req.query.unit,
        unit_price: Number(req.query.price),
    }];
    const back_urls = {
        success: process.env.SUCCESS_URL,
        pending: process.env.PENDING_URL,
        failure: process.env.FAILURE,
    };
    const preferencia = {
        items,
        payer,
        payment_methods,
        external_reference: 'jose.gonzales.r@tecsup.edu.pe',
        back_urls,
        notification_url: process.env.NOTIFICATION_URL,
        auto_return: 'approved',
    };
    const resultado = await mercadopago.preferences.create(preferencia);
    //console.log(resultado);
    res.render('detail', { ...req.query, init_point: resultado.body.init_point});
    console.log(items);
})
app.get('/success', (req, res) => {
    res.render('success', req.query);
})
app.get('/pending', (req, res) => {
    res.render('pending', req.query);
})
app.get('/failure', (req, res) => {
    res.render('failure', req.query);
})

app.post('/ipn-mp', (req, res) => {
    console.log("----Querry------")
    console.log(req.query);
    console.log("----Body------")
    console.log(req.body);
    res.status(200).json({});
})


app.listen(port);