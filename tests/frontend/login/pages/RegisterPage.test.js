import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../../../clients/login/src/pages/RegisterPage';

// Mock fetch globally
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe('RegisterPage Component', () => {
    beforeEach(() => {
        fetch.mockClear();
        mockNavigate.mockClear();
    });

    test('renders registration form', () => {
        renderWithRouter(<RegisterPage />);
        expect(screen.getByText('Register')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    test('handles form input changes', () => {
        renderWithRouter(<RegisterPage />);
        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('testuser');
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    test('handles successful registration', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User registered successfully' })
        });

        renderWithRouter(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const registerButton = screen.getByText('Register');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('handles registration failure', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'User already exists' })
        });

        renderWithRouter(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const registerButton = screen.getByText('Register');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText('User already exists')).toBeInTheDocument();
        });
    });

    test('handles network error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        renderWithRouter(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const registerButton = screen.getByText('Register');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    test('shows loading state during registration', async () => {
        fetch.mockImplementation(() => new Promise(() => { })); // Never resolves

        renderWithRouter(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const registerButton = screen.getByText('Register');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('clears error message on new registration attempt', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'User already exists' })
        });

        renderWithRouter(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const registerButton = screen.getByText('Register');

        // First failed attempt
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText('User already exists')).toBeInTheDocument();
        });

        // Second attempt should clear the error
        fireEvent.click(registerButton);
        expect(screen.queryByText('User already exists')).not.toBeInTheDocument();
    });

    test('handles response without message property', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({})
        });

        renderWithRouter(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const registerButton = screen.getByText('Register');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to register')).toBeInTheDocument();
        });
    });

    test('handles internal server error', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Internal error: Database connection failed' })
        });

        renderWithRouter(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const registerButton = screen.getByText('Register');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText('Internal error: Database connection failed')).toBeInTheDocument();
        });
    });

    test('form submission requires all fields', () => {
        renderWithRouter(<RegisterPage />);

        const registerButton = screen.getByText('Register');
        fireEvent.click(registerButton);

        // Should not call fetch if form is incomplete
        expect(fetch).not.toHaveBeenCalled();
    });
}); 