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
import BrandMaster from './BrandMaster'
import ModelMaster from './ModelMaster'
import SalesInvoiceView from './SalesInvoiceView'
import PurchaseInvoiceView from './PurchaseInvoiceView'
import VoucherView from './VoucherView'
import ReportView from './ReportView'
import HSNMaster from './HSNMaster'
import QuotationView from './QuotationView'
import PurchaseOrderView from './PurchaseOrderView'
import QueryView from './QueryView'
import SetupView from './SetupView'


const menuItemStyle = {
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
  cursor: 'pointer',
  background: '#fff',
  color: '#1c2f5c',
  fontSize: '11px',
  transition: 'background 0.2s'
}

const dropdownContainerStyle = {
  position: 'absolute',
  top: '24px',
  left: '0',
  width: '180px',
  background: '#ffffff',
  border: '1px solid #9caab7',
  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column'
}

function App() {

  const [activeDropdown, setActiveDropdown] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [prefilledData, setPrefilledData] = useState(null);

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

  const handleCreateBill = (orderData) => {
    setPrefilledData(orderData);
    setActiveTab('wholesale'); // Defaulting to wholesale, user can change
  };

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
      {/* HIDE MENU FOR FULL PAGE WINDOWS */}
      {activeTab !== 'sales-orders' &&
        activeTab !== 'parts' &&
        activeTab !== 'brand-master' &&
        activeTab !== 'model-master' &&
        activeTab !== 'wholesale' &&
        activeTab !== 'retail' &&
        activeTab !== 'cb-voucher' &&
        activeTab !== 'j-voucher' &&
        activeTab !== 'quotation' &&
        activeTab !== 'purchase-orders' &&
        activeTab !== 'stock-report' &&
        activeTab !== 'ledger-report' &&
        activeTab !== 'account-query' &&
        activeTab !== 'stock-query' &&
        activeTab !== 'company-setup' &&
        activeTab !== 'user-permissions' &&
        activeTab !== 'accounts' &&
        activeTab !== 'pick-slip-report' && (

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

              {/* ENTRY DROPDOWN */}
              <div
                style={{
                  marginRight: '28px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div onClick={() => setActiveDropdown(activeDropdown === 'entry' ? null : 'entry')}>
                  ENTRY
                </div>
                {activeDropdown === 'entry' && (
                  <div style={dropdownContainerStyle}>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('sales-orders'); setActiveDropdown(null); }}>Sales Order</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('wholesale'); setActiveDropdown(null); }}>Whole-Sale</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('retail'); setActiveDropdown(null); }}>Retail Bill</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('quotation'); setActiveDropdown(null); }}>Quotation</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('purchase-orders'); setActiveDropdown(null); }}>Purchase Order</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('purchases'); setActiveDropdown(null); }}>Purchases</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('cb-voucher'); setActiveDropdown(null); }}>Cash/Bank Voucher</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('j-voucher'); setActiveDropdown(null); }}>Journal Voucher</div>
                  </div>
                )}
              </div>

              {/* REPORTS DROPDOWN */}
              <div
                style={{
                  marginRight: '28px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div onClick={() => setActiveDropdown(activeDropdown === 'reports' ? null : 'reports')}>
                  REPORTS
                </div>
                {activeDropdown === 'reports' && (
                  <div style={dropdownContainerStyle}>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('sales-report'); setActiveDropdown(null); }}>Sales Report</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('purch-report'); setActiveDropdown(null); }}>Purchase Report</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('stock-report'); setActiveDropdown(null); }}>Stock Report</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('ledger-report'); setActiveDropdown(null); }}>Ledger Report</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('pick-slip-report'); setActiveDropdown(null); }}>Pick Slip Report</div>
                  </div>
                )}
              </div>

              {/* MASTERS DROPDOWN */}
              <div
                style={{
                  marginRight: '28px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div onClick={() => setActiveDropdown(activeDropdown === 'masters' ? null : 'masters')}>
                  MASTERS
                </div>
                {activeDropdown === 'masters' && (
                  <div style={dropdownContainerStyle}>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('accounts'); setActiveDropdown(null); }}>Account Master</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('brand-master'); setActiveDropdown(null); }}>Brand Master</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('model-master'); setActiveDropdown(null); }}>Model Master</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('hsn-master'); setActiveDropdown(null); }}>HSN Master</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('customers'); setActiveDropdown(null); }}>Customer Master</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('parts'); setActiveDropdown(null); }}>Part Master</div>
                  </div>
                )}
              </div>

              <div style={{ marginRight: '28px', position: 'relative', cursor: 'pointer' }}>
                <div onClick={() => setActiveDropdown(activeDropdown === 'query' ? null : 'query')}>
                  QUERY
                </div>
                {activeDropdown === 'query' && (
                  <div style={dropdownContainerStyle}>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('account-query'); setActiveDropdown(null); }}>Account Query</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('stock-query'); setActiveDropdown(null); }}>Stock Query</div>
                  </div>
                )}
              </div>

              <div style={{ marginRight: '28px', position: 'relative', cursor: 'pointer' }}>
                <div onClick={() => setActiveDropdown(activeDropdown === 'settings' ? null : 'settings')}>
                  SETTINGS
                </div>
                {activeDropdown === 'settings' && (
                  <div style={dropdownContainerStyle}>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('company-setup'); setActiveDropdown(null); }}>Company Setup</div>
                    <div style={menuItemStyle} onClick={() => { setActiveTab('user-permissions'); setActiveDropdown(null); }}>User Permissions</div>
                  </div>
                )}
              </div>

              <div style={{ marginRight: '28px', cursor: 'pointer' }} onClick={() => setActiveTab('ledger-report')}>LEDG.PRN</div>
              <div style={{ marginRight: '28px', cursor: 'pointer' }} onClick={() => setActiveTab('company-setup')}>BACKUP</div>
              <div style={{ marginRight: '28px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>HELP</div>

              <div
                style={{
                  cursor: 'pointer'
                }}
                onClick={() =>
                  setActiveTab('home')
                }
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
                05-05-2026 (TUESDAY)
                &nbsp;&nbsp;&nbsp;
                PARAS AUTO PARTS
                &nbsp;&nbsp;&nbsp;
                (OPER)
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
                active={activeTab === 'wholesale'}
                onClick={() => setActiveTab('wholesale')}
              />

              <ToolbarButton
                icon={<FaReceipt />}
                label="Retail Bill"
                active={activeTab === 'retail'}
                onClick={() => setActiveTab('retail')}
              />

              <ToolbarButton
                icon={<FaFileContract />}
                label="Quotation"
                active={activeTab === 'quotation'}
                onClick={() => setActiveTab('quotation')}
              />

              <ToolbarButton
                icon={<FaShoppingBag />}
                label="P.Orders"
                active={activeTab === 'purchase-orders'}
                onClick={() => setActiveTab('purchase-orders')}
              />

              <ToolbarButton
                icon={<FaFolderOpen />}
                label="Purchases"
                active={activeTab === 'purchases'}
                onClick={() => setActiveTab('purchases')}
              />

              <ToolbarButton
                icon={<FaUserPlus />}
                label="New A/C F7"
                active={activeTab === 'accounts'}
                onClick={() => setActiveTab('accounts')}
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
                active={activeTab === 'purch-report'}
                onClick={() => setActiveTab('purch-report')}
              />

              <ToolbarButton
                icon={<FaChartBar />}
                label="Sales Report"
                active={activeTab === 'sales-report'}
                onClick={() => setActiveTab('sales-report')}
              />

              <ToolbarButton
                icon={<FaPlusSquare />}
                label="CB Voucher"
                active={activeTab === 'cb-voucher'}
                onClick={() => setActiveTab('cb-voucher')}
              />

              <ToolbarButton
                icon={<FaFileAlt />}
                label="J.Voucher"
                active={activeTab === 'j-voucher'}
                onClick={() => setActiveTab('j-voucher')}
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
            activeTab === 'sales-orders' || activeTab === 'accounts' || activeTab === 'quotation' || activeTab === 'purchase-orders' || activeTab === 'pick-slip-report'
              ? '100vh'
              : 'calc(100vh - 118px)',
          overflow: 'hidden',
          background: '#d6dbe2',
          position: 'relative'
        }}
      >
        {activeTab === 'sales-orders' ? (
          <SalesOrderView
            onExit={() => setActiveTab('home')}
            onCreateBill={handleCreateBill}
          />
        ) : (
          <>
            {activeTab === 'home' && renderHome()}

            {activeTab === 'accounts' && (
              <AccountView onExit={() => setActiveTab('home')} />
            )}

            {activeTab === 'customers' && (
              <CustomerView />
            )}

            {activeTab === 'parts' && (
              <PartView />
            )}

            {activeTab === 'brand-master' && (
              <BrandMaster />
            )}
            {activeTab === 'model-master' && (
              <ModelMaster onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'wholesale' && (
              <SalesInvoiceView
                type="Whole-Sale"
                onExit={() => setActiveTab('home')}
                prefilledData={prefilledData}
                onClearPrefilled={() => setPrefilledData(null)}
              />
            )}
            {activeTab === 'retail' && (
              <SalesInvoiceView
                type="Retail Bill"
                onExit={() => setActiveTab('home')}
                prefilledData={prefilledData}
                onClearPrefilled={() => setPrefilledData(null)}
              />
            )}
            {activeTab === 'purchases' && (
              <PurchaseInvoiceView onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'cb-voucher' && (
              <VoucherView type="Cash/Bank" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'j-voucher' && (
              <VoucherView type="Journal" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'purch-report' && (
              <ReportView title="Purchase Report" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'sales-report' && (
              <ReportView title="Sales Report" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'hsn-master' && (
              <HSNMaster onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'quotation' && (
              <QuotationView onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'purchase-orders' && (
              <PurchaseOrderView onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'stock-report' && (
              <ReportView title="Stock Report" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'ledger-report' && (
              <ReportView title="Ledger Report" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'pick-slip-report' && (
              <SalesOrderView
                onExit={() => setActiveTab('home')}
                reportMode={true}
                onCreateBill={handleCreateBill}
              />
            )}
            {activeTab === 'account-query' && (
              <QueryView title="Account Query" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'stock-query' && (
              <QueryView title="Stock Query" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'company-setup' && (
              <SetupView title="Company Setup" onExit={() => setActiveTab('home')} />
            )}
            {activeTab === 'user-permissions' && (
              <SetupView title="User Permissions" onExit={() => setActiveTab('home')} />
            )}
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
        background: active
          ? '#e8f0ff'
          : '#f4f5f7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        cursor: 'pointer',
        color: danger
          ? '#e11d48'
          : '#1d2f5c',
        fontSize: '12px',
        borderRadius: '6px',
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.08)'
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