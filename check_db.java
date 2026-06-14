import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.ResultSetMetaData;

public class check_db {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:file:/Users/karunajain/paras/paras-backend/data/paras_db";
        try (Connection conn = DriverManager.getConnection(url, "sa", "password");
             Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery("SELECT * FROM sales_invoices LIMIT 1");
            ResultSetMetaData rsmd = rs.getMetaData();
            for (int i = 1; i <= rsmd.getColumnCount(); i++) {
                System.out.println(rsmd.getColumnName(i));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
