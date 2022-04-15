const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

require('./database');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const companiesRouter = require('./routes/companies');
const ordersRouter = require('./routes/orders');
const placesRouter = require('./routes/places');

const app = express();

const origin = [
	'54.76.178.89',
	'54.154.216.60',
	'23.105.225.142',
	'23.108.217.143',
	'localhost',
];

const corsOptions = {
	origin,
	// credentials: true,
};

app.use(logger('dev'));
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('___cookie_secret_key_2022___'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/companies', companiesRouter);
app.use('/places', placesRouter);
app.use('/orders', ordersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.json({
		success: false,
		errors: [
			{
				field: null,
				error: err,
			},
		],
	});
});

module.exports = app;
