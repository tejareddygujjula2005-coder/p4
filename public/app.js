const itemForm = document.getElementById('itemForm');
const itemList = document.getElementById('itemList');
const itemCount = document.getElementById('itemCount');
const formTitle = document.getElementById('formTitle');
const submitButton = document.getElementById('submitButton');
const cancelEditButton = document.getElementById('cancelEdit');
const formMessage = document.getElementById('formMessage');

let items = [];
let editingId = null;

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Something went wrong. Please try again.');
  }

  return result;
};

const formatPrice = (price) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(price ?? 0);

const showMessage = (message, isError = false) => {
  formMessage.textContent = message;
  formMessage.dataset.error = String(isError);
};

const makeTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
};

const createItemRow = (item) => {
  const row = document.createElement('article');
  row.className = 'item-row';

  const details = document.createElement('div');
  details.className = 'item-details';
  details.append(
    makeTextElement('h3', 'item-name', item.name),
    makeTextElement('p', 'item-description', item.description || 'No description')
  );

  const price = makeTextElement('span', 'item-price', formatPrice(item.price));
  const stock = makeTextElement(
    'span',
    `stock-badge${item.inStock ? '' : ' out'}`,
    item.inStock ? 'In stock' : 'Out of stock'
  );
  stock.setAttribute('aria-label', `Availability: ${item.inStock ? 'in stock' : 'out of stock'}`);

  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const editButton = makeTextElement('button', 'item-action', 'Edit');
  editButton.type = 'button';
  editButton.dataset.action = 'edit';
  editButton.dataset.id = item._id;
  editButton.setAttribute('aria-label', `Edit ${item.name}`);

  const deleteButton = makeTextElement('button', 'item-action delete', 'Delete');
  deleteButton.type = 'button';
  deleteButton.dataset.action = 'delete';
  deleteButton.dataset.id = item._id;
  deleteButton.setAttribute('aria-label', `Delete ${item.name}`);

  actions.append(editButton, deleteButton);
  row.append(details, price, stock, actions);
  return row;
};

const renderItems = () => {
  itemCount.textContent = String(items.length);
  itemList.replaceChildren();

  if (items.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.append(
      makeTextElement('strong', '', 'Nothing in the catalog yet'),
      makeTextElement('span', '', 'Add your first item using the form.')
    );
    itemList.append(emptyState);
    return;
  }

  itemList.append(...items.map(createItemRow));
};

const loadItems = async () => {
  itemList.setAttribute('aria-busy', 'true');
  itemList.replaceChildren(makeTextElement('p', 'loading-state', 'Loading inventory...'));

  try {
    items = await request('/api/items');
    renderItems();
  } catch (error) {
    itemList.replaceChildren(makeTextElement('p', 'empty-state', error.message));
  } finally {
    itemList.setAttribute('aria-busy', 'false');
  }
};

const resetForm = () => {
  itemForm.reset();
  editingId = null;
  formTitle.textContent = 'Add an item';
  submitButton.replaceChildren(document.createTextNode('Add item '));
  const plus = document.createElement('span');
  plus.setAttribute('aria-hidden', 'true');
  plus.textContent = '+';
  submitButton.append(plus);
  cancelEditButton.hidden = true;
  showMessage('');
};

const beginEdit = (item) => {
  editingId = item._id;
  itemForm.elements.name.value = item.name;
  itemForm.elements.description.value = item.description || '';
  itemForm.elements.price.value = item.price ?? '';
  itemForm.elements.inStock.checked = Boolean(item.inStock);
  formTitle.textContent = 'Edit item';
  submitButton.textContent = 'Save changes';
  cancelEditButton.hidden = false;
  showMessage('');
  document.getElementById('name').focus();
};

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const item = {
    name: itemForm.elements.name.value.trim(),
    description: itemForm.elements.description.value.trim(),
    price: Number(itemForm.elements.price.value),
    inStock: itemForm.elements.inStock.checked
  };
  const isEditing = Boolean(editingId);
  const url = isEditing ? `/api/items/${editingId}` : '/api/items';

  submitButton.disabled = true;
  showMessage(isEditing ? 'Saving changes...' : 'Adding item...');

  try {
    await request(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });

    resetForm();
    showMessage(isEditing ? 'Item updated.' : 'Item added.');
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

cancelEditButton.addEventListener('click', resetForm);

itemList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = items.find((entry) => entry._id === button.dataset.id);
  if (!item) return;

  if (button.dataset.action === 'edit') {
    beginEdit(item);
    return;
  }

  if (!window.confirm(`Delete "${item.name}" from the catalog?`)) return;

  button.disabled = true;
  try {
    await request(`/api/items/${item._id}`, { method: 'DELETE' });
    if (editingId === item._id) resetForm();
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
    button.disabled = false;
  }
});

loadItems();