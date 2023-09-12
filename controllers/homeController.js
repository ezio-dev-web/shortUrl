const Url = require('../models/Url')
const { nanoid } = require('nanoid')


const leerUrls = async (req, res) => {
   try {
      const urls = await Url.find({user: req.user.id}).lean()
      res.render('home', {urls: urls})

      
   } catch (error) {
      req.flash('mensajes', [{ msg: error.message }])
      return res.redirect('/')
   }
}


const agregarUrl = async (req, res) => {
   const { origin } = req.body

   try {
      const url = new Url(
         { 
            origin: origin, 
            shortURL: nanoid(8),
            user: req.user.id
         }
      )
      await url.save()
      req.flash('mensajes', [{ msg: 'Url agregada' }])
      res.redirect('/')


   } catch (error) {
      req.flash('mensajes', [{ msg: error.message }])
      return res.redirect('/')
   }
}


const eliminarUrl = async (req, res) => {
   const { id } = req.params

   try {
      //-req.user viene de la sesion y tiene id y userName
      const url = await Url.findById(id)
      if(!url.user.equals(req.user.id)){
         throw new Error('No es tu Url')
      }

      await url.deleteOne()
      req.flash('mensajes', [{ msg: 'Url eliminada' }])
      return res.redirect("/")

      
   } catch (error) {
      req.flash('mensajes', [{ msg: error.message }])
      return res.redirect('/')
   }
}


const editarUrlForm = async (req, res) => {
   const { id } = req.params

   try {
      const url = await Url.findById(id).lean()
      if(!url.user.equals(req.user.id)){
         throw new Error('No es tu Url')
      }

      return res.render('home', {url: url})

      
   } catch (error) {
      req.flash('mensajes', [{ msg: error.message }])
      return res.redirect('/')
   }
}


const editarUrl = async (req, res) => {
   const { id } = req.params
   const { origin } = req.body

   try {
      const url = await Url.findById(id)
      if(!url.user.equals(req.user.id)){
         throw new Error('No es tu Url')
      }

      await url.updateOne({ origin })
      req.flash('mensajes', [{ msg: 'Url editada' }])
      return res.redirect('/')

      
   } catch (error) {
      req.flash('mensajes', [{ msg: error.message }])
      return res.redirect('/')
   }
}


const redirectUrl = async (req, res) => {
   const { shortURL } = req.params
   
   try {
      const urlDB = await Url.findOne({ shortURL: shortURL })
      if (!urlDB) throw new Error("No existe la url");

      return res.redirect(urlDB.origin);

      
   } catch (error) {
      req.flash('mensajes', [{ msg: error.message }])
      return res.redirect('/auth/login')
   }
}


module.exports = {
   leerUrls,
   agregarUrl,
   eliminarUrl,
   editarUrlForm,
   editarUrl,
   redirectUrl
}