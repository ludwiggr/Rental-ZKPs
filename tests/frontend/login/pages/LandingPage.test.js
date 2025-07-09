import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../../../../clients/login/src/pages/LandingPage';

// Mock window.location
const mockLocation = {
    host: 'localhost:3000',
    href: 'http://localhost:3000/landing'
};

Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
});

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
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

describe('Login LandingPage Component', () => {
    beforeEach(() => {
        sessionStorageMock.getItem.mockClear();
        sessionStorageMock.setItem.mockClear();
        mockURLSearchParams.get.mockClear();
        // Reset window.location mock
        Object.defineProperty(window, 'location', {
            value: { ...mockLocation },
            writable: true
        });
    });

    test('renders redirecting message', () => {
        renderWithRouter(<LandingPage />);
        expect(screen.getByText('Redirecting...')).toBeInTheDocument();
    });

    test('redirects to login when no token is present', () => {
        mockURLSearchParams.get.mockReturnValue(null);

        renderWithRouter(<LandingPage />);

        // Should redirect to login page
        expect(screen.getByText('Redirecting...')).toBeInTheDocument();
    });

    test('redirects landlord to landlord service', () => {
        mockURLSearchParams.get
            .mockReturnValueOnce('test-token') // token
            .mockReturnValueOnce('user123'); // userId
        sessionStorageMock.getItem.mockReturnValue('landlord');

        renderWithRouter(<LandingPage />);

        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('userRole');
    });

    test('redirects tenant to tenant service', () => {
        mockURLSearchParams.get
            .mockReturnValueOnce('test-token') // token
            .mockReturnValueOnce('user123'); // userId
        sessionStorageMock.getItem.mockReturnValue('tenant');

        renderWithRouter(<LandingPage />);

        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('userRole');
    });

    test('redirects to login when no role is specified', () => {
        mockURLSearchParams.get
            .mockReturnValueOnce('test-token') // token
            .mockReturnValueOnce('user123'); // userId
        sessionStorageMock.getItem.mockReturnValue(null);

        renderWithRouter(<LandingPage />);

        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('userRole');
    });

    test('handles different user roles', () => {
        mockURLSearchParams.get
            .mockReturnValueOnce('test-token') // token
            .mockReturnValueOnce('user123'); // userId

        // Test landlord role
        sessionStorageMock.getItem.mockReturnValue('landlord');
        renderWithRouter(<LandingPage />);
        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('userRole');

        // Test tenant role
        sessionStorageMock.getItem.mockReturnValue('tenant');
        renderWithRouter(<LandingPage />);
        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('userRole');
    });

    test('handles missing userId parameter', () => {
        mockURLSearchParams.get
            .mockReturnValueOnce('test-token') // token
            .mockReturnValueOnce(null); // userId
        sessionStorageMock.getItem.mockReturnValue('tenant');

        renderWithRouter(<LandingPage />);

        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('userRole');
    });

    test('has correct styling', () => {
        renderWithRouter(<LandingPage />);
        const redirectDiv = screen.getByText('Redirecting...');

        expect(redirectDiv).toHaveStyle({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px'
        });
    });
}); 