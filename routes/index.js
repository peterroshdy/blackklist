var express = require('express');
var router = express.Router();

/* Set language cookie always from the home page */
router.get('/lang/:lang', (req, res) => {
  if(req.params.lang == 'en'){
    res.cookie('lang', 'en', {maxAge: 1000 * 60 * 60 * 24 * 30});
    res.redirect('/');
  }else{
    res.cookie('lang', 'ar', {maxAge: 1000 * 60 * 60 * 24 * 30});
    res.redirect('/');
  }
});

/* GET home page. */
router.get('/', (req, res, next) => {
  checkLang(req, res, 'index');
});

module.exports = router;
