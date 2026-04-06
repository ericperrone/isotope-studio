package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Set;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class MatrixTools extends Query {
	private Hashtable<String, Integer> tables;
	private String outFile = "\\dev\\matrici\\matrici.sql";
	private FileWriter writer = null;
	
	public MatrixTools() {
		super();
		initTables();
	}
	
	private void initTables() {
		tables = new Hashtable<String, Integer>();
		tables.put("waters", 3);
		tables.put("minerals", 2);
		tables.put("ores", 3);
		tables.put("igneousrock", 7);
		tables.put("sedimentary", 7);
		tables.put("soils", 2);
		tables.put("metamorphic", 7);
		tables.put("planetary", 7);
		tables.put("artificial", 4);
		tables.put("cryptograms", 4);
		tables.put("phanerograms", 6);
	}
	
	private void run() throws IOException {
		Connection con = null;
		try {
			openFile();
			writer = new FileWriter(outFile);
			int base = 0;
			con = cm.createConnection();
			Set<String> keys = tables.keySet();
			Iterator<String> it = keys.iterator();
			while(it.hasNext()) {
				String key = it.next();
				processTable(key, tables.get(key), base, con);
				base += 10000;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			cm.closeConnection();
			writer.close();
		}
	}
	
	private void processTable(String inputTable, Integer cols, int base, Connection con) throws Exception {
		String tQuery = "select * from " + inputTable;
		PreparedStatement ps = null;
		ResultSet rs = null;
		String insertBase = "insert into matrix (matrix, nodeid, parent_nodeid) values (";
		try {
			ps = con.prepareStatement(tQuery);
			rs = ps.executeQuery();
			Hashtable<String, Integer> index = new Hashtable<String, Integer>();
			while (rs.next()) {
				String previous = null;
				for (int i = 0; i < cols; i++) {
					String value = rs.getString(i + 1);					
					if (value == null || value.length() == 0) 
						break;
					if (!index.containsKey(value)) {
						String insert = "";
						index.put(value, ++base);
						if (previous == null) {
							insert += "\'" + value + "\', " + base + ", NULL);";
							System.out.println(insertBase + insert);
							writer.write(insertBase + insert + "\n");
							previous = value;
						} else {
							Integer parent = index.get(previous);
							insert += "\'" + value + "\', " + base + ", " + parent + ");";
							previous = value;
							System.out.println(insertBase + insert);
							writer.write(insertBase + insert + "\n");
						}
					} else {
						previous = value;
					}
				}
			}
		} catch (Exception e) {
			throw e;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}
	
	public void openFile() throws Exception {
		new File(outFile);
	}
	
	public static void main(String[] args) {
		MatrixTools mt = new MatrixTools();
		try {
			mt.run();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
