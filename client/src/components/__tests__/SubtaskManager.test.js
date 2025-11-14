const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockUseNavigate,
}));
