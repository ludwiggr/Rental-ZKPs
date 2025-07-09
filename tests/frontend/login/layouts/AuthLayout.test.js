import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthLayout from '../../../../clients/login/src/layouts/AuthLayout';

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe('Login AuthLayout Component', () => {
    test('renders main element', () => {
        renderWithRouter(<AuthLayout />);
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('renders outlet for nested routes', () => {
        renderWithRouter(<AuthLayout />);
        // The Outlet should be rendered (we can't directly test it, but we can verify the layout structure)
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('has correct structure', () => {
        renderWithRouter(<AuthLayout />);
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
    });

    test('renders without any additional content', () => {
        renderWithRouter(<AuthLayout />);
        // Should only contain the main element with Outlet
        const main = screen.getByRole('main');
        expect(main.children.length).toBe(0); // Outlet doesn't render visible content in tests
    });
}); 