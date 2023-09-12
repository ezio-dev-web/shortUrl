// Imports
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const mongoSanitize = require('express-mongo-sanitize')
const cors = require('cors')
const { create } = require('express-handlebars')
const csrf = require('csurf')
const User = require('./models/User')
require('dotenv').config()
const clientDB = require('./database/db')


// Variables
const app = express()
const PORT = process.env.PORT || 5000
const hbs = create({ extname: ".hbs", partialsDir: ["views/components"] })
const corsOptions = {
   credentials: true,
   origin: process.env.PATHWEB || "*",
   methods: ['GET', 'POST']
}


// Template-Engine
app.engine(".hbs", hbs.engine)
app.set("view engine", ".hbs")
app.set("views", __dirname + "/views")


// Middleware
app.use(cors(corsOptions))
app.use(
   session({ 
      secret: process.env.SECRETSESSION,
      resave: false,
      saveUninitialized: false,
      name: 'session-user',
      //-Session para production
      store: MongoStore.create({
         clientPromise: clientDB,
         dbName: process.env.DBNAME,
      }),
      //-No funciona en desarrollo local
      cookie: { secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 },
   })
)
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
//-Passport iniciar sesion
passport.serializeUser((user, done) => {
   done(null, 
      {
         id: user._id,
         userName: user.userName
      })
}) //req.user
passport.deserializeUser( async (user, done) => {
   const userDB = await User.findById(user.id)
   return done(null, 
      {
         id: userDB._id,
         userName: userDB.userName
      })
})
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitize())

//-CSRF 
app.use(csrf())
app.use((req, res, next) => {
   res.locals.csrfToken = req.csrfToken()
   res.locals.mensajes = req.flash("mensajes")
   next()
})


// Routers
app.use("/", require('./routes/home'))
app.use("/auth", require('./routes/auth'))


// Server-start
app.listen(PORT, () => {
   console.log(`Server Listen 🚀 http://localhost:${PORT}`);
})
