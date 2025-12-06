import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import styles from './admin.module.css';

// Helper para formatar datas
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

const TABS = ['Dashboard','Funcionários','Horas','Maquinários','Uso Maquinário','Cotação','Culturas'];

export default function AdminPage(){
    const [tab, setTab] = useState('Dashboard');
    const [loading, setLoading] = useState(false);
    const [funcionario, setfuncionario] = useState([]);
    const [horas, setHoras] = useState([]);
    const [maquinas, setMaquinas] = useState([]);
    const [usos, setUsos] = useState([]);
    const [cotacoes, setCotacoes] = useState([]);
    const [culturas, setCulturas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFuncionario, setEditingFuncionario] = useState(null);
    const [form, setForm] = useState({ nome:'', idCultura:'' });
    const [culturaModalOpen, setCulturaModalOpen] = useState(false);
    const [editingCultura, setEditingCultura] = useState(null);
    const [culturaForm, setCulturaForm] = useState({ nome: '' });
    const [maquinaModalOpen, setMaquinaModalOpen] = useState(false);
    const [editingMaquina, setEditingMaquina] = useState(null);
    const [maquinaForm, setMaquinaForm] = useState({ maquina: '' });

    const apiBase = import.meta?.env?.VITE_API_BASE || 'http://localhost:5000';
    const client = axios.create({ baseURL: apiBase, timeout: 10000 });

    useEffect(()=>{
        if(tab==='Funcionários') fetchfuncionario();
        if(tab==='Horas') fetchHoras();
        if(tab==='Maquinários') fetchMaquinas();
        if(tab==='Uso Maquinário') fetchUsos();
        if(tab==='Cotação') fetchCotacoes();
        if(tab==='Culturas') fetchCulturas();
    },[tab]);

    async function fetchfuncionario(){
        setLoading(true);
        try{
            const res = await client.get('/funcionario');
            setfuncionario(res.data || []);
        }catch(err){
            console.error(err);
            alert('Erro ao carregar funcionários');
        }finally{ setLoading(false); }
    }

    async function fetchCulturas(){
        setLoading(true);
        try{
            const res = await client.get('/cultura');
            setCulturas(res.data || []);
        }catch(err){
            console.error(err);
            alert('Erro ao carregar culturas');
        }finally{ setLoading(false); }
    }

    async function fetchHoras(){
        setLoading(true);
        try{
            const res = await client.get('/horasFuncionario');
            setHoras(res.data || []);
        }catch(err){
            console.error(err);
            alert('Erro ao carregar horas');
        }finally{ setLoading(false); }
    }

    async function fetchMaquinas(){
        setLoading(true);
        try{
            const res = await client.get('/maquinario');
            setMaquinas(res.data || []);
        }catch(err){
            console.error(err);
            alert('Erro ao carregar maquinários');
        }finally{ setLoading(false); }
    }

    async function fetchUsos(){
        setLoading(true);
        try{
            const res = await client.get('/usoMaquinario');
            setUsos(res.data || []);
        }catch(err){
            console.error(err);
            alert('Erro ao carregar usos de maquinário');
        }finally{ setLoading(false); }
    }

    async function fetchCotacoes(){
        setLoading(true);
        try{
            const res = await client.get('/cotacaoCultura');
            setCotacoes(res.data || []);
        }catch(err){
            console.error(err);
            alert('Erro ao carregar cotações');
        }finally{ setLoading(false); }
    }

    function openCreateFuncionario(){
        setEditingFuncionario(null);
        setForm({ nome:'', idCultura:'' });
        setModalOpen(true);
    }

    function openEditFuncionario(f){
        setEditingFuncionario(f);
        setForm({
            nome: f.nome || '',
            idCultura: f.idCultura || ''
        });
        setModalOpen(true);
    }

    function closeModal(){
        setModalOpen(false);
        setEditingFuncionario(null);
    }

    function handleFormChange(e){
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function submitFuncionario(e){
        e.preventDefault();
        if(!form.nome || form.nome.trim()===''){ alert('Nome é obrigatório'); return; }
        setLoading(true);
        try{
            if(editingFuncionario){
                await client.put(`/funcionario/${editingFuncionario.id}`, {
                    nome: form.nome,
                    idCultura: form.idCultura || null
                });
                alert('Funcionário atualizado');
            }else{
                await client.post('/funcionario', {
                    nome: form.nome,
                    idCultura: form.idCultura || null
                });
                alert('Funcionário criado');
            }
            closeModal();
            await fetchfuncionario();
        }catch(err){
            console.error(err);
            alert('Erro ao salvar funcionário');
        }finally{ setLoading(false); }
    }

    async function deleteFuncionario(id){
        if(!confirm('Confirmar exclusão?')) return;
        setLoading(true);
        try{
            await client.delete(`/funcionario/${id}`);
            await fetchfuncionario();
        }catch(err){
            console.error(err);
            alert('Erro ao excluir funcionário');
        }finally{ setLoading(false); }
    }

    function openCreateCultura(){
        setEditingCultura(null);
        setCulturaForm({ nome: '' });
        setCulturaModalOpen(true);
    }

    function openEditCultura(c){
        setEditingCultura(c);
        setCulturaForm({ nome: c.nome || '' });
        setCulturaModalOpen(true);
    }

    function closeCulturaModal(){
        setCulturaModalOpen(false);
        setEditingCultura(null);
    }

    function handleCulturaFormChange(e){
        const { name, value } = e.target;
        setCulturaForm(prev => ({ ...prev, [name]: value }));
    }

    async function submitCultura(e){
        e.preventDefault();
        if(!culturaForm.nome || culturaForm.nome.trim()===''){ alert('Nome é obrigatório'); return; }
        setLoading(true);
        try{
            if(editingCultura){
                await client.put(`/cultura/${editingCultura.id}`, { nome: culturaForm.nome });
                alert('Cultura atualizada');
            }else{
                await client.post('/cultura', { nome: culturaForm.nome });
                alert('Cultura criada');
            }
            closeCulturaModal();
            await fetchCulturas();
        }catch(err){
            console.error(err);
            alert('Erro ao salvar cultura');
        }finally{ setLoading(false); }
    }

    async function deleteCultura(id){
        if(!confirm('Confirmar exclusão?')) return;
        setLoading(true);
        try{
            await client.delete(`/cultura/${id}`);
            await fetchCulturas();
        }catch(err){
            console.error(err);
            alert('Erro ao excluir cultura');
        }finally{ setLoading(false); }
    }

    function openCreateMaquina(){
        setEditingMaquina(null);
        setMaquinaForm({ maquina: '' });
        setMaquinaModalOpen(true);
    }

    function openEditMaquina(m){
        setEditingMaquina(m);
        setMaquinaForm({ maquina: m.maquina || '' });
        setMaquinaModalOpen(true);
    }

    function closeMaquinaModal(){
        setMaquinaModalOpen(false);
        setEditingMaquina(null);
    }

    function handleMaquinaFormChange(e){
        const { name, value } = e.target;
        setMaquinaForm(prev => ({ ...prev, [name]: value }));
    }

    async function submitMaquina(e){
        e.preventDefault();
        if(!maquinaForm.maquina || maquinaForm.maquina.trim()===''){ alert('Nome da máquina é obrigatório'); return; }
        setLoading(true);
        try{
            if(editingMaquina){
                await client.put(`/maquinario/${editingMaquina.id}`, { maquina: maquinaForm.maquina });
                alert('Maquinário atualizado');
            }else{
                await client.post('/maquinario', { maquina: maquinaForm.maquina });
                alert('Maquinário criado');
            }
            closeMaquinaModal();
            await fetchMaquinas();
        }catch(err){
            console.error(err);
            alert('Erro ao salvar maquinário');
        }finally{ setLoading(false); }
    }

    async function deleteMaquina(id){
        if(!confirm('Confirmar exclusão?')) return;
        setLoading(true);
        try{
            await client.delete(`/maquinario/${id}`);
            await fetchMaquinas();
        }catch(err){
            console.error(err);
            alert('Erro ao excluir maquinário');
        }finally{ setLoading(false); }
    }

    async function deleteItem(endpoint, id, refreshFn){
        if(!confirm('Confirmar exclusão?')) return;
        setLoading(true);
        try{
            await client.delete(`/${endpoint}/${id}`);
            if(refreshFn) await refreshFn();
        }catch(err){
            console.error(err);
            alert('Erro ao excluir');
        }finally{ setLoading(false); }
    }

    function renderDashboard(){
        const maquinasEmUso = usos.filter(u=> !u.data_fim).length;
        const totalHoras = horas.reduce((s,h)=> s + (h.horas || 0), 0);
        return (
            <div className={styles.dashboard}>
                <div className={styles.dashboardCard}>
                    <div className={styles.dashboardCardTitle}>Funcionários</div>
                    <div className={styles.dashboardCardValue}>{funcionario.length}</div>
                </div>
                <div className={styles.dashboardCard}>
                    <div className={styles.dashboardCardTitle}>Máquinas</div>
                    <div className={styles.dashboardCardValue}>{maquinas.length}</div>
                </div>
                <div className={styles.dashboardCard} style={{borderLeftColor:'#f59e0b'}}>
                    <div className={styles.dashboardCardTitle}>Em uso</div>
                    <div className={styles.dashboardCardValue}>{maquinasEmUso}</div>
                </div>
                <div className={styles.dashboardCard} style={{borderLeftColor:'#10b981'}}>
                    <div className={styles.dashboardCardTitle}>Horas (soma)</div>
                    <div className={styles.dashboardCardValue}>{totalHoras}</div>
                </div>
            </div>
        );
    }

    function renderfuncionario(){
        return (
            <div>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Funcionários</h3>
                    <div className={styles.buttonGroup}>
                        <button onClick={openCreateFuncionario} className={styles.button}>Novo funcionário</button>
                        <button onClick={fetchfuncionario} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar</button>
                    </div>
                </div>
                {loading ? <div className={styles.loadingText}>Carregando...</div> :
                <table className={styles.table}>
                    <thead><tr><th>Nome</th><th>Cultura</th><th>Ações</th></tr></thead>
                    <tbody>
                        {funcionario.map(f=>(
                            <tr key={f.id}>
                                <td><strong>{f.nome}</strong></td>
                                <td>{f.cultura || '—'}</td>
                                <td>
                                    <button onClick={()=> openEditFuncionario(f)} className={styles.button}>Editar</button>
                                    <button onClick={()=> deleteFuncionario(f.id)} className={`${styles.button} ${styles.buttonDanger}`} style={{marginLeft:8}}>Remover</button>
                                </td>
                            </tr>
                        ))}
                        {funcionario.length === 0 && <tr><td colSpan="3" className={styles.emptyState}>Nenhum funcionário cadastrado</td></tr>}
                    </tbody>
                </table>}
            </div>
        );
    }

    function renderHoras(){
        return (
            <div>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Controle de Horas</h3>
                    <button onClick={fetchHoras} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar</button>
                </div>
                {loading ? <div className={styles.loadingText}>Carregando...</div> :
                <table className={styles.table}>
                    <thead><tr><th>Funcionário</th><th>Data</th><th>Horas</th><th>Ações</th></tr></thead>
                    <tbody>
                        {horas.map(h=>(
                            <tr key={h.id}>
                                <td>{h.funcionario || h.idFuncionario}</td>
                                <td>{formatDate(h.data)}</td>
                                <td><strong>{h.horas}h</strong></td>
                                <td>
                                    <button onClick={()=> deleteItem('horasFuncionario', h.id, fetchHoras)} className={`${styles.button} ${styles.buttonDanger}`}>Remover</button>
                                </td>
                            </tr>
                        ))}
                        {horas.length === 0 && <tr><td colSpan="4" className={styles.emptyState}>Nenhum registro de horas</td></tr>}
                    </tbody>
                </table>}
            </div>
        );
    }

    function renderMaquinas(){
        return (
            <div>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Maquinários</h3>
                    <div className={styles.buttonGroup}>
                        <button onClick={openCreateMaquina} className={styles.button}>Novo maquinário</button>
                        <button onClick={fetchMaquinas} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar</button>
                    </div>
                </div>
                {loading ? <div className={styles.loadingText}>Carregando...</div> :
                <table className={styles.table}>
                    <thead><tr><th>Nome</th><th>Ações</th></tr></thead>
                    <tbody>
                        {maquinas.map(m=>(
                            <tr key={m.id}>
                                <td><strong>{m.maquina}</strong></td>
                                <td>
                                    <button onClick={()=> openEditMaquina(m)} className={styles.button}>Editar</button>
                                    <button onClick={()=> deleteMaquina(m.id)} className={`${styles.button} ${styles.buttonDanger}`} style={{marginLeft:8}}>Remover</button>
                                </td>
                            </tr>
                        ))}
                        {maquinas.length === 0 && <tr><td colSpan="2" className={styles.emptyState}>Nenhum maquinário cadastrado</td></tr>}
                    </tbody>
                </table>}
            </div>
        );
    }

    function renderUsoMaquinario(){
        return (
            <div>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Uso de Maquinário</h3>
                    <button onClick={fetchUsos} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar</button>
                </div>
                {loading ? <div className={styles.loadingText}>Carregando...</div> :
                <table className={styles.table}>
                    <thead><tr><th>Máquina</th><th>Operador</th><th>Início</th><th>Fim</th><th>Ações</th></tr></thead>
                    <tbody>
                        {usos.map(u=>(
                            <tr key={u.id}>
                                <td>{u.maquinario_nome || u.maquinario || u.idMaquinario}</td>
                                <td>{u.funcionario_nome || u.funcionario || u.idFuncionario}</td>
                                <td>{formatDateTime(u.data_inicio)}</td>
                                <td>{u.data_fim ? formatDateTime(u.data_fim) : <strong style={{color:'#f59e0b'}}>Em uso</strong>}</td>
                                <td>
                                    <button onClick={()=> deleteItem('usoMaquinario', u.id, fetchUsos)} className={`${styles.button} ${styles.buttonDanger}`}>Remover</button>
                                </td>
                            </tr>
                        ))}
                        {usos.length === 0 && <tr><td colSpan="5" className={styles.emptyState}>Nenhum uso registrado</td></tr>}
                    </tbody>
                </table>}
            </div>
        );
    }

    function renderCotacao(){
        return (
            <div>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Cotações</h3>
                    <button onClick={fetchCotacoes} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar</button>
                </div>
                {loading ? <div className={styles.loadingText}>Carregando...</div> :
                <table className={styles.table}>
                    <thead><tr><th>Cultura</th><th>Preço Atual</th><th>Alvo Venda</th><th>Variação 24h</th></tr></thead>
                    <tbody>
                        {cotacoes.map(c=>(
                            <tr key={c.id}>
                                <td><strong>{c.nome || c.cultura}</strong></td>
                                <td>R$ {typeof c.precoAtual === 'number' ? c.precoAtual.toFixed(2) : c.precoAtual}</td>
                                <td>R$ {c.precoAlvoVenda}</td>
                                <td>{c.variacao24h}</td>
                            </tr>
                        ))}
                        {cotacoes.length === 0 && <tr><td colSpan="4" className={styles.emptyState}>Nenhuma cotação disponível</td></tr>}
                    </tbody>
                </table>}
            </div>
        );
    }

    function renderCulturas(){
        return (
            <div>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Culturas</h3>
                    <div className={styles.buttonGroup}>
                        <button onClick={openCreateCultura} className={styles.button}>Nova cultura</button>
                        <button onClick={fetchCulturas} className={`${styles.button} ${styles.buttonSecondary}`}>Atualizar</button>
                    </div>
                </div>
                {loading ? <div className={styles.loadingText}>Carregando...</div> :
                <table className={styles.table} style={{width:'50%'}}>
                    <thead><tr><th>Nome</th><th>Ações</th></tr></thead>
                    <tbody>
                        {culturas.map(c=>(
                            <tr key={c.id}>
                                <td><strong>{c.nome}</strong></td>
                                <td>
                                    <button onClick={()=> openEditCultura(c)} className={styles.button}>Editar</button>
                                    <button onClick={()=> deleteCultura(c.id)} className={`${styles.button} ${styles.buttonDanger}`} style={{marginLeft:8}}>Remover</button>
                                </td>
                            </tr>
                        ))}
                        {culturas.length === 0 && <tr><td colSpan="2" className={styles.emptyState}>Nenhuma cultura cadastrada</td></tr>}
                    </tbody>
                </table>}
            </div>
        );
    }

    function renderTab(){
        if(tab==='Dashboard') return renderDashboard();
        if(tab==='Funcionários') return renderfuncionario();
        if(tab==='Horas') return renderHoras();
        if(tab==='Maquinários') return renderMaquinas();
        if(tab==='Uso Maquinário') return renderUsoMaquinario();
        if(tab==='Cotação') return renderCotacao();
        if(tab==='Culturas') return renderCulturas();
        return null;
    }

    return (
        <div className={styles.container}>
            <Sidebar active="Admin" onNavigate={(v) => {
                if(v === 'Dashboard') window.location.href = '/';
                else if(v === 'Admin') window.location.href = '/admin';
                else if(v === 'Funcionario') window.location.href = '/funcionario';
            }} />

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>🔧 Painel Administrativo</h1>
                </header>

                <nav className={styles.navTabs}>
                    {TABS.map(t=> (
                        <button 
                            key={t} 
                            onClick={()=>setTab(t)} 
                            className={`${styles.tabButton} ${t===tab ? styles.tabButtonActive : ''}`}
                        >
                            {t}
                        </button>
                    ))}
                </nav>

                <section className={styles.section}>
                    {renderTab()}
                </section>

                {modalOpen && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3 className={styles.modalTitle}>{editingFuncionario ? '✏️ Editar Funcionário' : '➕ Novo Funcionário'}</h3>
                            <form onSubmit={submitFuncionario}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nome</label>
                                    <input className={styles.input} name="nome" value={form.nome} onChange={handleFormChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Cultura</label>
                                    <select className={styles.select} name="idCultura" value={form.idCultura} onChange={handleFormChange}>
                                        <option value="">-- selecione --</option>
                                        {culturas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={closeModal} className={`${styles.button} ${styles.buttonSecondary}`}>Cancelar</button>
                                    <button type="submit" disabled={loading} className={styles.button}>{loading ? 'Salvando...' : 'Salvar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {culturaModalOpen && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3 className={styles.modalTitle}>{editingCultura ? '✏️ Editar Cultura' : '➕ Nova Cultura'}</h3>
                            <form onSubmit={submitCultura}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nome</label>
                                    <input className={styles.input} name="nome" value={culturaForm.nome} onChange={handleCulturaFormChange} />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={closeCulturaModal} className={`${styles.button} ${styles.buttonSecondary}`}>Cancelar</button>
                                    <button type="submit" disabled={loading} className={styles.button}>{loading ? 'Salvando...' : 'Salvar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {maquinaModalOpen && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3 className={styles.modalTitle}>{editingMaquina ? '✏️ Editar Maquinário' : '➕ Novo Maquinário'}</h3>
                            <form onSubmit={submitMaquina}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nome da Máquina</label>
                                    <input className={styles.input} name="maquina" value={maquinaForm.maquina} onChange={handleMaquinaFormChange} />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={closeMaquinaModal} className={`${styles.button} ${styles.buttonSecondary}`}>Cancelar</button>
                                    <button type="submit" disabled={loading} className={styles.button}>{loading ? 'Salvando...' : 'Salvar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
