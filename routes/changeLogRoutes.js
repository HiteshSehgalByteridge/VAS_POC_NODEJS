
const express = require('express');

const router = express.Router();

const { changeLogsController } = require('../controllers');

router.post('/getChangeLogs', changeLogsController.getChangeLogsV3);
router.post('/syncData', changeLogsController.syncData);

module.exports = router;