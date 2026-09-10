import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class test_db {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:file:~/paras/paras-backend/data/paras_db";
        Connection conn = DriverManager.getConnection(url, "sa", "password");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SHOW TABLES");
        while (rs.next()) {
            System.out.println(rs.getString(1));
        }
        conn.close();
    }
}
