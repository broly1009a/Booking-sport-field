const fieldComplexService = require('../services/fieldComplex.service');

const createFieldComplex = async (req, res) => {
    try {
        const imageFiles = req.files || [];
        const fieldComplex = await fieldComplexService.createFieldComplex(req.body, imageFiles);
        res.status(201).json(fieldComplex);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getAllFieldComplexes = async (req, res) => {
    try {
        const complexes = await fieldComplexService.getAllFieldComplexes();
        res.json(complexes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getFieldComplexById = async (req, res) => {
    try {
        const complex = await fieldComplexService.getFieldComplexById(req.params.id);
        if (!complex) return res.status(404).json({ error: 'Not found' });
        res.json(complex);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateFieldComplex = async (req, res) => {
    try {
        const imageFiles = req.files || [];
        const complex = await fieldComplexService.updateFieldComplex(req.params.id, req.body, imageFiles);
        if (!complex) return res.status(404).json({ error: 'Not found' });
        res.json(complex);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteFieldComplex = async (req, res) => {
    try {
        const complex = await fieldComplexService.deleteFieldComplex(req.params.id);
        if (!complex) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addStaffToFieldComplex = async (req, res) => {
    try {
        const { staffId } = req.body;
        if (!staffId) return res.status(400).json({ error: 'Missing staffId' });
        const updated = await fieldComplexService.addStaffToFieldComplex(req.params.id, staffId);
        if (!updated) return res.status(404).json({ error: 'FieldComplex not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const removeStaffFromFieldComplex = async (req, res) => {
    try {
        const { staffId } = req.body;
        if (!staffId) return res.status(400).json({ error: 'Missing staffId' });
        const updated = await fieldComplexService.removeStaffFromFieldComplex(req.params.id, staffId);
        if (!updated) return res.status(404).json({ error: 'FieldComplex not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    createFieldComplex,
    getAllFieldComplexes,
    getFieldComplexById,
    updateFieldComplex,
    deleteFieldComplex,
    addStaffToFieldComplex,
    removeStaffFromFieldComplex
};
