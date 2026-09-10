import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.ResultSetMetaData;

public class query_db {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:file:/Users/karunajain/paras/paras-backend/data/paras_db";
        try (Connection conn = DriverManager.getConnection(url, "sa", "password");
             Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery("SELECT * FROM sales_invoices ORDER BY id DESC LIMIT 2");
            ResultSetMetaData rsmd = rs.getMetaData();
            while (rs.next()) {
                System.out.println("ID: " + rs.getString("id") + " Party: " + rs.getString("party_cd") + " Name: " + rs.getString("customer_name") + " Amount: " + rs.getString("amount"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
