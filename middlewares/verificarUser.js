module.exports = (req, res, next) => {

   //-Esto viene de Passport
   if(req.isAuthenticated()) {
      return next()
   }
   res.redirect('/auth/login')
}