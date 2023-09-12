const User = require("../models/User")
const { validationResult } = require('express-validator')
const { nanoid } = require('nanoid')
const nodemailer = require('nodemailer')
require('dotenv').config()


const registerForm = (req, res) => {
   res.render('register', 
   //-Este objeto ahora se envia desde variables globales-locals
   /* { mensajes: req.flash('mensajes'), csrfToken: req.csrfToken() } */
   )
}


const registerUser = async (req, res) => {
   const errors = validationResult(req)
   if(!errors.isEmpty()) {
      //-Esto viene de Flash
      req.flash('mensajes', errors.array())
      return res.redirect('/auth/register')
   }

   const { userName, email, password } = req.body
   try {
      let user = await User.findOne({ email: email })
      if(user) throw new Error('ya existe el usuario')
      
      user = new User({ 
         userName, 
         email, 
         password,
         tokenConfirm: nanoid()
      })
      await user.save()

      //-Enviar correo
      const transport = nodemailer.createTransport({
         host: "sandbox.smtp.mailtrap.io",
         port: 2525,
         auth: {
            user: process.env.USEREMAIL,
            pass: process.env.PASSEMAIL
         }
      });

      await transport.sendMail({
         from: '"Fred Foo 👻" <foo@example.com>',
         to: user.email,
         subject: 'Verificar cuemta en Ecomerce',
         html: `<a href="${process.env.PATHWEB || 'http://localhost:5000'}/auth/confirmar/${user.tokenConfirm}">click aqui</a>`
      });


      req.flash('mensajes', [{ msg: 'Revisa correo y valida'}])
      res.redirect('/auth/login')


   } catch (error) {
      req.flash('mensajes', [{ msg: error.message }])
      return res.redirect('/auth/register')
   }
}


const confirmarCuenta = async (req, res) => {
   const { token } = req.params
   try {
      const user = await User.findOne({ tokenConfirm: token })
      if(!user) throw new Error('No existe este usuario')

      user.cuentaConfirmada = true
      user.tokenConfirm = null
      await user.save()
      req.flash('mensajes', [{ msg: 'Cuenta verificada'}])
      
      res.redirect('/auth/login')


   } catch (error) {
      req.flash('mensajes', [{ msg: error.message}])
      return res.redirect('/auth/login')
   }
}


const loginForm = (req, res) => {
   res.render('login')
}


const loginUser = async (req, res) => {
   const errors = validationResult(req)
   if(!errors.isEmpty()) {
      //-Esto viene de Flash
      req.flash('mensajes', errors.array())
      return res.redirect('/auth/login')
   }

   const { email, password } = req.body
   try {
      const user = await User.findOne({ email })

      if(!user) 
      throw new Error('no existe este email');
      
      if(!user.cuentaConfirmada) 
      throw new Error('cuenta no confirmada');

      if(!(await user.comparePassword(password)))
      throw new Error('clave incorrecta');

      //-Crea la sesion de usuario - passport
      req.login(user, function(err) {
         if(err) throw new Error('Error al crear la sesion')
         return res.redirect('/')
      })

   } catch (error) {
      req.flash('mensajes', [{ msg: error.message}])
      return res.redirect('/auth/login')
   }
} 


const cerrarSesion = (req, res) => {
   const user = req.user
   req.logout(user, function(err) {
      if(err) throw new Error('Error al cerrar la sesion')
      return res.redirect('/auth/login');
   });
}


module.exports = {
   registerForm,
   registerUser,
   confirmarCuenta,
   loginForm,
   loginUser,
   cerrarSesion
}