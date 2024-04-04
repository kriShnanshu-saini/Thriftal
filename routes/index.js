var express = require('express');
var router = express.Router();
var productdetails = require('../models/productdetails');
var rentdetails = require('../models/rentdetails');
//var Cart= require('../models/cart');
var userdetails = require('../models/userdetails');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');

var multer = require('multer');
const path = require('path');
const { title } = require('process');
var storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
	},
});

var upload = multer({
	storage: storage,
}).single('image');

router.get('/', function (req, res, next) {
	const locals = {
		title: 'Thriftal',
	};
	res.render('home', locals);
});

router.get('/index', async function (req, res, next) {
	const data = await productdetails.find({});
	console.log('....data', data);
	res.render('index', { productdetails: data });
});

router.get('/adddetails', ensureAuthenticated, function (req, res, next) {
	res.render('adddetails', {
		name: req.user.name,
	});
});

router.post('/adddetails', upload, async function (req, res, next) {
	console.log(req.file);
	var productdetail = new productdetails({
		name: req.body.name,
		price: req.body.price,
		condition: req.body.condition,
		description: req.body.description,
		size: req.body.size,
		image: req.file.filename,
	});

	const productDet = await productdetails.create(productdetail);
	if (!productDet) return console.log('Error adding product');
	res.render('editdelete', { productdetails: productDet });
});

router.get('/viewdetails/:_id', async function (req, res, next) {
	const productDet = await productdetails.findOne({ _id: req.params._id });
	if (!productDet) return console.log('Error adding product');
	res.render('viewdetails', { productdetails: productDet });
});

router.get('/confirmation', function (req, res, next) {
	res.render('confirmation');
});
router.get('/confirmation/:id', async function (req, res, next) {
	const productDet = await productdetails.findOne({ _id: req.params._id });
	if (!productDet) return console.log('Error adding product');
	res.render('confirmation', { productdetails: productDet });
});

router.get('/cart', function (req, res, next) {
	res.render('rentcart');
});
router.get('/cart/:id', async function (req, res, next) {
	const rentDet = await rentdetails.findOne({ _id: req.params._id });
	if (!rentDet) return console.log('Error adding product');
	res.render('rentcart', { rentdetails: rentDet });
});

router.get('/cart1', async function (req, res, next) {
  const productDet = await productdetails.findOne({});
	if (!productDet) return console.log('Error adding product');
	res.render('cart', { productdetails: productDet });
});
router.get('/cart1/:id', async function (req, res, next) {
	const productDet = await productdetails.findOne({ _id: req.params.id });
	if (!productDet) return console.log('Error adding product');
	res.render('cart', { productdetails: productDet });
});

router.get('/delete/:_id', async function (req, res, next) {
	const productDet = await productdetails.deleteOne({ _id: req.params._id });
	if (!productDet) return console.log('Error adding product');
	res.redirect('/index');
});
router.get('/delete1/:_id', async function (req, res, next) {
	const deletedProduct = await productdetails.deleteOne({ _id: req.params._id });
	console.log('deleted.....', deletedProduct);
	res.redirect('/index');
});

router.get('/editdelete', function (req, res, next) {
	res.render('editdelete');
});

router.get('/delete1/:_id', async function (req, res, next) {
	const deletedProduct = await productdetails.deleteOne({ _id: req.params._id })
		console.log('product deleted.....', deletedProduct);
		res.redirect('/index');
});

router.get('/update/:_id', async function (req, res, next) {
	const productDet = await productdetails.findOne({ _id: req.params._id })
		console.log('movie selected........', productDet);
		res.render('updatedetails', { productdetails: productDet });
});

// TODO: updated data not provided
router.post('/update', async function (req, res, next) {
	await productdetails.findOneAndUpdate({ _id: req.body._id })
		res.redirect('/index');
});

router.get('/rentproducts', async function (req, res, next) {
	const rentDetail = await productdetails.find();
	console.log('rentDetails: ', rentDetail);
	res.render('rentproducts', { rentdetails: rentDetail });
});

