import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../../../clients/login/src/pages/LoginPage';

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.location
const mockLocation = {
    host: 'localhost:3000',
    href: 'http://localhost:3000/login'
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

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe('LoginPage Component', () => {
    beforeEach(() => {
        fetch.mockClear();
        sessionStorageMock.setItem.mockClear();
        sessionStorageMock.getItem.mockClear();
    });

    test('renders login form', () => {
        renderWithRouter(<LoginPage />);
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    test('renders role selection buttons', () => {
        renderWithRouter(<LoginPage />);
        expect(screen.getByText('Login as Landlord')).toBeInTheDocument();
        expect(screen.getByText('Login as Tenant')).toBeInTheDocument();
    });

    test('has landlord role selected by default', () => {
        renderWithRouter(<LoginPage />);
        const landlordButton = screen.getByText('Login as Landlord');
        expect(landlordButton).toHaveClass('MuiButton-contained');
    });

    test('switches to tenant role when tenant button is clicked', () => {
        renderWithRouter(<LoginPage />);
        const tenantButton = screen.getByText('Login as Tenant');
        fireEvent.click(tenantButton);
        expect(tenantButton).toHaveClass('MuiButton-contained');
    });

    test('handles form input changes', () => {
        renderWithRouter(<LoginPage />);
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    test('handles successful landlord login', async () => {
        const mockResponse = {
            token: 'test-token',
            username: 'testuser',
            userId: 'user123'
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        renderWithRouter(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const landlordButton = screen.getByText('Login as Landlord');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(landlordButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
            });
        });

        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('userRole', 'landlord');
    });

    test('handles successful tenant login', async () => {
        const mockResponse = {
            token: 'test-token',
            username: 'testuser',
            userId: 'user123'
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        renderWithRouter(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const tenantButton = screen.getByText('Login as Tenant');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(tenantButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
            });
        });

        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('userRole', 'tenant');
    });

    test('handles login failure', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' })
        });

        renderWithRouter(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const landlordButton = screen.getByText('Login as Landlord');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(landlordButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    test('handles network error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        renderWithRouter(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const landlordButton = screen.getByText('Login as Landlord');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(landlordButton);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    test('shows loading state during login', async () => {
        fetch.mockImplementation(() => new Promise(() => { })); // Never resolves

        renderWithRouter(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const landlordButton = screen.getByText('Login as Landlord');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(landlordButton);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('clears error message on new login attempt', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' })
        });

        renderWithRouter(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const landlordButton = screen.getByText('Login as Landlord');

        // First failed attempt
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(landlordButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        // Second attempt should clear the error
        fireEvent.click(landlordButton);
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });

    test('handles response without message property', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({})
        });

        renderWithRouter(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const landlordButton = screen.getByText('Login as Landlord');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(landlordButton);

        await waitFor(() => {
            expect(screen.getByText('Error connecting to server')).toBeInTheDocument();
        });
    });
}); 