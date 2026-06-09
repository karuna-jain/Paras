package com.paras.paras_backend;

import com.paras.paras_backend.model.*;
import com.paras.paras_backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private BrandMasterRepository brandMasterRepository;

    @Autowired
    private ModelRepos modelRepos;

    @Autowired
    private HSNMasterRepository hsnMasterRepository;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountBalanceRepository accountBalanceRepository;

    @Autowired
    private AccountLedgerRepository accountLedgerRepository;

    @Autowired
    private SaleBillRepository saleBillRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private CbVoucherRepository cbVoucherRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- Starting Data Seeding ---");

        // 1. Seed Brands
        if (brandMasterRepository.count() == 0) {
            System.out.println("Seeding Brand Masters...");
            String[][] brandsData = {
                {"HERO", "HERO MOTOCORP", "HR"},
                {"HOND", "HONDA MOTORCYCLES", "HD"},
                {"BAJA", "BAJAJ AUTO", "BJ"},
                {"YAMA", "YAMAHA MOTORS", "YM"},
                {"TVSM", "TVS MOTOR COMPANY", "TVS"}
            };
            for (String[] brand : brandsData) {
                BrandMaster bm = new BrandMaster();
                bm.setHeadCode(brand[0]);
                bm.setHeadName(brand[1]);
                bm.setShortName(brand[2]);
                brandMasterRepository.save(bm);
            }
        }

        // 2. Seed Models
        if (modelRepos.count() == 0) {
            System.out.println("Seeding Model Masters...");
            String[][] modelsData = {
                {"SPLD", "SPLENDOR PLUS"},
                {"ACTV", "ACTIVA 6G"},
                {"PLSR", "PULSAR 150"},
                {"FZ16", "YAMAHA FZ S"},
                {"APCH", "TVS APACHE RTR"}
            };
            for (String[] model : modelsData) {
                ModelMaster mm = new ModelMaster();
                mm.setCode(model[0]);
                mm.setName(model[1]);
                modelRepos.save(mm);
            }
        }

        // 3. Seed HSN
        if (hsnMasterRepository.count() == 0) {
            System.out.println("Seeding HSN Masters...");
            Object[][] hsnData = {
                {"8714", "PARTS AND ACCESSORIES OF MOTORCYCLES", 28.0, 14.0, 14.0, 0.0},
                {"4016", "OTHER ARTICLES OF VULCANIZED RUBBER", 18.0, 9.0, 9.0, 0.0},
                {"2710", "LUBRICATING OILS / MOTOR OILS", 18.0, 9.0, 9.0, 0.0}
            };
            for (Object[] hsn : hsnData) {
                HSNMaster hm = new HSNMaster();
                hm.setHsnCode((String) hsn[0]);
                hm.setDescription((String) hsn[1]);
                hm.setGstRate((Double) hsn[2]);
                hm.setCgstRate((Double) hsn[3]);
                hm.setSgstRate((Double) hsn[4]);
                hm.setIgstRate((Double) hsn[5]);
                hsnMasterRepository.save(hm);
            }
        }

        // 4. Seed Parts (Items)
        if (partRepository.count() == 0) {
            System.out.println("Seeding Parts...");
            Object[][] partsData = {
                {"HERO", "BS-001", "BRAKE SHOE SET - REAR", "SPLENDOR PLUS", "SPLENDOR PLUS, PASSION", "8714", "PARTS OF MOTORCYCLES", "28", 250.0, 120.0, 10.0, 108.0, 180.0, 5.0, 171.0, 220.0, 5.0, 209.0, 50, 10, 100, "PCS", 1, "RACK-A-1", "Standard brake shoe"},
                {"HONDA", "SP-002", "SPARK PLUG - NGK", "ACTIVA 6G", "ACTIVA, DIO, ACCESS", "8714", "PARTS OF MOTORCYCLES", "28", 120.0, 60.0, 12.0, 52.8, 90.0, 5.0, 85.5, 110.0, 5.0, 104.5, 100, 20, 200, "PCS", 1, "RACK-B-3", "Spark Plug NGK"},
                {"BAJAJ", "CL-003", "CLUTCH PLATE SET", "PULSAR 150", "PULSAR 150, DISCOVER", "8714", "PARTS OF MOTORCYCLES", "28", 450.0, 220.0, 15.0, 187.0, 320.0, 10.0, 288.0, 400.0, 5.0, 380.0, 30, 5, 50, "SET", 1, "RACK-C-2", "Original Pulsar Clutch Plate"},
                {"TVSM", "AF-004", "AIR FILTER ELEMENT", "TVS APACHE RTR", "APACHE, JUPITER", "4016", "RUBBER PRODUCTS", "18", 180.0, 80.0, 8.0, 73.6, 130.0, 5.0, 123.5, 160.0, 5.0, 152.0, 40, 8, 80, "PCS", 1, "RACK-D-1", "High filtration air filter"},
                {"YAMA", "EO-005", "ENGINE OIL 4T 10W-30 1L", "YAMAHA FZ S", "UNIVERSAL 4T", "2710", "LUBRICATING OILS", "18", 399.0, 180.0, 10.0, 162.0, 290.0, 5.0, 275.5, 350.0, 5.0, 332.5, 80, 15, 150, "BTL", 1, "OIL-SHELF", "Premium 4T engine oil"}
            };

            for (Object[] partData : partsData) {
                Part p = new Part();
                p.setBrand((String) partData[0]);
                p.setPartNo((String) partData[1]);
                p.setDescription((String) partData[2]);
                p.setModel((String) partData[3]);
                p.setModels((String) partData[4]);
                p.setHsn((String) partData[5]);
                p.setHsnDesc((String) partData[6]);
                p.setGst((String) partData[7]);
                p.setMrp(BigDecimal.valueOf((Double) partData[8]));
                p.setPurchasePrice(BigDecimal.valueOf((Double) partData[9]));
                p.setPurchaseDiscount(BigDecimal.valueOf((Double) partData[10]));
                p.setPurchaseFinal(BigDecimal.valueOf((Double) partData[11]));
                p.setWholesalePrice(BigDecimal.valueOf((Double) partData[12]));
                p.setWholesaleDiscount(BigDecimal.valueOf((Double) partData[13]));
                p.setWholesaleFinal(BigDecimal.valueOf((Double) partData[14]));
                p.setRetailPrice(BigDecimal.valueOf((Double) partData[15]));
                p.setRetailDiscount(BigDecimal.valueOf((Double) partData[16]));
                p.setRetailFinal(BigDecimal.valueOf((Double) partData[17]));
                p.setOpening((Integer) partData[18]);
                p.setReorder((Integer) partData[19]);
                p.setMaxLvl((Integer) partData[20]);
                p.setItemUnit((String) partData[21]);
                p.setPackOf((Integer) partData[22]);
                p.setLocationI((String) partData[23]);
                p.setRemarks((String) partData[24]);
                partRepository.save(p);
            }
        }

        // 5. Seed Accounts
        if (accountRepository.count() == 0) {
            System.out.println("Seeding Accounts...");
            Object[][] accountsData = {
                {1001, 1, "RAMESH AUTO AGENCY", "12, MAIN ROAD", "SAME", "INDORE", "INDORE", "452001", "MADHYA PRADESH", "Y", "0731", "ROUTE 1", "REGULAR", "2441122", "2441133", "RAMESH PATEL", "9826012345", "9826012345", "DELIVERY CO", "ramesh@example.com", "W", "SBI", "GANDHI NAGAR", "1234567890", "SBIN0001234", "23AAAAA1111A1Z1", 30, "REGISTERED", "01-04-2026", 5000.0, 5000.0},
                {1002, 1, "VIJAY AUTOMOBILES", "45, BUS STAND ROAD", "SAME", "KHIRKIYA", "HARDA", "461228", "MADHYA PRADESH", "Y", "07571", "ROUTE 2", "LOCAL", "223344", "223355", "VIJAY SHARMA", "9425098765", "9425098765", "SELF", "vijay@example.com", "R", "HDFC BANK", "KHIRKIYA", "9876543210", "HDFC0000456", "23BBBBB2222B2Z2", 15, "UNREGISTERED", "01-04-2026", 2000.0, 2000.0},
                {2001, 2, "SHREE SHYAM SPARES", "101, SPANISH TOWERS", "SAME", "NEW DELHI", "DELHI", "110001", "DELHI", "N", "011", "ROUTE 3", "OUTSTATION", "4567890", "4567891", "SHYAM SUNDAR", "9810011223", "9810011223", "SAFE EXPRESS", "shyam@example.com", "W", "ICICI BANK", "CONNAUGHT PLACE", "111222333444", "ICIC0000111", "07CCCCC3333C3Z3", 45, "REGISTERED", "01-04-2026", -15000.0, -15000.0},
                {3001, 3, "CASH IN HAND", "SHOP NO 5, APMC MARKET", "SAME", "KHIRKIYA", "HARDA", "461228", "MADHYA PRADESH", "Y", "07571", "LOCAL", "LOCAL", "", "", "MANAGER", "", "", "", "", "R", "", "", "", "", "", 0, "CONSUMER", "01-04-2026", 12500.0, 12500.0},
                {3002, 3, "STATE BANK OF INDIA - A/C 9901", "MAIN ROAD BRANCH", "SAME", "KHIRKIYA", "HARDA", "461228", "MADHYA PRADESH", "Y", "07571", "BANK", "BANK", "", "", "BRANCH MANAGER", "", "", "", "", "R", "SBI", "KHIRKIYA", "34567890123", "SBIN0003014", "", 0, "BANK", "01-04-2026", 145000.0, 145000.0}
            };

            for (Object[] acc : accountsData) {
                Account a = new Account();
                a.setAcCode((Integer) acc[0]);
                a.setHeadCode((Integer) acc[1]);
                a.setName((String) acc[2]);
                a.setAddressOff((String) acc[3]);
                a.setAddressRes((String) acc[4]);
                a.setCity((String) acc[5]);
                a.setDist((String) acc[6]);
                a.setPinCode((String) acc[7]);
                a.setState((String) acc[8]);
                a.setInState((String) acc[9]);
                a.setStdCode((String) acc[10]);
                a.setTrackRoute((String) acc[11]);
                a.setTrackType((String) acc[12]);
                a.setPhO((String) acc[13]);
                a.setPhR((String) acc[14]);
                a.setContactPerson((String) acc[15]);
                a.setMobileNo((String) acc[16]);
                a.setMobileSms((String) acc[17]);
                a.setTransport((String) acc[18]);
                a.setEmailId((String) acc[19]);
                a.setRateType((String) acc[20]);
                a.setBankName((String) acc[21]);
                a.setBranchName((String) acc[22]);
                a.setBankAcNo((String) acc[23]);
                a.setIfsc((String) acc[24]);
                a.setGstin((String) acc[25]);
                a.setCrLimitDays((Integer) acc[26]);
                a.setGstCatg((String) acc[27]);
                a.setAcOpenDate((String) acc[29]);
                a.setOpeningBalance((Double) acc[29]);
                a.setBalance((Double) acc[30]);
                accountRepository.save(a);
            }
        }

        // 6. Seed Customers
        if (customerRepository.count() == 0) {
            System.out.println("Seeding Customers...");
            String[][] customersData = {
                {"ANIL KUMAR", "9988776655", "KHIRKIYA SECTOR 2"},
                {"SUNIL VERMA", "9876543219", "HARDA BYPASS ROAD"},
                {"GOPAL PATIDAR", "9424011223", "PIPLIYA VILLAGE"}
            };
            for (String[] cust : customersData) {
                Customer c = new Customer();
                c.setName(cust[0]);
                c.setPhone(cust[1]);
                c.setAddress(cust[2]);
                customerRepository.save(c);
            }
        }

        // 7. Seed Account Balance
        if (accountBalanceRepository.count() == 0) {
            System.out.println("Seeding Account Balances...");
            List<Account> accounts = accountRepository.findAll();
            for (Account acc : accounts) {
                AccountBalance ab = new AccountBalance();
                ab.setAcId(acc.getId());
                ab.setAcCode(String.valueOf(acc.getAcCode()));
                ab.setAmount(Math.abs(acc.getBalance()));
                ab.setDc(acc.getBalance() >= 0 ? "D" : "C");
                ab.setDate("01-04-2026");
                accountBalanceRepository.save(ab);
            }
        }

        // 8. Seed Sale Bills (Invoices)
        if (saleBillRepository.count() == 0) {
            System.out.println("Seeding Sale Bills...");
            SaleBill bill = new SaleBill();
            bill.setBillNo("SB-2026-001");
            bill.setBillDate("05-05-2026");
            bill.setDayName("TUESDAY");
            bill.setType("CREDIT");
            bill.setChangeYn("N");
            bill.setAcNo("1001");
            bill.setPartyName("RAMESH AUTO AGENCY");
            bill.setAddress("12, MAIN ROAD");
            bill.setCity("INDORE");
            bill.setGstin("23AAAAA1111A1Z1");
            bill.setInState("Y");
            bill.setState("MADHYA PRADESH");
            bill.setCode("23");
            bill.setRemarks("Seeded test bill");
            bill.setRateFormat("W");
            bill.setPrintCopies(1);
            bill.setPrintDisc("Y");
            bill.setTransporter("DELIVERY CO");
            bill.setGrNo("GR100234");
            bill.setGrDate("05-05-2026");
            bill.setCaseNo("1");
            bill.setPvtMarka("R-IND");
            bill.setEwayBillNo("EWAY889922");
            bill.setSaleAmt(540.0);
            bill.setCgst(75.6);
            bill.setSgst(75.6);
            bill.setIgst(0.0);
            bill.setPostage(0.0);
            bill.setFreight(20.0);
            bill.setHammali(10.0);
            bill.setNetAmt(721.2);

            List<SaleBillItem> items = new ArrayList<>();
            
            SaleBillItem item1 = new SaleBillItem();
            item1.setBill(bill);
            item1.setBrand("HERO");
            item1.setPartNo("BS-001");
            item1.setDescription("BRAKE SHOE SET - REAR");
            item1.setStock(50);
            item1.setModel("SPLENDOR PLUS");
            item1.setQty(2.0);
            item1.setListPrice(180.0);
            item1.setDiscount(5.0);
            item1.setRate(171.0);
            item1.setAmount(342.0);
            item1.setNPur(108.0);
            item1.setHsn("8714");
            item1.setGstPercent(28.0);
            items.add(item1);

            SaleBillItem item2 = new SaleBillItem();
            item2.setBill(bill);
            item2.setBrand("HONDA");
            item2.setPartNo("SP-002");
            item2.setDescription("SPARK PLUG - NGK");
            item2.setStock(100);
            item2.setModel("ACTIVA 6G");
            item2.setQty(2.0);
            item2.setListPrice(90.0);
            item2.setDiscount(5.0);
            item2.setRate(85.5);
            item2.setAmount(171.0);
            item2.setNPur(52.8);
            item2.setHsn("8714");
            item2.setGstPercent(28.0);
            items.add(item2);

            bill.setItems(items);
            saleBillRepository.save(bill);

            // Add corresponding ledger entry
            AccountLedger ledger = new AccountLedger();
            ledger.setAcId(1L); // Ramesh Auto Agency
            ledger.setAcCode("1001");
            ledger.setAmount(721.2);
            ledger.setDc("D");
            ledger.setNarration("To Sales Invoice SB-2026-001");
            ledger.setDocNo("SB-2026-001");
            ledger.setSource("SAL[Prt]");
            ledger.setDate("05-05-2026");
            accountLedgerRepository.save(ledger);
        }

        // 9. Seed Purchases
        if (purchaseRepository.count() == 0) {
            System.out.println("Seeding Purchases...");
            Purchase purchase = new Purchase();
            purchase.setBillNo("PI-2026-104");
            purchase.setBillDate("01-05-2026");
            purchase.setType("CREDIT");
            purchase.setChangeYn("N");
            purchase.setSupplierCode("2001");
            purchase.setSupplierName("SHREE SHYAM SPARES");
            purchase.setAddress("101, SPANISH TOWERS");
            purchase.setCity("NEW DELHI");
            purchase.setTotalAmount(1800.0);
            purchase.setCgst(0.0);
            purchase.setSgst(0.0);
            purchase.setIgst(378.0); // 21% average or 18/28%
            purchase.setNetAmount(2178.0);

            List<PurchaseItem> pItems = new ArrayList<>();
            PurchaseItem pi1 = new PurchaseItem();
            pi1.setPurchase(purchase);
            pi1.setBrand("BAJAJ");
            pi1.setPartNo("CL-003");
            pi1.setDescription("CLUTCH PLATE SET");
            pi1.setModel("PULSAR 150");
            pi1.setQty(5.0);
            pi1.setPurchaseRate(220.0);
            pi1.setAmount(1100.0);
            pi1.setHsn("8714");
            pi1.setGstPercent(28.0);
            pItems.add(pi1);

            PurchaseItem pi2 = new PurchaseItem();
            pi2.setPurchase(purchase);
            pi2.setBrand("TVSM");
            pi2.setPartNo("AF-004");
            pi2.setDescription("AIR FILTER ELEMENT");
            pi2.setModel("TVS APACHE RTR");
            pi2.setQty(5.0);
            pi2.setPurchaseRate(80.0);
            pi2.setAmount(400.0);
            pi2.setHsn("4016");
            pi2.setGstPercent(18.0);
            pItems.add(pi2);

            purchase.setItems(pItems);
            purchaseRepository.save(purchase);

            // Add corresponding ledger entry
            AccountLedger ledger = new AccountLedger();
            ledger.setAcId(3L); // Shree Shyam Spares
            ledger.setAcCode("2001");
            ledger.setAmount(2178.0);
            ledger.setDc("C");
            ledger.setNarration("By Purchase Invoice PI-2026-104");
            ledger.setDocNo("PI-2026-104");
            ledger.setSource("PUR");
            ledger.setDate("01-05-2026");
            accountLedgerRepository.save(ledger);
        }

        // 10. Seed CB Vouchers (Cash/Bank Vouchers)
        if (cbVoucherRepository.count() == 0) {
            System.out.println("Seeding Cash/Bank Vouchers...");
            CbVoucher voucher = new CbVoucher();
            voucher.setVoucherNo("CBV-2026-001");
            voucher.setVoucherDate("06-05-2026");
            voucher.setTotalDr(500.0);
            voucher.setTotalCr(500.0);

            List<CbVoucherLine> lines = new ArrayList<>();
            CbVoucherLine line1 = new CbVoucherLine();
            line1.setVoucher(voucher);
            line1.setAcId(1L); // Ramesh Auto
            line1.setAcCode("1001");
            line1.setAcName("RAMESH AUTO AGENCY");
            line1.setDrCr("CR");
            line1.setAmount(500.0);
            line1.setNarration("Cash Received against bill");
            lines.add(line1);

            CbVoucherLine line2 = new CbVoucherLine();
            line2.setVoucher(voucher);
            line2.setAcId(4L); // Cash In Hand (acCode 3001)
            line2.setAcCode("3001");
            line2.setAcName("CASH IN HAND");
            line2.setDrCr("DR");
            line2.setAmount(500.0);
            line2.setNarration("Cash Received from Ramesh Auto");
            lines.add(line2);

            voucher.setLines(lines);
            cbVoucherRepository.save(voucher);

            // Add corresponding ledger entries
            AccountLedger ledger1 = new AccountLedger();
            ledger1.setAcId(1L);
            ledger1.setAcCode("1001");
            ledger1.setAmount(500.0);
            ledger1.setDc("C");
            ledger1.setNarration("To Cash Received");
            ledger1.setDocNo("CBV-2026-001");
            ledger1.setSource("CASH");
            ledger1.setDate("06-05-2026");
            accountLedgerRepository.save(ledger1);

            AccountLedger ledger2 = new AccountLedger();
            ledger2.setAcId(4L);
            ledger2.setAcCode("3001");
            ledger2.setAmount(500.0);
            ledger2.setDc("D");
            ledger2.setNarration("By Cash Received from Ramesh Auto");
            ledger2.setDocNo("CBV-2026-001");
            ledger2.setSource("CASH");
            ledger2.setDate("06-05-2026");
            accountLedgerRepository.save(ledger2);
        }

        System.out.println("--- Data Seeding Completed ---");
    }
}
