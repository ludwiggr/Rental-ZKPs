import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../clients/landlord/src/App';

// Mock the page components
jest.mock('../../../clients/landlord/src/pages/ListingsOverview', () => {
    return function MockListingsOverview() {
        return <div data-testid="listings-overview">Listings Overview</div>;
    };
});

jest.mock('../../../clients/landlord/src/pages/CreateListing', () => {
    return function MockCreateListing() {
        return <div data-testid="create-listing">Create Listing</div>;
    };
});

jest.mock('../../../clients/landlord/src/pages/ListingDetails', () => {
    return function MockListingDetails() {
        return <div data-testid="listing-details">Listing Details</div>;
    };
});

jest.mock('../../../clients/landlord/src/pages/LandingPage', () => {
    return function MockLandingPage() {
        return <div data-testid="landing-page">Landing Page</div>;
    };
});

jest.mock('../../../clients/landlord/src/layouts/MainLayout', () => {
    return function MockMainLayout({ children }) {
        return <div data-testid="main-layout">{children}</div>;
    };
});

const renderWithRouter = (component, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(component, { wrapper: BrowserRouter });
};

describe('Landlord App Component', () => {
    beforeEach(() => {
        // Clear any localStorage or sessionStorage
        localStorage.clear();
        sessionStorage.clear();
    });

    test('renders without crashing', () => {
        renderWithRouter(<App />);
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    test('redirects from root to listings overview', () => {
        renderWithRouter(<App />, { route: '/' });
        expect(screen.getByTestId('listings-overview')).toBeInTheDocument();
    });

    test('renders landing page at /landing', () => {
        renderWithRouter(<App />, { route: '/landing' });
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    test('renders landlord landing page at /landlord-landing', () => {
        renderWithRouter(<App />, { route: '/landlord-landing' });
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    test('renders listings overview at /listings-overview', () => {
        renderWithRouter(<App />, { route: '/listings-overview' });
        expect(screen.getByTestId('listings-overview')).toBeInTheDocument();
    });

    test('renders create listing page at /create-listing', () => {
        renderWithRouter(<App />, { route: '/create-listing' });
        expect(screen.getByTestId('create-listing')).toBeInTheDocument();
    });

    test('renders listing details page at /listing/:id', () => {
        renderWithRouter(<App />, { route: '/listing/123' });
        expect(screen.getByTestId('listing-details')).toBeInTheDocument();
    });

    test('handles unknown routes gracefully', () => {
        renderWithRouter(<App />, { route: '/unknown-route' });
        // Should redirect to listings overview
        expect(screen.getByTestId('listings-overview')).toBeInTheDocument();
    });
}); 