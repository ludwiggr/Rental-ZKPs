import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../../clients/login/src/App';

// Mock the page components
jest.mock('../../../clients/login/src/pages/LoginPage', () => {
    return function MockLoginPage() {
        return <div data-testid="login-page">Login Page</div>;
    };
});

jest.mock('../../../clients/login/src/pages/RegisterPage', () => {
    return function MockRegisterPage() {
        return <div data-testid="register-page">Register Page</div>;
    };
});

jest.mock('../../../clients/login/src/pages/LandingPage', () => {
    return function MockLandingPage() {
        return <div data-testid="landing-page">Landing Page</div>;
    };
});

jest.mock('../../../clients/login/src/layouts/AuthLayout', () => {
    return function MockAuthLayout({ children }) {
        return <div data-testid="auth-layout">{children}</div>;
    };
});

const renderWithRouter = (component, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(component, { wrapper: BrowserRouter });
};

describe('Login App Component', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    test('renders without crashing', () => {
        renderWithRouter(<App />);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('redirects from root to login page', () => {
        renderWithRouter(<App />, { route: '/' });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('renders landing page at /landing', () => {
        renderWithRouter(<App />, { route: '/landing' });
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    test('renders register page at /register', () => {
        renderWithRouter(<App />, { route: '/register' });
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    test('renders login page at /login', () => {
        renderWithRouter(<App />, { route: '/login' });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('register page uses AuthLayout', () => {
        renderWithRouter(<App />, { route: '/register' });
        expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    test('login page uses AuthLayout', () => {
        renderWithRouter(<App />, { route: '/login' });
        expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('landing page does not use AuthLayout', () => {
        renderWithRouter(<App />, { route: '/landing' });
        expect(screen.queryByTestId('auth-layout')).not.toBeInTheDocument();
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    test('handles unknown routes gracefully', () => {
        renderWithRouter(<App />, { route: '/unknown-route' });
        // Should redirect to login page
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
}); 