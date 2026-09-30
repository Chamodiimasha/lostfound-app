const router = require('express').Router();
const c = require('../controllers/itemController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
router.use(auth); // every item route is protected
router.route('/').get(c.getItems).post(upload, c.createItem);
router.route('/:id').get(c.getItem).put(upload, c.updateItem).delete(c.deleteItem);
module.exports = router;
