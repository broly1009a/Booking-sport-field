const express = require('express');
const router = express.Router();
const FavoriteController = require('../../../controllers/favorite.controller');
// const authMiddleware = require('../middlewares/auth.middleware'); // nếu có middleware xác thực

// router.use(authMiddleware); // dùng nếu cần xác thực trước

router.post('/toggle', FavoriteController.toggleFavorite);
router.get('/my-favorites', FavoriteController.getFavorites);

module.exports = router;
