import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../../clients/renter/src/App';

// Mock the page components
jest.mock('../../../clients/renter/src/pages/ListingsOverview', () => {
    return function MockListingsOverview() {
        return <div data-testid="listings-overview">Listings Overview</div>;
    };
});

jest.mock('../../../clients/renter/src/pages/Apply', () => {
    return function MockApply() {
        return <div data-testid="apply">Apply</div>;
    };
});

jest.mock('../../../clients/renter/src/pages/LandingPage', () => {
    return function MockLandingPage() {
        return <div data-testid="landing-page">Landing Page</div>;
    };
});

jest.mock('../../../clients/renter/src/layouts/MainLayout', () => {
    return function MockMainLayout({ children }) {
        return <div data-testid="main-layout">{children}</div>;
    };
});

const renderWithRouter = (component, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(component, { wrapper: BrowserRouter });
};

describe('Renter App Component', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    test('renders without crashing', () => {
        renderWithRouter(<App />);
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    test('renders landing page at /landing', () => {
        renderWithRouter(<App />, { route: '/landing' });
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    test('renders tenant landing page at /tenant-landing', () => {
        renderWithRouter(<App />, { route: '/tenant-landing' });
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    test('renders listings overview at /listings-overview', () => {
        renderWithRouter(<App />, { route: '/listings-overview' });
        expect(screen.getByTestId('listings-overview')).toBeInTheDocument();
    });

    test('renders apply page at /apply/:id', () => {
        renderWithRouter(<App />, { route: '/apply/123' });
        expect(screen.getByTestId('apply')).toBeInTheDocument();
    });

    test('handles unknown routes gracefully', () => {
        renderWithRouter(<App />, { route: '/unknown-route' });
        // Should show the layout but no specific page content
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    test('renders multiple apply routes with different IDs', () => {
        renderWithRouter(<App />, { route: '/apply/456' });
        expect(screen.getByTestId('apply')).toBeInTheDocument();
    });
}); 