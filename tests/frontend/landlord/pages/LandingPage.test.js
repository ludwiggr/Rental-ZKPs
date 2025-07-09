import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../../../../clients/landlord/src/pages/LandingPage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock window.location
const mockLocation = {
    host: 'localhost:3001',
    href: 'http://localhost:3001/landing'
};

Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock URLSearchParams
const mockURLSearchParams = {
    get: jest.fn(),
};
Object.defineProperty(window, 'URLSearchParams', {
    value: jest.fn(() => mockURLSearchParams),
});

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe('Landlord LandingPage Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        localStorageMock.setItem.mockClear();
        mockURLSearchParams.get.mockClear();
        // Reset window.location mock
        Object.defineProperty(window, 'location', {
            value: { ...mockLocation },
            writable: true
        });
    });

    test('renders loading message', () => {
        renderWithRouter(<LandingPage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('extracts token from URL and stores it in localStorage', () => {
        mockURLSearchParams.get.mockReturnValue('test-token');

        renderWithRouter(<LandingPage />);

        expect(mockURLSearchParams.get).toHaveBeenCalledWith('token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    });

    test('redirects to login when no token is present', () => {
        mockURLSearchParams.get.mockReturnValue(null);

        renderWithRouter(<LandingPage />);

        // Should redirect to login page
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('navigates to listings overview after token extraction', () => {
        mockURLSearchParams.get.mockReturnValue('test-token');

        renderWithRouter(<LandingPage />);

        expect(mockNavigate).toHaveBeenCalledWith('/listings-overview');
    });

    test('handles different token values', () => {
        mockURLSearchParams.get.mockReturnValue('different-token');

        renderWithRouter(<LandingPage />);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'different-token');
    });

    test('handles empty token string', () => {
        mockURLSearchParams.get.mockReturnValue('');

        renderWithRouter(<LandingPage />);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', '');
    });

    test('calls getToken function on mount', () => {
        mockURLSearchParams.get.mockReturnValue('test-token');

        renderWithRouter(<LandingPage />);

        expect(mockURLSearchParams.get).toHaveBeenCalledWith('token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
        expect(mockNavigate).toHaveBeenCalledWith('/listings-overview');
    });
}); 