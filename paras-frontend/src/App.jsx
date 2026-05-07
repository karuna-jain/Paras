import { useState } from 'react'
import {
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaReceipt,
  FaFileContract,
  FaShoppingBag,
  FaFolderOpen,
  FaUserPlus,
  FaChartPie,
  FaFileAlt,
  FaChartBar,
  FaPlusSquare,
  FaPowerOff
} from 'react-icons/fa'

import CustomerView from './CustomerView'
import PartView from './PartView'
import AccountView from './AccountView'
import SalesOrderView from './SalesOrderView'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderHome = () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#d6dbe2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          fontSize: '26px',
          fontWeight: 'bold',
          color: '#2a3e91',
          marginBottom: '30px',
          letterSpacing: '2px'
        }}
      >
        (2026-2027)
      </div>

      <div
        style={{
          width: '220px',
          height: '220px',
          border: '2px solid #8ea2b5',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '35px',
          color: '#666',
          fontSize: '18px',
          textAlign: 'center'
        }}
      >
        Paras
        <br />
        Logo Area
      </div>

      <div
        style={{
          fontSize: '42px',
          fontWeight: 'bold',
          color: '#2747a6',
          letterSpacing: '3px'
        }}
      >
        PARAS AUTO PARTS
      </div>

      <div
        style={{
          fontSize: '22px',
          marginTop: '10px',
          color: '#334'
        }}
      >
        KHIRKIYA
      </div>
    </div>
  )

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#d6dbe2',
        fontFamily: 'Tahoma, Verdana, sans-serif'
      }}
    >

      {/* HIDE MENU + TOOLBAR IN SALES ORDER */}
      {activeTab !== 'sales-orders' && (
        <>
          {/* TOP MENU */}
          <header
            style={{
              height: '38px',
              borderBottom: '1px solid #a6b4c2',
              background: '#f2f4f7',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              fontSize: '12px',
              color: '#1c2f5c'
            }}
          >
            <div
              style={{
                width: '80px',
                fontWeight: 'bold',
                color: '#1f53d1'
              }}
            >
              Paras
            </div>

            <div
              style={{
                marginRight: '28px',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('home')}
            >
              ENTRY
            </div>

            <div style={{ marginRight: '28px' }}>REPORTS</div>
            <div style={{ marginRight: '28px' }}>MASTERS</div>
            <div style={{ marginRight: '28px' }}>QUERY</div>
            <div style={{ marginRight: '28px' }}>SETTINGS</div>
            <div style={{ marginRight: '28px' }}>LEDG.PRN</div>
            <div style={{ marginRight: '28px' }}>BACKUP</div>
            <div style={{ marginRight: '28px' }}>HELP</div>

            <div
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('home')}
            >
              EXIT
            </div>

            <div
              style={{
                marginLeft: 'auto',
                marginRight: '18px',
                color: '#4b5c7a'
              }}
            >
              05-05-2026 (TUESDAY) &nbsp;&nbsp;&nbsp;
              PARAS AUTO PARTS &nbsp;&nbsp;&nbsp; (OPER)
            </div>
          </header>

          {/* TOOLBAR */}
          <div
            style={{
              height: '80px',
              borderBottom: '1px solid #b4c2d0',
              background: '#d9dee5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px'
            }}
          >
            <ToolbarButton
              icon={<FaShoppingCart />}
              label="S.Orders"
              active={activeTab === 'sales-orders'}
              onClick={() => setActiveTab('sales-orders')}
            />

            <ToolbarButton
              icon={<FaFileInvoiceDollar />}
              label="Whole-Sale"
            />

            <ToolbarButton
              icon={<FaReceipt />}
              label="Retail Bill"
            />

            <ToolbarButton
              icon={<FaFileContract />}
              label="Quotation"
            />

            <ToolbarButton
              icon={<FaShoppingBag />}
              label="P.Orders"
            />

            <ToolbarButton
              icon={<FaFolderOpen />}
              label="Purchases"
            />

            <ToolbarButton
              icon={<FaUserPlus />}
              label="New A/C F7"
              active={activeTab === 'customers'}
              onClick={() => setActiveTab('customers')}
            />

            <ToolbarButton
              icon={<FaChartPie />}
              label="Parts F6"
              active={activeTab === 'parts'}
              onClick={() => setActiveTab('parts')}
            />

            <ToolbarButton
              icon={<FaFileAlt />}
              label="Purch.Report"
            />

            <ToolbarButton
              icon={<FaChartBar />}
              label="Sales Report"
            />

            <ToolbarButton
              icon={<FaPlusSquare />}
              label="CB Voucher"
              active={activeTab === 'accounts'}
              onClick={() => setActiveTab('accounts')}
            />

            <ToolbarButton
              icon={<FaFileAlt />}
              label="J.Voucher"
            />

            <div style={{ marginLeft: 'auto' }}>
              <ToolbarButton
                icon={<FaPowerOff />}
                label="EXIT"
                danger
                onClick={() => setActiveTab('home')}
              />
            </div>
          </div>
        </>
      )}

      {/* CONTENT */}
      <main
        style={{
          width: '100%',
          height:
            activeTab === 'sales-orders'
              ? '100vh'
              : 'calc(100vh - 118px)',
          overflow: 'hidden',
          background: '#d6dbe2',
          position: 'relative'
        }}
      >
        {activeTab === 'sales-orders' ? (
          <SalesOrderView onExit={() => setActiveTab('home')} />
        ) : (
          <>
            {activeTab === 'home' && renderHome()}

            {activeTab === 'accounts' && <AccountView />}

            {activeTab === 'customers' && <CustomerView />}

            {activeTab === 'parts' && <PartView />}
          </>
        )}
      </main>
    </div>
  )
}

function ToolbarButton({
  icon,
  label,
  active,
  danger,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '76px',
        height: '76px',
        border: active
          ? '1px solid #3f6fff'
          : '1px solid #bcc6d2',
        background: active ? '#e8f0ff' : '#f4f5f7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        cursor: 'pointer',
        color: danger ? '#e11d48' : '#1d2f5c',
        fontSize: '12px',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
      }}
    >
      <div
        style={{
          fontSize: '28px'
        }}
      >
        {icon}
      </div>

      <div>{label}</div>
    </button>
  )
}

export default App