
const express = require('express');

const router = express.Router();

const userRoutes = require('./userRoutes');
const bookRoutes = require('./bookRoutes');
const changeLogRoutes = require('./changeLogRoutes');

const apiPrefix = '/api';

router.use(`${apiPrefix}/user`, userRoutes);
router.use(`${apiPrefix}/book`, bookRoutes);
router.use(`${apiPrefix}/changeLog`, changeLogRoutes);

module.exports = router;