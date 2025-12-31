import api from './api';

const getContacts = async () => {
    const response = await api.get('/contacts');
    return response.data.data;
};

const createContact = async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data.data;
};

const updateContact = async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
};

const deleteContact = async (id) => {
    await api.delete(`/contacts/${id}`);
};

const bulkImportContacts = async (contacts, strategy) => {
    const response = await api.post('/contacts/bulk', { contacts, strategy });
    return response.data.data;
};

const searchContacts = async (query) => {
    const response = await api.get(`/contacts/search`, { params: { q: query } });
    return response.data.data;
};

const contactService = {
    getContacts,
    createContact,
    updateContact,
    deleteContact,
    bulkImportContacts,
    searchContacts,
};

export default contactService;
