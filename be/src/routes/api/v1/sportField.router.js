const express = require('express');
const router = express.Router();
const { SportFieldController } = require('../../../controllers/index');
const { cloudinaryFileMiddleware } = require('../../../middlewares/index');


router.get('/', SportFieldController.getAllSportFields);
router.get('/:id', SportFieldController.getSportFieldById);
router.post('/', cloudinaryFileMiddleware.array('images', 10), SportFieldController.createSportField);
router.put('/:id', cloudinaryFileMiddleware.array('images', 10), SportFieldController.updateSportField);
router.delete('/:id', SportFieldController.deleteSportField);

module.exports = router;