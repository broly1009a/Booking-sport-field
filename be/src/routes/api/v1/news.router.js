const express = require('express');
const router = express.Router();
const NewsController = require('../../../controllers/news.controller');

 const { checkRoles } = require('../../../middlewares/auth.middleware');

router.get('/', NewsController.getAllNews);
router.get('/:id', NewsController.getNewsById);

//manager 
router.post('/',checkRoles(['MANAGER']), NewsController.createNews);
router.put('/:id', checkRoles(['MANAGER']), NewsController.updateNews);
router.delete('/:id', checkRoles(['MANAGER']), NewsController.deleteNews);

module.exports = router;