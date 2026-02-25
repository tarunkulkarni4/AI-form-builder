const express = require('express');
const router = express.Router();
const { createGoogleForm, getUserForms, deleteForm, expandForm, duplicateForm, bulkDeleteForms } = require('../controllers/formController');

router.post('/create', createGoogleForm);
router.get('/user/:userId', getUserForms);
router.delete('/:id', deleteForm);
router.post('/expand/:id', expandForm);
router.post('/duplicate/:id', duplicateForm);
router.post('/bulk-delete', bulkDeleteForms);

module.exports = router;
