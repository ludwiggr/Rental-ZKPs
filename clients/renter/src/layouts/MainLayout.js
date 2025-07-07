import { Outlet } from "react-router-dom";

function NavBar() {
    const handleLogout = () => {
        // Remove token from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');

        // Redirect to login page using current host and port
        const currentHost = window.location.host;
        window.location.href = `http://${currentHost}/login`;

    };

    return (
        <nav style={{
            padding: '5px 30px',
            background: '#fff',
            color: '#333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <h1>Tenant / Renter / Applicant</h1>
            <button
                onClick={handleLogout}
                style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#007bff',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#0056b3'}
                onMouseOut={(e) => e.target.style.background = '#007bff'}
            >
                Logout
            </button>
        </nav>
    );
}

function MainLayout() {
    return (
        <div style={styles.main}>
            <NavBar />
            <main style={{
                backgroundColor: '#f0f0f0', // Light gray background
            }}>
                <Outlet />
            </main>
        </div>
    );
}

const styles = {
    main: {
        fontFamily: 'Arial, sans-serif',
    }
}

export default MainLayout;