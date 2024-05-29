
const express = require('express');

const router = express.Router();

const { booksController } = require('../controllers/index');

router.get('/getBooks', booksController.getBooks);
router.post('/createBook', booksController.createBook);
router.put('/updateBook', booksController.updateBook);
router.delete('/deleteBook/:id', booksController.deleteBook);

module.exports = router;