router.get('/rentdetails', function (req, res, next) {
	res.render('rentdetails');
});

router.post('/rentdetails', upload, async function (req, res, next) {
	console.log(req.file);
	var rentdetail = new rentdetails({
		name: req.body.name,
		price: req.body.price,
		condition: req.body.condition,
		description: req.body.description,
		image: req.file.filename,
	});
    
    const rentDet = await rentdetails.create(rentdetail); 
    if(!rentDet) console.error('unable to store rent details')
    res.render('save', { rentdetails: rentDet });
});

router.get('/viewrentdetails/:_id', async function (req, res, next) {
	const rentDet = await rentdetails.findOne({ _id: req.params._id })
		console.log('product selected.....', rentDet);
		res.render('viewrentdetails', { rentdetails: rentDet });
});

router.get('/cartdisplay/:_id', async function (req, res, next) {
	const productDet = await productdetails.findOne({ _id: req.params._id })
		console.log(',,,,,data', productDet);
		var displaycart = { items: [{ name: 'name', price: 'price' }] };
		for (var item in productDet) {
			displaycart.items.push(productDet[item]);
			// total += (productdetails[item].price)
		}

		res.render('cart');
});

// router.post('/cart1',function(req, res, next) {

//   var orderdetail = new orderdetails({
//   name: req.body.name,
//   price: req.body.price,

// })

// var promise = orderdetail.save()
// promise.then((orderdetails) => {
//   console.log('product saved',orderdetails)
//   res.render('cart', {orderdetails});
// }).catch((error)=>{
//    console.log(error);
// })
// });

router.get('/login', function (req, res, next) {
	res.render('login');
});

router.get('/register', function (req, res, next) {
	res.render('register');
});
router.post('/register', (req, res) => {
	const { name, email, password, password2 } = req.body;
	let errors = [];

	if (!name || !email || !password || !password2) {
		errors.push({ msg: 'Please enter all fields' });
	}

	if (password != password2) {
		errors.push({ msg: 'Passwords do not match' });
	}

	if (password.length < 4) {
		errors.push({ msg: 'Password must be at least 4 characters' });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			name,
			email,
			password,
			password2,
		});
	} else {
		userdetails.findOne({ email: email }).then(user => {
			if (user) {
				errors.push({ msg: 'Email is already registered' });
				res.render('register', {
					errors,
					name,
					email,
					password,
					password2,
				});
			} else {
				const newUser = new userdetails({
					name,
					email,
					password,
				});

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser
							.save()
							.then(user => {
								req.flash('success_msg', 'You are now registered and can log in');
								res.redirect('/login');
							})
							.catch(err => console.log(err));
					});
				});
			}
		});
	}
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/index',
		failureRedirect: '/login',
		failureFlash: true,
	})(req, res, next);
});

router.get('/checkout', function (req, res, next) {
	res.render('checkout');
});
// router.post('/rentdetails',upload, function(req, res, next) {
//   console.log(req.file)
//   var rentdetail = new rentdetails({
//   name: req.body.name,
//   price: req.body.price,
//   condition: req.body.condition,
//   description: req.body.description,
//   image: req.file.filename,

// })

// var promise = rentdetail.save()
// promise.then((rentdetails) => {
//   console.log('product saved',rentdetails)
//   res.render('save', {rentdetails});
// }).catch((error)=>{
//    console.log(error);
// })
// });

//  router.get('/add-to-cart/:id', function(req, res, next){
//    var productId = req.params.id;
//  var cart = new Cart(req.session.cart ? req.session.cart : {});

//    productdetails.findById(productId, function(err, productdetails) {
//      if (err){
//        return res.redirect('/index');
//      }
//     cart.add(productdetails, productdetails.id);
//     req.session.cart = cart;
//     console.log(req.session.cart);
//     res.redirect('/index');
//    });
//  });

module.exports = router;
