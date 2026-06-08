import { useState, useEffect } from 'react';
import { getPickSlips, updatePickSlipInvNo, getAccounts, getLedgerQuery, getLedgerOpening } from './api';
import { FaFileAlt } from 'react-icons/fa';
import AccountView from './AccountView';
import PickSlipPrintView from './PickSlipPrintView';

export default function PickSlipList({ onExit, onCreateBill }) {
  // Dialog flow: 'party_dialog' -> 'options_dialog' -> 'list'
  const [flowStep, setFlowStep] = useState('party_dialog');
  const [partyType, setPartyType] = useState('ALL'); // 'ALL' or 'PARTICULAR'
  
  const [partyCd, setPartyCd] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyCity, setPartyCity] = useState('');
  
  const [reportOption, setReportOption] = useState('TODAY'); // TODAY, PERIOD, YESTERDAY, ALL
  
  const [pickSlips, setPickSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');

  // Modals inside list
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerTxs, setLedgerTxs] = useState([]);
  const [ledgerBal, setLedgerBal] = useState(0);

  // Printing Pick-Slip states
  const [showPrintOption, setShowPrintOption] = useState(false);
  const [printWithSRate, setPrintWithSRate] = useState(true);
  const [showPrintView, setShowPrintView] = useState(false);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  useEffect(() => {
    if (showLedgerModal && selectedIndex !== null) {
      const party = pickSlips[selectedIndex].partyCd;
      getLedgerQuery(party).then(setLedgerTxs).catch(console.error);
      getLedgerOpening(party).then(data => setLedgerBal(data.amount || 0)).catch(console.error);
    }
  }, [showLedgerModal, selectedIndex]);

  const handlePartyConfirm = () => {
    if (partyType === 'PARTICULAR' && !partyCd) {
      alert("Please select a party first");
      return;
    }
    setFlowStep('options_dialog');
  };

  const loadPickSlips = async () => {
    setLoading(true);
    try {
      const codeParam = partyType === 'ALL' ? 'ALL' : partyCd;
      const data = await getPickSlips(reportOption, codeParam);
      setPickSlips(data);
      setFlowStep('list');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = () => {
    if (selectedIndex === null) {
      alert('Selected pick slip required');
      return;
    }
    const order = pickSlips[selectedIndex];
    if (order.billed) {
      alert('This pick-slip is already billed');
      return;
    }

    if (onCreateBill) {
      onCreateBill({
        ...order,
        fromOrderId: order.id,
        amount: order.amount,
        items: order.items.map(i => ({
          ...i,
          qty: i.pickQty !== undefined ? i.pickQty : i.qty,
          rate: i.rate || i.list || 0,
          discount: i.discountPercent || i.discount || 0,
          amount: (i.pickQty !== undefined ? i.pickQty : i.qty) * (i.netSale || i.rate || 0)
        }))
      });
    }
  };

  const filteredAccounts = accounts.filter(a =>
    (a.acName || a.name || '').toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.acCode || '').toString().includes(accountSearch)
  );

  const selectAccount = (acc) => {
    setPartyCd(acc.acCode?.toString() || '');
    setPartyName(acc.acName || acc.name || '');
    setPartyCity(acc.city || '');
    setShowAccountModal(false);
  };

  const totalAmountSum = pickSlips.reduce((s, o) => s + (o.amount || 0), 0);

  // Styling rules
  const boxStyle = {
    background: '#b8d4f0',
    border: '2px solid #5a8aaa',
    padding: '15px',
    boxShadow: '3px 3px 6px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '320px',
    fontFamily: 'Tahoma,sans-serif',
    fontSize: '11px',
    color: '#1d2d5a',
  };

  const btnStyle = (extra = {}) => ({
    background: '#e8e8e8',
    color: '#1d2d5a',
    border: '1px solid #999',
    height: '28px',
    padding: '4px 12px',
    borderRadius: 0,
    fontFamily: 'Tahoma, Verdana, sans-serif',
    fontWeight: 'bold',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...extra
  });

  const labelStyle = { fontWeight: 'bold' };

  if (showPrintView && selectedIndex !== null) {
    const slip = pickSlips[selectedIndex];
    return (
      <PickSlipPrintView
        formData={{
          customerName: slip.customerName,
          address: slip.address,
          city: slip.city,
          partyCd: slip.partyCd,
          orderDate: slip.orderDate,
          phone: slip.phoneO || slip.cellNo,
          transport: slip.transport,
          remarks: slip.remarks
        }}
        items={slip.items.map(i => ({
          brand: i.brand,
          partNo: i.partNo,
          qty: i.pickQty !== undefined ? i.pickQty : i.qty,
          description: i.description,
          model: i.model,
          rate: i.rate,
          amount: i.amount
        }))}
        totalAmount={slip.amount}
        onBack={() => setShowPrintView(false)}
        onCreateBill={onCreateBill}
        fromOrderId={slip.id}
      />
    );
  }

  // Dialog 1: Party selection
  if (flowStep === 'party_dialog') {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#dfe8ef', alignItems: 'center', justifyContent: 'center' }}>
        <div style={boxStyle}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #5a8aaa', paddingBottom: '5px', fontSize: '12px' }}>
            PARTY SELECTION
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input type="radio" checked={partyType === 'ALL'} onChange={() => setPartyType('ALL')} />
            <span>ALL PARTIES</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input type="radio" checked={partyType === 'PARTICULAR'} onChange={() => setPartyType('PARTICULAR')} />
            <span>PARTICULAR PARTY</span>
          </label>
          
          {partyType === 'PARTICULAR' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input readOnly value={partyCd} onClick={() => setShowAccountModal(true)} style={{ height: '22px', border: '1px solid #999', padding: '0 4px', width: '60px' }} placeholder="Code" />
              <input readOnly value={partyName} onClick={() => setShowAccountModal(true)} style={{ height: '22px', border: '1px solid #999', padding: '0 4px', flex: 1 }} placeholder="Select Party..." />
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button onClick={handlePartyConfirm} style={btnStyle()}>CONFIRM</button>
            <button onClick={onExit} style={btnStyle()}>CANCEL</button>
          </div>
        </div>

        {/* Account search modal */}
        {showAccountModal && (
          <div style={overlayStyle}>
            <div style={{ ...modalStyle, width: '600px' }}>
              <div style={modalHeaderStyle}>
                <span>SEARCH ACCOUNT</span>
                <button onClick={() => setShowAccountModal(false)} style={closeXStyle}>✕</button>
              </div>
              <div style={{ padding: '8px 10px', background: '#cfe8ff' }}>
                <input autoFocus value={accountSearch} onChange={e => setAccountSearch(e.target.value)} style={{ height: '22px', border: '1px solid #999', width: '100%', padding: '0 4px', borderRadius: 0 }} placeholder="Search..." />
              </div>
              <div style={{ height: '300px', overflow: 'auto', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {filteredAccounts.map((a, idx) => (
                      <tr key={idx} onClick={() => selectAccount(a)} style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f0f8ff', borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '5px' }}>{a.acName || a.name}</td>
                        <td style={{ padding: '5px' }}>{a.city}</td>
                        <td style={{ padding: '5px', textAlign: 'right' }}>{a.acCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dialog 2: Options
  if (flowStep === 'options_dialog') {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#dfe8ef', alignItems: 'center', justifyContent: 'center' }}>
        <div style={boxStyle}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #5a8aaa', paddingBottom: '5px', fontSize: '12px' }}>
            {partyType === 'ALL' ? '* ALL PARTIES *' : `* ${partyName} *`}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#880000' }}>REPORT OPTIONS</div>
          
          <select value={reportOption} onChange={e => setReportOption(e.target.value)} style={{ height: '24px', border: '1px solid #999', background: 'white', fontSize: '11px', fontWeight: 'bold' }}>
            <option value="TODAY">TODAY PICK-SLIPS</option>
            <option value="PERIOD">PERIOD WISE</option>
            <option value="YESTERDAY">TILL YESTERDAY</option>
            <option value="ALL">ALL PICK-SLIPS</option>
          </select>

          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button onClick={loadPickSlips} style={btnStyle()}>OK</button>
            <button onClick={() => setFlowStep('party_dialog')} style={btnStyle()}>BACK</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#dfe8ef', fontFamily: 'Tahoma,sans-serif', fontSize: '11px', color: '#1d2d5a', overflow: 'hidden' }}>
      
      {/* ── HEADER ── */}
      <div style={{ height: '26px', background: '#eef3f7', borderBottom: '1px solid #9caab7', display: 'flex', alignItems: 'center', paddingLeft: '10px', gap: '40px', flexShrink: 0 }}>
        <span>Pick-Slips (Sales) List</span>
        <span>21-05-2026 (THURSDAY)</span>
        <span>PARAS AUTO PARTS</span>
        <span>(OPER)</span>
      </div>

      {/* ── TOP ACTION BAR ── */}
      <div style={{ background: '#c5dcf0', borderBottom: '2px solid #4a6fa5', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <strong style={{ fontSize: '13px', color: '#003399', marginRight: '20px' }}>
          {partyType === 'ALL' ? '* ALL PARTIES *' : `* PARTICULAR PARTY: ${partyName} *`}
        </strong>

        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          {[
            ['INFO', null],
            ['TOTAL', () => setShowTotalModal(true)],
            ['CREATE BILL', handleCreateBill],
            ['LEDGER', () => { if (selectedIndex !== null) setShowLedgerModal(true); else alert('Select order first'); }],
            ['CALCI', null],
            ['PRINT PICK-SLIP', () => { if (selectedIndex !== null) setShowPrintOption(true); else alert('Select row first'); }],
            ['PRINT LIST', () => window.print()],
          ].map(([lbl, click]) => (
            <button key={lbl} onClick={click || undefined} style={btnStyle()}>{lbl}</button>
          ))}
          <button onClick={() => setFlowStep('options_dialog')} style={btnStyle({ background: '#f4a0a0', color: '#880000', border: '1px solid #aa6666' })}>RETURN</button>
        </div>
      </div>

      {/* ── TABLE AREA ── */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '6px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, border: '1px solid #7a9cbf', overflow: 'auto', background: 'white' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading pick slips...</div>
          ) : pickSlips.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No pick slips found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#c5dcf0' }}>
                <tr>
                  {['PICK-SLIP', 'NAME OF THE PARTY', 'CITY', 'AMOUNT', 'DEL', 'PICK.DATE', 'CODE', 'GP(%)', 'INV.NO.'].map(h => (
                    <th key={h} style={{ padding: '5px 8px', borderRight: '1px solid #9caab7', borderBottom: '2px solid #4a6fa5', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pickSlips.map((o, idx) => (
                  <tr key={idx} onClick={() => setSelectedIndex(idx)} style={{ background: selectedIndex === idx ? '#b8d4f0' : (idx % 2 === 0 ? '#fff' : '#f0f8ff'), cursor: 'pointer' }}>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee', fontWeight: 'bold' }}>{o.id}</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee', fontWeight: 'bold', color: '#003399' }}>{o.customerName}</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}>{o.city}</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee', fontWeight: 'bold', color: '#003399', textAlign: 'right' }}>{o.amount?.toFixed(2)}</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}>—</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}>{o.orderDate}</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}>{o.partyCd}</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #eee', textAlign: 'right' }}>{o.gpPercent ? o.gpPercent.toFixed(1) : '0.0'}%</td>
                    <td style={{ padding: '5px 8px', color: '#cc0000', fontWeight: 'bold' }}>{o.invNo || (o.billed ? 'BILLED' : '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── TOTAL SUM MODAL ── */}
      {showTotalModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '300px' }}>
            <div style={modalHeaderStyle}>
              <span>TOTAL</span>
              <button onClick={() => setShowTotalModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Total Pick-Slips:</span>
                <span>{pickSlips.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Total Amount:</span>
                <span style={{ color: '#003399', fontWeight: 'bold' }}>Rs. {totalAmountSum.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setShowTotalModal(false)} style={btnStyle()}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEDGER MODAL ── */}
      {showLedgerModal && selectedIndex !== null && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '800px', height: '500px' }}>
            <div style={modalHeaderStyle}>
              <span>Ledger Query: {pickSlips[selectedIndex].customerName}</span>
              <button onClick={() => setShowLedgerModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#cfe8ff', padding: '8px', border: '1px solid #999', fontWeight: 'bold' }}>
                <span>Party Code: {pickSlips[selectedIndex].partyCd}</span>
                <span>City: {pickSlips[selectedIndex].city}</span>
                <span style={{ color: '#cc0000' }}>Balance: Rs. {ledgerBal.toFixed(2)}</span>
              </div>
              <div style={{ flex: 1, overflow: 'auto', border: '1px solid #ccc', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ background: '#7fc6ea', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>DATE</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>NARRATION</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>DEBIT</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>CREDIT</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>D/C</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>BALANCE</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>SOURCE</th>
                      <th style={{ padding: '4px' }}>DOC NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#ffe0e0', fontWeight: 'bold', color: '#cc0000' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>01-04-2026</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>* OPENING BALANCE *</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{ledgerBal.toFixed(2)}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}></td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>D</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{ledgerBal.toFixed(2)}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>OPENING</td>
                      <td style={{ padding: '4px' }}>—</td>
                    </tr>
                    {(() => {
                      let bal = ledgerBal;
                      return ledgerTxs.map((tx, idx) => {
                        const amt = tx.amount || 0;
                        if ("D".equalsIgnoreCase(tx.dc)) {
                          bal += amt;
                        } else {
                          bal -= amt;
                        }
                        const isCredit = "C".equalsIgnoreCase(tx.dc);
                        return (
                          <tr key={idx} style={{ background: isCredit ? '#e8f4ff' : '#ffffff', borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>{tx.date}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>{tx.narration}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{!isCredit ? amt.toFixed(2) : ''}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{isCredit ? amt.toFixed(2) : ''}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'center' }}>{tx.dc}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right', fontWeight: 'bold' }}>{bal.toFixed(2)}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>{tx.source}</td>
                            <td style={{ padding: '4px' }}>{tx.docNo}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowLedgerModal(false)} style={btnStyle()}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT PICK SLIP OPTIONS ── */}
      {showPrintOption && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '300px' }}>
            <div style={modalHeaderStyle}>
              <span>PRINT PICK - SLIP</span>
              <button onClick={() => setShowPrintOption(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={printWithSRate} onChange={e => setPrintWithSRate(e.target.checked)} />
                <span>PRINT WITH S.RATE</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowPrintOption(false); setShowPrintView(true); }} style={btnStyle({ background: '#003399', color: 'white' })}>PRINT</button>
                <button onClick={() => setShowPrintOption(false)} style={btnStyle()}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalStyle = { background: 'white', border: '2px solid #1d2d5a', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', fontFamily: 'Tahoma,sans-serif', fontSize: '11px' };
const modalHeaderStyle = { background: '#1d2d5a', color: 'white', padding: '6px 10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeXStyle = { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
