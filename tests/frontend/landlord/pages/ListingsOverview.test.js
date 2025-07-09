import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ListingsOverview from '../../../../clients/landlord/src/pages/ListingsOverview';
import { api } from '../../../../clients/landlord/src/services/api';

// Mock the API service
jest.mock('../../../../clients/landlord/src/services/api');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

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

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe('Landlord ListingsOverview Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('test-token');
    });

    const mockListings = [
        {
            _id: '1',
            name: 'Test Listing 1',
            address: '123 Test St',
            size: '100',
            price: 1500,
            type: 'apartment',
            applications: [
                { _id: 'app1', status: 'pending', userId: 'user1' },
                { _id: 'app2', status: 'approved', userId: 'user2' },
                { _id: 'app3', status: 'rejected', userId: 'user3' },
            ],
            incomeRequirement: 50000,
            creditScoreRequirement: 650,
        },
        {
            _id: '2',
            name: 'Test Listing 2',
            address: '456 Test Ave',
            size: '150',
            price: 2000,
            type: 'house',
            applications: [],
        },
    ];

    test('renders loading state initially', () => {
        api.getListings.mockImplementation(() => new Promise(() => { })); // Never resolves
        renderWithRouter(<ListingsOverview />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('renders listings after successful fetch', async () => {
        api.getListings.mockResolvedValue({ listings: mockListings });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(screen.getByText('Test Listing 1')).toBeInTheDocument();
            expect(screen.getByText('Test Listing 2')).toBeInTheDocument();
        });
    });

    test('renders error state when API call fails', async () => {
        api.getListings.mockRejectedValue(new Error('Failed to fetch'));

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
        });
    });

    test('renders empty state when no listings', async () => {
        api.getListings.mockResolvedValue({ listings: [] });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(screen.getByText('No listings found. Create your first listing!')).toBeInTheDocument();
        });
    });

    test('displays listing information correctly', async () => {
        api.getListings.mockResolvedValue({ listings: mockListings });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(screen.getByText('Test Listing 1')).toBeInTheDocument();
            expect(screen.getByText('123 Test St')).toBeInTheDocument();
            expect(screen.getByText('Size: 100 m²')).toBeInTheDocument();
            expect(screen.getByText('Price: €1500')).toBeInTheDocument();
        });
    });

    test('displays application statistics correctly', async () => {
        api.getListings.mockResolvedValue({ listings: mockListings });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            // Should show application stats for the first listing
            expect(screen.getByText('3')).toBeInTheDocument(); // Total applications
        });
    });

    test('displays proof requirements when present', async () => {
        api.getListings.mockResolvedValue({ listings: mockListings });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(screen.getByText('Income Proof')).toBeInTheDocument();
            expect(screen.getByText('Credit Score Proof')).toBeInTheDocument();
            expect(screen.getByText('€50000')).toBeInTheDocument();
            expect(screen.getByText('650')).toBeInTheDocument();
        });
    });

    test('create listing button navigates to create page', async () => {
        api.getListings.mockResolvedValue({ listings: mockListings });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            const createButton = screen.getByRole('button', { name: /add/i });
            fireEvent.click(createButton);
            expect(mockNavigate).toHaveBeenCalledWith('/create-listing');
        });
    });

    test('view details button navigates to listing details', async () => {
        api.getListings.mockResolvedValue({ listings: mockListings });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            const viewButtons = screen.getAllByRole('button', { name: /visibility/i });
            fireEvent.click(viewButtons[0]);
            expect(mockNavigate).toHaveBeenCalledWith('/listing/1');
        });
    });

    test('handles missing listing data gracefully', async () => {
        const incompleteListings = [
            {
                _id: '1',
                // Missing name, address, etc.
                applications: [],
            },
        ];

        api.getListings.mockResolvedValue({ listings: incompleteListings });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(screen.getByText('Unnamed Listing')).toBeInTheDocument();
            expect(screen.getByText('No address provided')).toBeInTheDocument();
            expect(screen.getByText('Size: N/A m²')).toBeInTheDocument();
        });
    });

    test('calls API with correct token', async () => {
        api.getListings.mockResolvedValue({ listings: [] });

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(api.getListings).toHaveBeenCalledWith('test-token');
        });
    });

    test('handles API error with console.error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        api.getListings.mockRejectedValue(new Error('API Error'));

        renderWithRouter(<ListingsOverview />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(new Error('API Error'));
        });

        consoleSpy.mockRestore();
    });
}); 