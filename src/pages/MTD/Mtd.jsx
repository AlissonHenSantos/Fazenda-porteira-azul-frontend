import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from './Mtd.module.css';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function MTD(){
    const apiBase = import.meta?.env?.VITE_API_BASE || 'http://localhost:5000';
    const client = axios.create({ 
        baseURL: apiBase, 
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });

    const [culturas, setCulturas] = useState([]);
    const [selectedCultura, setSelectedCultura] = useState('');
    const [cotacao, setCotacao] = useState(null);
    const [analise, setAnalise] = useState(null);
    const [custoAtual, setCustoAtual] = useState(null);
    const [historicoSazonalidade, setHistoricoSazonalidade] = useState(null);
    const [historicoCustos, setHistoricoCustos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('analise');
    
    // Modal states
    const [custoModalOpen, setCustoModalOpen] = useState(false);
    const [custoForm, setCustoForm] = useState({
        custoInsumos: '',
        custoMaoDeObra: '',
        custoMaquinario: '',
        ano: new Date().getFullYear(),
        mes: new Date().getMonth() + 1
    });
    
    const [historico, setHistorico] = useState(false);
    const [alertaModalOpen, setAlertaModalOpen] = useState(false);
    const [alertaForm, setAlertaForm] = useState({
        tipoAlerta: 'preco_minimo',
        precoLimiteInferior: '',
        precoLimiteSuperior: ''
    });

    // Fetch culturas ao iniciar
    useEffect(() => {
        fetchCulturas();
    }, []);

    // Fetch dados quando cultura muda
    useEffect(() => {
        if (selectedCultura) {
            fetchCotacao();
            fetchCustoAtual();
            fetchHistoricoCustos();
            fetchAnalise();
            fetchSazonalidade();
        }
    }, [selectedCultura]);

    async function fetchCulturas(){
        setLoading(true);
        setError('');
        try{
            const res = await client.get('/cultura');
            const data = res.data || [];
            setCulturas(data);
            if(data.length > 0) {
                setSelectedCultura(data[0].id);
            }
        }catch(err){
            console.error('Erro ao buscar culturas:', err);
            setError('Erro ao carregar culturas');
        }finally{
            setLoading(false);
        }
    }

    async function fetchCotacao(){
        try{
            const res = await client.get(`/cotacaoCultura/atual/${selectedCultura}`);
            console.log(res.data)
            setCotacao(res.data);
        }catch(err){
            console.error('Erro ao buscar cotação:', err);
            setCotacao(null);
        }
    }

    async function fetchCustoAtual(){
        try{
            // Buscar custo ATIVO (atual em uso)
            const res = await client.get(`/custoProducao/cultura/${selectedCultura}/atual`);
            console.log(res.data)
            setCustoAtual(res.data);
            
            if(res.data){
                setCustoForm({
                    custoInsumos: res.data.custoInsumos || '',
                    custoMaoDeObra: res.data.custoMaoDeObra || '',
                    custoMaquinario: res.data.custoMaquinario || '',
                    ano: res.data.ano || new Date().getFullYear(),
                    mes: res.data.mes || new Date().getMonth() + 1
                });
            }
        }catch(err){
            console.error('Erro ao buscar custo atual:', err);
            setCustoAtual(null);
            setCustoForm({
                custoInsumos: '',
                custoMaoDeObra: '',
                custoMaquinario: '',
                ano: new Date().getFullYear(),
                mes: new Date().getMonth() + 1
            });
        }
    }

    async function fetchHistoricoCustos(){
        try{
            // Buscar HISTÓRICO COMPLETO de custos
            const res = await client.get(`/custoProducao/cultura/${selectedCultura}`);
            console.log(res.data)
            setHistoricoCustos(Array.isArray(res.data) ? res.data : []);
        }catch(err){
            console.error('Erro ao buscar histórico de custos:', err);
            setHistoricoCustos([]);
        }
    }

    async function fetchSazonalidade(){
        try{
            // Buscar análise de sazonalidade
            const res = await client.get(`/sazonalidade/${selectedCultura}/analisar`);
            setHistoricoSazonalidade(res.data);
        }catch(err){
            console.error('Erro ao buscar sazonalidade:', err);
            setHistoricoSazonalidade(null);
        }
    }

    async function fetchAnalise(){
        try{
            // Primeiro tentar calcular automaticamente
            await client.get(`/analise-venda/cultura/${selectedCultura}/calcular?margemDesejada=20`);
            
            // Depois buscar resultado
            const res = await client.get(`/analise-venda/cultura/${selectedCultura}`);
            setAnalise(res.data);
        }catch(err){
            console.error('Erro ao buscar análise:', err);
            setAnalise(null);
        }
    }

    async function submitCusto(e){
        e.preventDefault();
        
        if(!custoForm.custoInsumos || !custoForm.custoMaoDeObra || !custoForm.custoMaquinario) {
            alert('Preencha todos os campos de custo');
            return;
        }

        try{
            const payload = {
                idCultura: selectedCultura,
                custoInsumos: parseFloat(custoForm.custoInsumos),
                custoMaoDeObra: parseFloat(custoForm.custoMaoDeObra),
                custoMaquinario: parseFloat(custoForm.custoMaquinario),
                ano: parseInt(custoForm.ano),
                mes: parseInt(custoForm.mes)
            };

            // Sempre criar novo registro (não atualizar)
            // O backend desativa o anterior automaticamente
            await client.post('/custoProducao', payload);
            alert('Custos registrados com sucesso!');

            setCustoModalOpen(false);
            fetchCustoAtual();
            fetchHistoricoCustos();
            fetchSazonalidade();
            fetchAnalise();
        }catch(err){
            console.error('Erro ao salvar custos:', err);
            alert('Erro ao salvar custos: ' + (err.response?.data?.error || err.message));
        }
    }

    async function submitAlerta(e){
        e.preventDefault();
        
        if(!alertaForm.precoLimiteInferior || !alertaForm.precoLimiteSuperior) {
            alert('Preencha os preços limites');
            return;
        }

        try{
            const payload = {
                idCultura: selectedCultura,
                tipoAlerta: alertaForm.tipoAlerta,
                precoLimiteInferior: parseFloat(alertaForm.precoLimiteInferior),
                precoLimiteSuperior: parseFloat(alertaForm.precoLimiteSuperior),
                ativo: true
            };

            await client.post('/alerta-venda', payload);
            alert('Alerta criado com sucesso!');
            setAlertaModalOpen(false);
            setAlertaForm({
                tipoAlerta: 'preco_minimo',
                precoLimiteInferior: '',
                precoLimiteSuperior: ''
            });
        }catch(err){
            console.error('Erro ao criar alerta:', err);
            alert('Erro ao criar alerta: ' + (err.response?.data?.error || err.message));
        }
    }

    function getColorAlerta(tipo){
        if(!tipo) return '#9ca3af';
        if(tipo === 'vender') return '#10b981';
        if(tipo === 'esperar') return '#f59e0b';
        return '#ef4444';
    }

    function getColorSazonalidade(indicador){
        if(indicador === 'alta') return '#10b981';
        if(indicador === 'baixa') return '#ef4444';
        return '#f59e0b';
    }

    const culturaSelecionada = culturas.find(c => c.id === selectedCultura);

    return (
        <div className={styles.container}>
            <Sidebar active="MTD" />

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>📊 Módulo de Tomada de Decisão (MTD)</h1>
                    <p className={styles.subtitle}>Análise de preços, custos e sazonalidade</p>
                </header>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.culturaSelector}>
                    <label>Selecione a cultura:</label>
                    <select 
                        value={selectedCultura} 
                        onChange={e => setSelectedCultura(e.target.value)}
                        className={styles.select}
                        disabled={loading}
                    >
                        {culturas.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                <nav className={styles.tabs}>
                    <button 
                        onClick={() => setTab('analise')}
                        className={`${styles.tabBtn} ${tab === 'analise' ? styles.active : ''}`}
                    >
                        📈 Análise
                    </button>
                    <button 
                        onClick={() => setTab('custos')}
                        className={`${styles.tabBtn} ${tab === 'custos' ? styles.active : ''}`}
                    >
                        💰 Custos
                    </button>
                    <button 
                        onClick={() => setTab('sazonalidade')}
                        className={`${styles.tabBtn} ${tab === 'sazonalidade' ? styles.active : ''}`}
                    >
                        📅 Sazonalidade
                    </button>
                </nav>

                {tab === 'analise' && (
                    <section className={styles.section}>
                        <h2>Análise MTD - Momento de Tomada de Decisão</h2>
                        <p style={{color: '#64748b', marginBottom: 20}}>
                            Cultura: <strong>{culturaSelecionada?.nome}</strong>
                        </p>

                        {loading ? (
                            <div className={styles.emptyState}>Carregando análise...</div>
                        ) : !custoAtual ? (
                            <div className={styles.emptyState}>
                                ⚠️ Configure os custos de produção primeiro para realizar a análise.
                            </div>
                        ) : !cotacao ? (
                            <div className={styles.emptyState}>
                                ⚠️ Nenhuma cotação disponível. Cadastre uma cotação para realizar a análise.
                            </div>
                        ) : analise ? (
                            <>
                                {/* Card principal de recomendação */}
                                <div
                                    className={styles.alertBox}
                                    style={{
                                        borderLeft: `6px solid ${getColorAlerta(analise.recomendacaoTipo)}`,
                                        backgroundColor: analise.recomendacaoTipo === 'vender' ? '#f0fdf4' : 
                                                        analise.recomendacaoTipo === 'nao_vender' ? '#fef2f2' : '#fefce8'
                                    }}
                                >
                                    <div
                                        className={styles.alertStatus}
                                        style={{
                                            color: getColorAlerta(analise.recomendacaoTipo),
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            marginBottom: 12
                                        }}
                                    >
                                        {analise.recomendacaoTipo === 'vender' && '✅ RECOMENDAÇÃO: VENDER'}
                                        {analise.recomendacaoTipo === 'esperar' && '⏳ RECOMENDAÇÃO: ESPERAR'}
                                        {analise.recomendacaoTipo === 'avaliar' && '⚠️ RECOMENDAÇÃO: AVALIAR'}
                                        {analise.recomendacaoTipo === 'nao_vender' && '🛑 RECOMENDAÇÃO: NÃO VENDER'}
                                        {!analise.recomendacaoTipo && 'SEM RECOMENDAÇÃO'}
                                    </div>
                                    <div className={styles.alertMessage} style={{fontSize: 16, lineHeight: 1.6}}>
                                        {analise.recomendacao || 'Sem mensagem de recomendação.'}
                                    </div>
                                    <div className={styles.alertConfidencia} style={{marginTop: 12, fontSize: 14}}>
                                        📊 Nível de Confiança: <strong>{analise.confianca ?? 0}%</strong>
                                    </div>
                                </div>

                                {/* Grid de métricas principais */}
                                <div className={styles.metricsGrid} style={{marginTop: 30}}>
                                    <div className={styles.metric}>
                                        <div className={styles.metricLabel}>💰 Cotação Atual</div>
                                        <div className={styles.metricValue} style={{color: '#1e40af'}}>
                                            R$ {(analise.cotacaoAtual ?? cotacao?.precoAtual ?? 0).toFixed(2)}
                                        </div>
                                        <div style={{fontSize: 12, color: '#64748b', marginTop: 4}}>Preço de mercado</div>
                                    </div>

                                    <div className={styles.metric}>
                                        <div className={styles.metricLabel}>⚖️ Ponto de Equilíbrio</div>
                                        <div className={styles.metricValue} style={{color: '#dc2626'}}>
                                            R$ {(analise.pontoEquilibrio ?? 0).toFixed(2)}
                                        </div>
                                        <div style={{fontSize: 12, color: '#64748b', marginTop: 4}}>Custo mínimo = Custo de produção</div>
                                    </div>

                                    <div className={styles.metric}>
                                        <div className={styles.metricLabel}>🎯 Preço Alvo ({analise.margemDesejada ?? 20}%)</div>
                                        <div className={styles.metricValue} style={{color: '#0891b2'}}>
                                            R$ {(analise.precoAlvo ?? 0).toFixed(2)}
                                        </div>
                                        <div style={{fontSize: 12, color: '#64748b', marginTop: 4}}>Custo + Margem desejada</div>
                                    </div>

                                    <div className={styles.metric}>
                                        <div className={styles.metricLabel}>💵 Lucro Atual/Saca</div>
                                        <div
                                            className={styles.metricValue}
                                            style={{color: (analise.lucroAtual ?? 0) > 0 ? '#10b981' : '#ef4444'}}
                                        >
                                            {analise.lucroAtual != null 
                                                ? `R$ ${analise.lucroAtual.toFixed(2)}`
                                                : 'N/A'}
                                        </div>
                                        <div style={{fontSize: 12, color: '#64748b', marginTop: 4}}>
                                            {analise.lucroAtual > 0 ? '✅ Lucrativo' : analise.lucroAtual < 0 ? '❌ Prejuízo' : 'Neutro'}
                                        </div>
                                    </div>
                                </div>

                                {/* Indicadores visuais */}
                                <div style={{marginTop: 30, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                                    <div 
                                        style={{
                                            padding: 20,
                                            borderRadius: 8,
                                            backgroundColor: analise.ehLucrativo ? '#f0fdf4' : '#fef2f2',
                                            border: `2px solid ${analise.ehLucrativo ? '#10b981' : '#ef4444'}`
                                        }}
                                    >
                                        <div style={{fontSize: 14, fontWeight: 'bold', marginBottom: 8}}>
                                            {analise.ehLucrativo ? '✅ Cotação > Custo' : '❌ Cotação ≤ Custo'}
                                        </div>
                                        <div style={{fontSize: 13, color: '#64748b'}}>
                                            {analise.ehLucrativo 
                                                ? 'A cotação atual está acima do custo de produção. Está lucrativo!' 
                                                : 'A cotação está abaixo ou igual ao custo. Vender agora gera prejuízo.'}
                                        </div>
                                    </div>

                                    <div 
                                        style={{
                                            padding: 20,
                                            borderRadius: 8,
                                            backgroundColor: analise.atingiuMargem ? '#f0fdf4' : '#fefce8',
                                            border: `2px solid ${analise.atingiuMargem ? '#10b981' : '#f59e0b'}`
                                        }}
                                    >
                                        <div style={{fontSize: 14, fontWeight: 'bold', marginBottom: 8}}>
                                            {analise.atingiuMargem ? '🎯 Atingiu Margem Desejada' : '⏳ Abaixo da Margem'}
                                        </div>
                                        <div style={{fontSize: 13, color: '#64748b'}}>
                                            {analise.atingiuMargem 
                                                ? 'A cotação atingiu ou superou o preço alvo com a margem desejada!' 
                                                : 'A cotação ainda não atingiu o preço alvo. Considere esperar.'}
                                        </div>
                                    </div>
                                </div>

                                {/* Box de sazonalidade */}
                                {analise.indicadorSazonalidade && (
                                    <div 
                                        style={{
                                            marginTop: 30,
                                            padding: 20,
                                            borderRadius: 8,
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <div style={{fontSize: 16, fontWeight: 'bold', marginBottom: 12}}>
                                            📅 Sazonalidade: {analise.indicadorSazonalidade.toUpperCase()}
                                        </div>
                                        <div style={{fontSize: 14, color: '#64748b'}}>
                                            {analise.indicadorSazonalidade === 'favoravel' && 
                                                'Período favorável para vendas. Preços historicamente mais altos nesta época.'}
                                            {analise.indicadorSazonalidade === 'neutro' && 
                                                'Período neutro. Preços próximos à média histórica.'}
                                            {analise.indicadorSazonalidade === 'desfavoravel' && 
                                                'Período desfavorável. Preços historicamente mais baixos nesta época.'}
                                        </div>
                                        {analise.precoMedioHistorico && (
                                            <div style={{marginTop: 8, fontSize: 13, color: '#64748b'}}>
                                                Preço médio histórico: <strong>R$ {analise.precoMedioHistorico.toFixed(2)}</strong>
                                            </div>
                                        )}
                                    </div>
                                )}

                               
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                Nenhuma análise disponível. Configure os custos e cotações primeiro.
                            </div>
                        )}
                    </section>
                )}

                {tab === 'custos' && (
                    <section className={styles.section}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                            <h2>Custos de Produção - {culturaSelecionada?.nome}</h2>
                            <div style={{display: 'flex', gap: 10}}>
                                <button onClick={() => setHistorico(!historico)} className={`${styles.button} ${styles.buttonSecondary}`}>
                                    {historico ? '👁️ Ocultar Histórico' : '📋 Ver Histórico'}
                                </button>
                                <button onClick={() => setCustoModalOpen(true)} className={styles.button}>Registrar Novo</button>
                            </div>
                        </div>

                        {custoAtual?.id ? (
                            <>
                                <div className={styles.costTable} style={{backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981'}}>
                                    <div style={{padding: '16px', fontWeight: 'bold', color: '#10b981'}}>✓ CUSTO ATUAL EM USO</div>
                                    <div className={styles.costRow}>
                                        <div>Custos de Insumos (R$/saca)</div>
                                        <div><strong>R$ {custoAtual.custoInsumos?.toFixed(2)}</strong></div>
                                    </div>
                                    <div className={styles.costRow}>
                                        <div>Custos de Mão de Obra (R$/saca)</div>
                                        <div><strong>R$ {custoAtual.custoMaoDeObra?.toFixed(2)}</strong></div>
                                    </div>
                                    <div className={styles.costRow}>
                                        <div>Custos de Maquinário (R$/saca)</div>
                                        <div><strong>R$ {custoAtual.custoMaquinario?.toFixed(2)}</strong></div>
                                    </div>
                                    <div className={styles.costRowTotal}>
                                        <div><strong>CUSTO TOTAL (por saca)</strong></div>
                                        <div><strong>R$ {custoAtual.custoTotal?.toFixed(2)}</strong></div>
                                    </div>
                                    <div className={styles.costRowInfo} style={{marginTop: 10, fontSize: 12, color: '#64748b', padding: '8px 16px'}}>
                                        <div>{MESES[custoAtual.mes - 1]} de {custoAtual.ano}</div>
                                        <div>Registrado: {new Date(custoAtual.dataAtualizacao).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                </div>

                                {historico && historicoCustos.length > 1 && (
                                    <div style={{marginTop: 30}}>
                                        <h3>📜 Histórico de Custos</h3>
                                        <div className={styles.historicoTable}>
                                            {historicoCustos.map((custo, idx) => (
                                                <div 
                                                    key={custo.id} 
                                                    className={styles.historicoItem}
                                                    style={{backgroundColor: custo.ativo ? '#f0fdf4' : '#fafafa'}}
                                                >
                                                    <div className={styles.historicoHeader}>
                                                        <div>
                                                            <strong>{MESES[custo.mes - 1]} {custo.ano}</strong>
                                                            {custo.ativo && <span style={{marginLeft: 10, color: '#10b981', fontSize: 12}}>✓ ATIVO</span>}
                                                        </div>
                                                        <div style={{fontSize: 12, color: '#64748b'}}>
                                                            {new Date(custo.dataCriacao).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </div>
                                                    <div className={styles.historicoDados}>
                                                        <div>Insumos: R$ {custo.custoInsumos?.toFixed(2)}</div>
                                                        <div>Mão de Obra: R$ {custo.custoMaoDeObra?.toFixed(2)}</div>
                                                        <div>Maquinário: R$ {custo.custoMaquinario?.toFixed(2)}</div>
                                                        <div style={{fontWeight: 'bold', color: '#1e40af'}}>
                                                            Total: R$ {custo.custoTotal?.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                Nenhum custo registrado para {culturaSelecionada?.nome}. Clique em "Registrar Novo" para começar.
                            </div>
                        )}
                    </section>
                )}

                {tab === 'sazonalidade' && (
                    <section className={styles.section}>
                        <h2>Análise de Sazonalidade - {culturaSelecionada?.nome}</h2>

                        {historicoSazonalidade ? (
                            <>
                                <div className={styles.sazonalityAlert} style={{borderLeft: `4px solid ${getColorSazonalidade(historicoSazonalidade.indicador_sazonalidade_atual)}`}}>
                                    <div style={{fontSize: 18, fontWeight: 'bold', marginBottom: 8}}>
                                        📅 Sazonalidade Atual ({MESES[historicoSazonalidade.mes_atual - 1]}/{historicoSazonalidade.ano_atual})
                                    </div>
                                    <div style={{color: getColorSazonalidade(historicoSazonalidade.indicador_sazonalidade_atual), fontWeight: 'bold', fontSize: 16}}>
                                        {historicoSazonalidade.indicador_sazonalidade_atual?.toUpperCase()}
                                    </div>
                                    <div style={{marginTop: 8, fontSize: 14}}>
                                        Preço Médio Histórico: <strong>R$ {historicoSazonalidade.preco_medio_geral?.toFixed(2)}</strong>
                                    </div>
                                </div>

                                <div className={styles.sazonalityGrid}>
                                    {Object.values(historicoSazonalidade.analise_por_mes || {}).map((mes_data) => (
                                        <div 
                                            key={mes_data.mes} 
                                            className={styles.sazonalityCard}
                                            style={{borderTop: `3px solid ${mes_data.precoMedio > historicoSazonalidade.preco_medio_geral ? '#10b981' : '#ef4444'}`}}
                                        >
                                            <div className={styles.sazonalityMes}>{MESES[mes_data.mes - 1]}</div>
                                            <div className={styles.sazonalityMetrica}>
                                                <div>Preço Médio</div>
                                                <div style={{fontWeight: 'bold'}}>R$ {mes_data.precoMedio?.toFixed(2)}</div>
                                            </div>
                                            <div className={styles.sazonalityMetrica}>
                                                <div>Máximo</div>
                                                <div style={{fontWeight: 'bold', color: '#10b981'}}>R$ {mes_data.precoMaximo?.toFixed(2)}</div>
                                            </div>
                                            <div className={styles.sazonalityMetrica}>
                                                <div>Mínimo</div>
                                                <div style={{fontWeight: 'bold', color: '#ef4444'}}>R$ {mes_data.precoMinimo?.toFixed(2)}</div>
                                            </div>
                                            <div className={styles.sazonalityMetrica} style={{borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 8}}>
                                                <div>Custo Médio</div>
                                                <div style={{fontWeight: 'bold'}}>R$ {mes_data.custoMedio?.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.infoBox}>
                                    <h3>📌 Como Interpretar</h3>
                                    <ul>
                                        <li>
                                            <strong>ALTA:</strong> Preço acima da média histórica. Bom período para vender.
                                        </li>
                                        <li>
                                            <strong>MÉDIA:</strong> Preço próximo à média histórica. Situação equilibrada.
                                        </li>
                                        <li>
                                            <strong>BAIXA:</strong> Preço abaixo da média histórica. Período desfavorável para venda.
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                Dados insuficientes para análise de sazonalidade. Registre custos e cotações para mais meses.
                            </div>
                        )}
                    </section>
                )}

                {tab === 'alertas' && (
                    <section className={styles.section}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                            <h2>Configurar Alertas de Preço - {culturaSelecionada?.nome}</h2>
                            <button onClick={() => setAlertaModalOpen(true)} className={styles.button}>Novo Alerta</button>
                        </div>
                        <div className={styles.emptyState}>
                            Configure alertas para ser notificado quando o preço de {culturaSelecionada?.nome} atingir zonas de interesse.
                        </div>
                    </section>
                )}

                {custoModalOpen && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>Registrar Novo Custo de Produção - {culturaSelecionada?.nome}</h3>
                            <form onSubmit={submitCusto}>
                                <div style={{backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 4, padding: 12, marginBottom: 16, fontSize: 14}}>
                                    💡 Cada novo registro cria um histórico. O custo anterior ficará marcado como inativo.
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Custos de Insumos (R$/saca)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={custoForm.custoInsumos}
                                        onChange={e => setCustoForm({...custoForm, custoInsumos: e.target.value})}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Custos de Mão de Obra (R$/saca)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={custoForm.custoMaoDeObra}
                                        onChange={e => setCustoForm({...custoForm, custoMaoDeObra: e.target.value})}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Custos de Maquinário (R$/saca)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={custoForm.custoMaquinario}
                                        onChange={e => setCustoForm({...custoForm, custoMaquinario: e.target.value})}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                                    <div className={styles.formGroup}>
                                        <label>Mês</label>
                                        <select 
                                            value={custoForm.mes}
                                            onChange={e => setCustoForm({...custoForm, mes: e.target.value})}
                                        >
                                            {MESES.map((m, i) => (
                                                <option key={i + 1} value={i + 1}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ano</label>
                                        <input 
                                            type="number"
                                            min="2020"
                                            max={new Date().getFullYear()}
                                            value={custoForm.ano}
                                            onChange={e => setCustoForm({...custoForm, ano: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20}}>
                                    <button type="button" onClick={() => setCustoModalOpen(false)} className={`${styles.button} ${styles.buttonSecondary}`}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className={styles.button}>
                                        Registrar Custo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {alertaModalOpen && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>Criar Alerta de Preço - {culturaSelecionada?.nome}</h3>
                            <form onSubmit={submitAlerta}>
                                <div className={styles.formGroup}>
                                    <label>Tipo de Alerta</label>
                                    <select 
                                        value={alertaForm.tipoAlerta}
                                        onChange={e => setAlertaForm({...alertaForm, tipoAlerta: e.target.value})}
                                    >
                                        <option value="preco_minimo">Preço Mínimo (Não vender abaixo)</option>
                                        <option value="preco_ideal">Preço Ideal (Alvo de venda)</option>
                                        <option value="oportunidade">Oportunidade (Preço muito alto)</option>
                                        <option value="risco">Risco (Preço muito baixo)</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Preço Limite Inferior (R$/saca)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={alertaForm.precoLimiteInferior}
                                        onChange={e => setAlertaForm({...alertaForm, precoLimiteInferior: e.target.value})}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Preço Limite Superior (R$/saca)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={alertaForm.precoLimiteSuperior}
                                        onChange={e => setAlertaForm({...alertaForm, precoLimiteSuperior: e.target.value})}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20}}>
                                    <button type="button" onClick={() => setAlertaModalOpen(false)} className={`${styles.button} ${styles.buttonSecondary}`}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className={styles.button}>
                                        Criar Alerta
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}