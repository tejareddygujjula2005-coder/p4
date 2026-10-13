const express = require('express');
const Item = require('../models/Item');

const router = express.Router();

router.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

router.post('/items', async (request, response) => {
  try {
    const item = await Item.create({
      name: request.body.name,
      description: request.body.description,
      price: request.body.price,
      inStock: request.body.inStock
    });

    response.status(201).json(item);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

router.get('/items', async (request, response) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    response.status(200).json(items);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.get('/items/:id', async (request, response) => {
  try {
    const item = await Item.findById(request.params.id);

    if (!item) {
      return response.status(404).json({ error: 'Item not found' });
    }

    response.status(200).json(item);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

router.put('/items/:id', async (request, response) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        description: request.body.description,
        price: request.body.price,
        inStock: request.body.inStock
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return response.status(404).json({ error: 'Item not found' });
    }

    response.status(200).json(updatedItem);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

router.delete('/items/:id', async (request, response) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(request.params.id);

    if (!deletedItem) {
      return response.status(404).json({ error: 'Item not found' });
    }

    response.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

module.exports = router;