const http = require('http');

const fetchData = (path) => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8081${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
};

const runAnalysis = async () => {
  try {
    const [sales, purchases, parts, accounts] = await Promise.all([
      fetchData('/api/sale-bills'),
      fetchData('/api/purchases'),
      fetchData('/api/parts'),
      fetchData('/api/accounts')
    ]);

    console.log("=========================================");
    console.log("   PARAS AUTO PARTS - LIVE API REPORT   ");
    console.log("=========================================");
    console.log(`Report Run Date: ${new Date().toLocaleString()}`);
    console.log();

    // 1. Sales Analysis
    const totalSalesNet = sales.reduce((sum, s) => sum + (s.netAmt || 0), 0);
    const totalSalesGross = sales.reduce((sum, s) => sum + (s.saleAmt || 0), 0);
    const totalSalesTax = sales.reduce((sum, s) => sum + (s.cgst || 0) + (s.sgst || 0) + (s.igst || 0), 0);
    const totalSalesFreight = sales.reduce((sum, s) => sum + (s.freight || 0) + (s.postage || 0) + (s.hammali || 0), 0);

    console.log("1. SALES PERFORMANCE:");
    console.log(`  - Total Invoices Issued: ${sales.length}`);
    console.log(`  - Gross Sales Amount:    ₹${totalSalesGross.toFixed(2)}`);
    console.log(`  - Sales Tax Collected:   ₹${totalSalesTax.toFixed(2)}`);
    console.log(`  - Freight & Charges:     ₹${totalSalesFreight.toFixed(2)}`);
    console.log(`  - Net Cash/Credit Sales:  ₹${totalSalesNet.toFixed(2)}`);
    console.log();

    // 2. Purchase Analysis
    const totalPurchNet = purchases.reduce((sum, p) => sum + (p.netAmount || 0), 0);
    const totalPurchGross = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalPurchTax = purchases.reduce((sum, p) => sum + (p.cgst || 0) + (p.sgst || 0) + (p.igst || 0), 0);

    console.log("2. PURCHASE EXPENDITURES:");
    console.log(`  - Total Supplier Bills:   ${purchases.length}`);
    console.log(`  - Gross Purchase Cost:    ₹${totalPurchGross.toFixed(2)}`);
    console.log(`  - Purchase Tax Paid:      ₹${totalPurchTax.toFixed(2)}`);
    console.log(`  - Net Purchase Cost:      ₹${totalPurchNet.toFixed(2)}`);
    console.log();

    // 3. Profitability Details
    let costOfGoodsSold = 0;
    sales.forEach(s => {
      s.items?.forEach(i => {
        const qty = i.qty || 0;
        const netPurchaseRate = i.nPur || 0;
        costOfGoodsSold += qty * netPurchaseRate;
      });
    });

    const grossProfit = totalSalesGross - costOfGoodsSold;
    const profitMargin = totalSalesGross > 0 ? (grossProfit / totalSalesGross) * 100 : 0;

    console.log("3. PROFITABILITY INDEX:");
    console.log(`  - Cost of Goods Sold (COGS): ₹${costOfGoodsSold.toFixed(2)}`);
    console.log(`  - Realized Gross Profit:     ₹${grossProfit.toFixed(2)}`);
    console.log(`  - Operating Profit Margin:    ${profitMargin.toFixed(2)}%`);
    console.log();

    // 4. Accounts & Balances
    const customers = accounts.filter(a => a.headCode === 1);
    const suppliers = accounts.filter(a => a.headCode === 2);
    
    const totalReceivables = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
    const totalPayables = suppliers.reduce((sum, s) => sum + Math.abs(s.balance || 0), 0);

    console.log("4. BALANCE SHEET OUTSTANDINGS:");
    console.log(`  - Registered Customers:  ${customers.length}`);
    console.log(`  - Registered Suppliers:  ${suppliers.length}`);
    console.log(`  - Accounts Receivable:   ₹${totalReceivables.toFixed(2)}`);
    console.log(`  - Accounts Payable:      ₹${totalPayables.toFixed(2)}`);
    console.log();

    // 5. Parts Catalog Status
    console.log("5. PARTS CATALOG STATUS:");
    console.log(`  - Total Unique Part Nos: ${parts.length}`);
    parts.forEach(p => {
      console.log(`    * Part [${p.partNo}]: ${p.description} (${p.brand}) | Landing Cost: ₹${p.purchaseFinal?.toFixed(2)} | Wholesales: ₹${p.wholesaleFinal?.toFixed(2)}`);
    });
    console.log();

    console.log("=========================================");
  } catch (err) {
    console.error("Error executing live analysis:", err.message);
  }
};

runAnalysis();
