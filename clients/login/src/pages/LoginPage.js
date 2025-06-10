import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const handleLogin = async (e, role) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
            });
            console.log('test');
            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || 'Login failed');
                return;
            }

            //localStorage.setItem('token', data.token); // Save token

            setMessage('Login successful!');
            if (role === 'landlord') {
                window.location.href = `http://landlord.localhost/landing?token=${encodeURIComponent(data.token)}`;
            } else if (role === 'tenant') {
                window.location.href = `http://tenant.localhost/landing?token=${encodeURIComponent(data.token)}`;
            }



        } catch (err) {
            setMessage('Error connecting to server');
        }

    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={(e) => handleLogin(e, selectedRole)} style={styles.form}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <div style={styles.buttonContainer}>
                    <button type="submit" style={styles.button} onClick={() => setSelectedRole('landlord')}>
                        Login as Landlord
                    </button>
                    <button type="submit" style={styles.button} onClick={() => setSelectedRole('tenant')}>
                        Login as Tenant
                    </button>
                </div>
            </form>
            <p>{message}</p>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '400px',
        margin: '100px auto',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center',
        fontFamily: 'Arial',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.5rem',
        fontSize: '1rem',
    },
    button: {
        padding: '0.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
    },
};

export default Login;
