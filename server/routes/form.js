const express = require('express');
const router = express.Router();
const { createGoogleForm, getUserForms, deleteForm } = require('../controllers/formController');

router.post('/create', createGoogleForm);
router.get('/user/:userId', getUserForms);
router.delete('/:id', deleteForm);

module.exports = router;
