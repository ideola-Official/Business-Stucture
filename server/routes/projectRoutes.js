const express = require('express');
const Project = require('../models/Project');

const router = express.Router();

// POST /api/projects - create new project with blocks + connections
router.post('/', async (req, res) => {
  try {
    const { title, userId, blocks = [], connections = [] } = req.body || {};

    if (!title || !userId) {
      return res.status(400).json({ error: 'title and userId are required' });
    }

    const project = await Project.create({ title, userId, blocks, connections });
    return res.status(201).json(project);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects/:id - get project by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    console.error(`GET /api/projects/${req.params.id} error:`, error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUT /api/projects/:id - update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, userId, blocks, connections } = req.body || {};

    const project = await Project.findByIdAndUpdate(
      id,
      { title, userId, blocks, connections },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    console.error(`PUT /api/projects/${req.params.id} error:`, error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
});

module.exports = router;


