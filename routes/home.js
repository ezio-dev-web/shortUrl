const express = require('express')
const { leerUrls, agregarUrl, eliminarUrl, editarUrlForm, editarUrl, redirectUrl } = require('../controllers/homeController')
const urlValidar = require('../middlewares/urlValidate')
const verificarUser = require('../middlewares/verificarUser')
const { formPerfil, editarFotoPerfil } = require('../controllers/perfilController')
const router = express.Router()


router.get('/', verificarUser, leerUrls)
router.post('/', verificarUser, urlValidar, agregarUrl)
router.get('/eliminar/:id', verificarUser, eliminarUrl)
router.get('/editar/:id', verificarUser, editarUrlForm)
router.post('/editar/:id', verificarUser, urlValidar, editarUrl)

router.get("/perfil", verificarUser, formPerfil)
router.post("/perfil", verificarUser, editarFotoPerfil)

router.get('/:shortURL', redirectUrl)



module.exports = router