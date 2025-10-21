const fieldComplexService = require('../services/fieldComplex.service');

const createFieldComplex = async (req, res) => {
    try {
        const fieldComplex = await fieldComplexService.createFieldComplex(req.body);
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
        const complex = await fieldComplexService.updateFieldComplex(req.params.id, req.body);
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

module.exports = {
    createFieldComplex,
    getAllFieldComplexes,
    getFieldComplexById,
    updateFieldComplex,
    deleteFieldComplex
};
