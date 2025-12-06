// ...existing code...
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../admin/admin';
import FuncionarioPage from '../funcionario/Funcionario';

export default function Sidebar({ active = 'dashboard', onNavigate = () => {} }) {
    const [collapsed, setCollapsed] = useState(false);

    const styles = {
        container: {
            width: collapsed ? 64 : 220,
            background: '#0f172a',
            color: '#e6eef8',
            padding: '16px 12px',
            boxSizing: 'border-box',
            transition: 'width 200ms ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: collapsed ? 'center' : 'stretch',
            minHeight: '100vh',
            gap: 12
        },
        brand: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
            cursor: 'default'
        },
        brandText: {
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 0.3
        },
        nav: {
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginTop: 8
        },
        item: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            padding: '10px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            background: isActive ? '#1e293b' : 'transparent',
            color: isActive ? '#fff' : '#cbd5e1',
            transition: 'background 120ms ease, color 120ms ease'
        }),
        icon: { fontSize: 18, width: 22, textAlign: 'center' },
        collapseBtn: {
            marginTop: 'auto',
            padding: 8,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#cbd5e1',
            borderRadius: 8,
            cursor: 'pointer'
        }
    };

    return (
        <aside style={styles.container}>
            <div style={styles.brand}>
                <div style={{fontSize:20}}>🌾</div>
                {!collapsed && <div style={styles.brandText}>Porteira Azul</div>}
            </div>

            <nav style={styles.nav}>
                <Link to="/dashboard">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate('Dashboard')}
                    style={styles.item(active === 'Dashboard')}
                >
                    <div style={styles.icon}>🏠</div>
                    {!collapsed && <div>Dashboard</div>}
                </div>
                </Link>

                <Link to="/admin">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate('Admin')}
                    style={styles.item(active === 'Admin')}
                >
                    <div style={styles.icon}>⚙️</div>
                    {!collapsed && <div>Admin</div>}
                </div>
                </Link>

                <Link to="/funcionario">
                <div
                     role="button"
                    tabIndex={0}
                    onClick={() => onNavigate('Funcionario')}
                    style={styles.item(active === 'Funcionario')}
                    >
                    <div style={styles.icon}>👷</div>
                    {!collapsed && <div>Funcionário</div>}
                    </div>

                </Link>
            </nav>

            <button
                onClick={() => setCollapsed(!collapsed)}
                style={styles.collapseBtn}
                title={collapsed ? 'Expandir' : 'Recolher'}
            >
                {collapsed ? '➤' : '◀'}
            </button>
        </aside>
    );
}
