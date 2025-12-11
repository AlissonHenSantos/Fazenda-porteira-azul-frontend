
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'


export default function Dashboard(){
  const [cotacoes, setCotacoes] = useState([])

  async function getCotacoes() {
     const cotacoesRes = await api.get("/cotacaoCultura");

     setCotacoes(cotacoesRes.data)
    console.log(cotacoesRes.data)
  }

  useEffect(() => {
    getCotacoes();

  }, [])

  function avaliarVenda(item) {
    if (item.precoAtual >= item.precoAlvoVenda) return { action: 'Vender', highlight: 'sell' }
    if (item.variacao24h >= 2) return { action: 'Vender (subiu muito)', highlight: 'sell' }
    return { action: 'Manter', highlight: 'keep' }
  }

  return (
  <div style={{display:'flex', minHeight:'100vh', background:'#f3f6fb'}}>
            <Sidebar active="Dashboard" />


      <main className='dashboard ' >
      
      <header className='dashboard-header'>
        <h1>Painel de Cotações</h1>
      </header>

      
    
      <section className='cards ' style={{width: "100%"}}>
        
        {cotacoes.map(item => {
          const eva = avaliarVenda(item)
          return (
            <article key={item.id} className='card'>
              <div className='card-left'>
                <i className="fa fa-seedling card-icon" aria-hidden="true"></i>
                <div className='card-title'>
                  <strong>{item.nomeCultura}</strong>
                </div>
              </div>

              <div className='card-right'>
                <div className='price'>R$ {item.precoAtual.toFixed(2)}</div>
                <div className={`chg ${item.variacao24h >= 0 ? 'up' : 'down'}`}>
                </div>

                <div className={`action ${eva.highlight}`}>
                  <i className={`fa ${eva.highlight === 'sell' ? 'fa-bullhorn' : 'fa-clock'}`}></i>
                  {eva.action}
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </main>
    </div>
  )
}
