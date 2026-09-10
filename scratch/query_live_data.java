import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class query_live_data {
    public static void main(String[] args) {
        String url = "jdbc:h2:file:/Users/karunajain/paras/paras-backend/data/paras_db;AUTO_SERVER=TRUE";
        String user = "sa";
        String password = "password";

        try {
            Class.forName("org.h2.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("H2 Driver not found: " + e.getMessage());
            return;
        }

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("--- LIVE DATABASE ANALYSIS REPORT ---\n");

            // 1. Sales summary
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*), SUM(sale_amt), SUM(net_amt) FROM sale_bill")) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    double gross = rs.getDouble(2);
                    double net = rs.getDouble(3);
                    System.out.printf("SALES SUMMARY:\n  Total Sales Invoices: %d\n  Gross Sales Amount: ₹%.2f\n  Net Sales Amount (incl. Tax/Freight): ₹%.2f\n\n", count, gross, net);
                }
            } catch (Exception e) {
                System.err.println("Error querying sale_bill: " + e.getMessage());
            }

            // 2. Purchase summary
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*), SUM(total_amount), SUM(net_amount) FROM purchase")) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    double gross = rs.getDouble(2);
                    double net = rs.getDouble(3);
                    System.out.printf("PURCHASE SUMMARY:\n  Total Purchase Orders: %d\n  Gross Purchase Amount: ₹%.2f\n  Net Purchase Amount (incl. Tax): ₹%.2f\n\n", count, gross, net);
                }
            } catch (Exception e) {
                System.err.println("Error querying purchase: " + e.getMessage());
            }

            // 3. Parts Master summary
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM part")) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    System.out.printf("PARTS CATALOG SUMMARY:\n  Total Parts in Master: %d\n\n", count);
                }
            } catch (Exception e) {
                System.err.println("Error querying part: " + e.getMessage());
            }

            // 4. Accounts summary
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*), SUM(CASE WHEN head_code = 1 THEN 1 ELSE 0 END), SUM(CASE WHEN head_code = 2 THEN 1 ELSE 0 END) FROM accounts")) {
                if (rs.next()) {
                    int total = rs.getInt(1);
                    int customers = rs.getInt(2);
                    int suppliers = rs.getInt(3);
                    System.out.printf("ACCOUNTS MASTER SUMMARY:\n  Total Accounts: %d\n  Customer Accounts (Debtors): %d\n  Supplier Accounts (Creditors): %d\n\n", total, customers, suppliers);
                }
            } catch (Exception e) {
                System.err.println("Error querying accounts: " + e.getMessage());
            }

            // 5. List of Sales
            System.out.println("LIVE SALES INVOICES LIST:");
            try (ResultSet rs = stmt.executeQuery("SELECT bill_no, bill_date, party_name, net_amt FROM sale_bill ORDER BY bill_date DESC")) {
                int index = 1;
                while (rs.next()) {
                    System.out.printf("  %d. Invoice: %s | Date: %s | Party: %s | Net: ₹%.2f\n",
                            index++, rs.getString("bill_no"), rs.getString("bill_date"), rs.getString("party_name"), rs.getDouble("net_amt"));
                }
                if (index == 1) {
                    System.out.println("  No sales records found.");
                }
            } catch (Exception e) {
                System.err.println("Error listing sales: " + e.getMessage());
            }
            System.out.println();

            // 6. List of Purchases
            System.out.println("LIVE PURCHASE INVOICES LIST:");
            try (ResultSet rs = stmt.executeQuery("SELECT bill_no, bill_date, supplier_name, net_amount FROM purchase ORDER BY bill_date DESC")) {
                int index = 1;
                while (rs.next()) {
                    System.out.printf("  %d. Invoice: %s | Date: %s | Supplier: %s | Net: ₹%.2f\n",
                            index++, rs.getString("bill_no"), rs.getString("bill_date"), rs.getString("supplier_name"), rs.getDouble("net_amount"));
                }
                if (index == 1) {
                    System.out.println("  No purchase records found.");
                }
            } catch (Exception e) {
                System.err.println("Error listing purchases: " + e.getMessage());
            }
            System.out.println();

            // 7. Whatsapp orders summary
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM whatsapp_message")) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    System.out.printf("WHATSAPP INTEGRATION SUMMARY:\n  Total WhatsApp Orders Processed/Pending: %d\n\n", count);
                }
            } catch (Exception e) {
                // Table might not exist or be named differently, catch silently
            }

        } catch (Exception e) {
            System.err.println("Database connection error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
