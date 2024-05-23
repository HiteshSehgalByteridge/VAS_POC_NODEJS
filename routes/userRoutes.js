
const express = require('express');

const router = express.Router();

const { usersController } = require('../controllers/index');

router.get('/getUsers', usersController.getUsers);
router.post('/createUser', usersController.createUser);
router.put('/updateUser', usersController.updateUser);
router.delete('/deleteUser/:id', usersController.deleteUser);

module.exports = router;