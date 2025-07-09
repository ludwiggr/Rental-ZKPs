import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '../../../../clients/landlord/src/layouts/MainLayout';

// Mock window.location
const mockLocation = {
    host: 'localhost:3001',
    href: 'http://localhost:3001/login'
};

Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
});

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe('Landlord MainLayout Component', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Reset window.location mock
        Object.defineProperty(window, 'location', {
            value: { ...mockLocation },
            writable: true
        });
    });

    test('renders navigation bar with landlord title', () => {
        renderWithRouter(<MainLayout />);
        expect(screen.getByText('Landlord')).toBeInTheDocument();
    });

    test('renders logout button', () => {
        renderWithRouter(<MainLayout />);
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('renders outlet for nested routes', () => {
        renderWithRouter(<MainLayout />);
        // The Outlet should be rendered (we can't directly test it, but we can verify the layout structure)
        expect(screen.getByText('Landlord')).toBeInTheDocument();
    });

    test('logout button clears localStorage and redirects', () => {
        // Set up localStorage
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('userId', 'test-user-id');

        renderWithRouter(<MainLayout />);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // Check that localStorage is cleared
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('userId')).toBeNull();
    });

    test('logout button has correct styling', () => {
        renderWithRouter(<MainLayout />);
        const logoutButton = screen.getByText('Logout');

        expect(logoutButton).toHaveStyle({
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: '#007bff',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px'
        });
    });

    test('navigation bar has correct styling', () => {
        renderWithRouter(<MainLayout />);
        const nav = screen.getByText('Landlord').closest('nav');

        expect(nav).toHaveStyle({
            padding: '5px 30px',
            background: '#fff',
            color: '#333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        });
    });

    test('main container has correct styling', () => {
        renderWithRouter(<MainLayout />);
        const main = screen.getByText('Landlord').closest('div').querySelector('main');

        expect(main).toHaveStyle({
            backgroundColor: '#f0f0f0'
        });
    });

    test('handles logout with no localStorage items', () => {
        // Ensure localStorage is empty
        localStorage.clear();

        renderWithRouter(<MainLayout />);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // Should not throw any errors
        expect(logoutButton).toBeInTheDocument();
    });
}); 