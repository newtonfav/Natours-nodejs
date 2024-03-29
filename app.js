const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csp = require('express-csp');
const compression = require('compression');
const cors = require('cors');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const bookingController = require('./controller/bookingController');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const viewRouter = require('./routes/viewRouter');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARE
//implement CORS
app.use(cors());

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set security for header
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'https://*.mapbox.com', 'https://*.stripe.com'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       imgSrc: [
//         "'self'",
//         'https://www.gstatic.com',
//         'https://cdnjs.cloudflare.com',
//         'https://tile.openstreetmap.org',
//         'data:',
//       ],
//       scriptSrc: [
//         "'self'",
//         'unsafe-eval',
//         'https://*.stripe.com',
//         'https://cdnjs.cloudflare.com',
//         'https://api.mapbox.com',
//         'https://js.stripe.com',
//         // "'blob'",
//       ],
//       frameSrc: ["'self'", 'https://*.stripe.com'],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

// //Content security policy
// csp.extend(app, {
//   policy: {
//     directives: {
//       'default-src': ['self'],
//       'style-src': ['self', 'unsafe-inline', 'https:'],
//       'font-src': ['self', 'https://fonts.gstatic.com'],
//       'script-src': [
//         'self',
//         'unsafe-inline',
//         'unsafe-eval',
//         'data',
//         'blob',
//         'https://js.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:8828',
//         'ws://localhost:56558/',
//       ],
//       'worker-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:*',
//         'ws://localhost:*/',
//       ],
//       'frame-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:*',
//         'ws://localhost:*/',
//       ],
//       'img-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://tile.openstreetmap.org',
//         'https://bundle.js:*',
//         'ws://localhost:*/',
//       ],
//       'connect-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         // 'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:*',
//         'ws://localhost:*/',
//       ],
//     },
//   },
// });

//developmet logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Try again later!',
});
app.use('/api', limiter);

//implementing stripe webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// app.use(morgan('dev'));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS attack
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

//ROUTES
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 500));
});

app.use(globalErrorHandler);

module.exports = app;
