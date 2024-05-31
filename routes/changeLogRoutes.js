
const express = require('express');

const router = express.Router();

const { changeLogsController } = require('../controllers');

router.post('/getChangeLogs', changeLogsController.getChangeLogsGeneric);
router.post('/syncData', changeLogsController.syncDataGeneric);

module.exports = router;