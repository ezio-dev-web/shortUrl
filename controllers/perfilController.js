const formidable = require('formidable')
const Jimp = require('jimp')
const fs = require('fs')
const path = require('path')
const User = require('../models/User')


module.exports.formPerfil = async (req, res) => {
   try {
      const user = await User.findById(req.user.id)

      return res.render("perfil", {
         user: req.user,
         imagen: user.imagen
      })

      
   } catch (error) {
      req.flash('mensajes', [{ msg: 'Error al leer el usuario' }])
      return res.redirect('/perfil')
   }
}


module.exports.editarFotoPerfil = (req, res) => {
   const form = new formidable.IncomingForm();
   form.maxFileSize = 50 * 1024 * 1024; //5MB

   form.parse(req, async(err, fields, files) => {
      
      try {
         const file = files.myFile
         
         if(file.originalFilename === '') {
            throw new Error('por favor agrega una imagen')
         }

         const imageTypes = ['image/jpeg', 'image/png']

         if(!imageTypes.includes(file.mimetype)){
            throw new Error('por favor agrega una imagen jpg o png')
         }

         if(file.size > 50 * 1024 * 1024) {
            throw new Error('Menos de 5MB por favor')
         }

         if(err) {
            throw new Error('fallo la subida de imagen')
         }

         const extension = file.mimetype.split("/")[1]
         const dirFile = path.join(
            __dirname, 
            `../public/img/perfiles/${req.user.id}.${extension}`
         )
         fs.renameSync(file.filepath, dirFile)

         const image = await Jimp.read(dirFile)
         image.resize(200, 200).quality(90).writeAsync(dirFile)

         const user = await User.findById(req.user.id)
         user.imagen = `${req.user.id}.${extension}`
         
         await user.save()
         req.flash('mensajes', [{ msg: 'se subio la imagen' }])


      } catch (error) {
         req.flash('mensajes', [{ msg: error.message }])

      } finally {
         return res.redirect("/perfil")
      }
   })
}