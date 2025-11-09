import api from './api';

const getServerVersion = async () => {
    const response = await api.get('/version');
    return response.data;
};

const aboutService = {
    getServerVersion,
};

export default aboutService;
