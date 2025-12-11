import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from './Funcionario.module.css';

function formatDate(dateString) {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
}

function formatDateTime(dateString) {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
        return dateString;
    }
}

export default function Funcionario() {
    const apiBase = import.meta?.env?.VITE_API_BASE || 'http://localhost:5000';
    const client = axios.create({ baseURL: apiBase, timeout: 10000 });

    const [tab, setTab] = useState('Horas');
    const [loading, setLoading] = useState(false);

    const [funcionarios, setFuncionarios] = useState([]);
    const [maquinas, setMaquinas] = useState([]);
    const [usos, setUsos] = useState([]);
    const [horasList, setHorasList] = useState([]);

    const [selectedFuncionario, setSelectedFuncionario] = useState('');
    const [horasValue, setHorasValue] = useState('');
    const [selectedMaquina, setSelectedMaquina] = useState('');

    useEffect(() => {
        fetchFuncionarios();
        fetchMaquinas();
        fetchUsos();
        fetchHoras();
    }, []);

    async function fetchFuncionarios(){
        try{
            const res = await client.get('/funcionario');
            setFuncionarios(res.data || []);
            if(!selectedFuncionario && res.data?.length) setSelectedFuncionario(res.data[0].id);
        }catch(e){
            console.error(e);
        }
    }

    async function fetchMaquinas(){
        try{
            const res = await client.get('/maquinario');
            setMaquinas(res.data || []);
            if(!selectedMaquina && res.data?.length) setSelectedMaquina(res.data[0].id);
        }catch(e){ console.error(e); }
    }

    async function fetchUsos(){
        try{
            const res = await client.get('/usoMaquinario');
            setUsos(res.data || []);
        }catch(e){ console.error(e); }
    }

    async function fetchHoras(){
        try{
            const res = await client.get('/horasFuncionario');
            setHorasList(res.data || []);
        }catch(e){ console.error(e); }
    }

    async function submitHoras(e){
        e.preventDefault();
        if(!selectedFuncionario){ alert('Selecione um funcionário'); return; }
        if(!horasValue || isNaN(Number(horasValue))){ alert('Informe horas válidas'); return; }
        setLoading(true);
        try{
            await client.post('/horasFuncionario', { horas: Number(horasValue), idFuncionario: selectedFuncionario });
            alert('Horas registradas');
            setHorasValue('');
            await fetchHoras();
        }catch(err){
            console.error(err);
            alert(err?.response?.data?.error || 'Erro ao registrar horas');
        }finally{ setLoading(false); }
    }

    async function startUso(){
        if(!selectedFuncionario){ alert('Selecione um funcionário'); return; }
        if(!selectedMaquina){ alert('Selecione uma máquina'); return; }
        setLoading(true);
        try{
            const payload = { idMaquinario: selectedMaquina, idFuncionario: selectedFuncionario, data_inicio: new Date().toISOString() };
            await client.post('/usoMaquinario', payload);
            alert('Uso iniciado');
            await fetchUsos();
        }catch(err){
            console.error(err);
            alert('Erro ao iniciar uso');
        }finally{ setLoading(false); }
    }

    async function stopUso(uso){
        if(!uso || !uso.id){ return; }
        setLoading(true);
        try{
            await client.put(`/usoMaquinario/${uso.id}`, { data_fim: new Date().toISOString() });
            alert('Uso encerrado');
            await fetchUsos();
        }catch(err){
            console.error(err);
            alert('Erro ao encerrar uso');
        }finally{ setLoading(false); }
    }

    function activeUsos(){ return usos.filter(u => !u.data_fim); }

    return (
        <div className={styles.container}>
            <Sidebar active="Funcionario" onNavigate={(v) => { 
                if(v === 'Dashboard') window.location.href = '/'; 
                else if(v === 'Admin') window.location.href = '/admin';
                else if(v === 'Funcionario') window.location.href = '/funcionario';
            }} />

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Área do Funcionário</h1>
                    <div className={styles.tabButtons}>
                        <button onClick={() => setTab('Horas')} className={`${styles.tabButton} ${tab==='Horas' ? styles.tabButtonActive : ''}`}>
                            Registrar Horas
                        </button>
                        <button onClick={() => setTab('Uso')} className={`${styles.tabButton} ${tab==='Uso' ? styles.tabButtonActive : ''}`}>
                            Uso Maquinário
                        </button>
                    </div>
                </header>

                <section className={styles.section}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Funcionário
                            <select value={selectedFuncionario} onChange={e => setSelectedFuncionario(e.target.value)} className={styles.select}>
                                <option value="">-- selecione --</option>
                                {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                            </select>
                        </label>
                    </div>

                    {tab === 'Horas' && (
                        <div>
                            <h3 className={styles.sectionTitle}>Registrar Horas</h3>
                            <form onSubmit={submitHoras} className={styles.form}>
                                <label className={styles.label}>
                                    Horas
                                    <input type="number" step="1" min="0" name="horas" value={horasValue} onChange={e => setHorasValue(e.target.value)} className={styles.input} />
                                </label>
                                <button type="submit" disabled={loading} className={styles.button}>Registrar</button>
                                <button type="button" onClick={fetchHoras} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar lista</button>
                            </form>

                            <h4 className={styles.subtitle}>Histórico recente</h4>
                            <table className={styles.table}>
                                <thead><tr><th>Data</th><th>Horas</th><th>Funcionário</th></tr></thead>
                                <tbody>
                                    {horasList.slice().reverse().map(h => (
                                        <tr key={h.id}>
                                            <td>{formatDate(h.data)}</td>
                                            <td>{h.horas}</td>
                                            <td>{h.funcionario || h.idFuncionario}</td>
                                        </tr>
                                    ))}
                                    {horasList.length===0 && <tr><td colSpan="3" className={styles.emptyState}>Nenhum registro</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === 'Uso' && (
                        <div>
                            <h3 className={styles.sectionTitle}>Gerenciar Uso de Maquinário</h3>

                            <div className={styles.form}>
                                <label className={styles.label}>
                                    Máquina
                                    <select value={selectedMaquina} onChange={e => setSelectedMaquina(e.target.value)} className={styles.select}>
                                        <option value="">-- selecione --</option>
                                        {maquinas.map(m => <option key={m.id} value={m.id}>{m.maquina || m.nome || m.id}</option>)}
                                    </select>
                                </label>

                                <button type="button" onClick={startUso} disabled={loading} className={styles.button}>Iniciar Uso</button>
                                <button type="button" onClick={fetchUsos} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar usos</button>
                            </div>

                            <h4 className={styles.subtitle}>Usos Ativos</h4>
                            <table className={styles.table}>
                                <thead><tr><th>Máquina</th><th>Operador</th><th>Início</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {activeUsos().map(u => (
                                        <tr key={u.id}>
                                            <td>{u.maquinario_nome || u.idMaquinario}</td>
                                            <td>{u.funcionario_nome || u.idFuncionario}</td>
                                            <td>{formatDateTime(u.data_inicio)}</td>
                                            <td>
                                                <button onClick={() => stopUso(u)} disabled={loading} className={`${styles.button} ${styles.buttonDanger}`}>Encerrar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {activeUsos().length === 0 && <tr><td colSpan="4" className={styles.emptyState}>Nenhum uso ativo</td></tr>}
                                </tbody>
                            </table>

                            <h4 className={styles.subtitle}>Histórico de usos</h4>
                            <table className={styles.table}>
                                <thead><tr><th>Máquina</th><th>Operador</th><th>Início</th><th>Fim</th></tr></thead>
                                <tbody>
                                    {usos.slice().reverse().map(u => (
                                        <tr key={u.id}>
                                            <td>{u.maquinario_nome || u.idMaquinario}</td>
                                            <td>{u.funcionario_nome || u.idFuncionario}</td>
                                            <td>{formatDateTime(u.data_inicio)}</td>
                                            <td>{u.data_fim ? formatDateTime(u.data_fim) : 'Em uso'}</td>
                                        </tr>
                                    ))}
                                    {usos.length === 0 && <tr><td colSpan="4" className={styles.emptyState}>Nenhum uso registrado</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
