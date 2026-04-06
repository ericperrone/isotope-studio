package it.cnr.igg.sheetx.csv;

import org.apache.commons.csv.*;
import java.io.*;
import java.util.*;
import it.cnr.igg.sheetx.exceptions.SheetxException;

public class Csv {
	private File csvData = null;
	private ArrayList<ArrayList<String>> content = null;
	private char recordSeparator = ',';

	public Csv(String filePath) {
		csvData = new File(filePath);
		if (filePath.toLowerCase().endsWith(".tab"))
			recordSeparator = '\t';
	}

	public Csv(String filePath, char delimiter) {
		csvData = new File(filePath);
		recordSeparator = delimiter;
	}

	
	public ArrayList<ArrayList<String>> getContent() throws Exception {
		content = new ArrayList<ArrayList<String>>();
		InputStreamReader isr = null;
		CSVParser parser = null;
		char delimiter = recordSeparator;
		try {
			isr = new InputStreamReader(new FileInputStream(csvData), "ISO-8859-1");
			parser = new CSVParser(isr, CSVFormat.Builder.create().setQuote(null).setDelimiter(delimiter).build());
			List<CSVRecord> records = null;
			try {
				records = parser.getRecords();
			} catch (Exception x) {
				try {
					parser.close();
					isr.close();
					isr = new FileReader(csvData);
					delimiter = ',';
					parser = new CSVParser(isr,
							CSVFormat.Builder.create().setQuote(null).setDelimiter(delimiter).build());
					records = parser.getRecords();
				} catch (Exception e) {
					try {
						parser.close();
						isr.close();
						isr = new FileReader(csvData);
						delimiter = ';';
						parser = new CSVParser(isr,
								CSVFormat.Builder.create().setQuote(null).setDelimiter(delimiter).build());
						records = parser.getRecords();
					} catch (Exception ex) {
						ex.printStackTrace();
					}
				}
			}

			for (CSVRecord r : records) {
				ArrayList<String> row = new ArrayList<String>();
				Iterator<String> i = r.iterator();
				while (i.hasNext()) {
					String next = i.next().toString();
					next = next.replaceAll("\\\"", "");
					row.add(next);
				}
				content.add(row);
			}
			return content;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw ex;
		} finally {
			if (parser != null) {
				parser.close();
			}
			if (isr != null)
				isr.close();
		}
	}

	public static void main(String[] args) {
		Csv csv = new Csv("\\dev\\test2.csv");
		try {
			InputStreamReader isr = new InputStreamReader(new FileInputStream("\\dev\\2022-06_AVAW2Y_Qin_data.tab"), "ISO-8859-1");
			char[] buffer = new char[1024];
			isr.read(buffer);
			isr.close();
//			ArrayList<ArrayList<String>> content = csv.getContent();
//			for (ArrayList<String> row : content) {
//				for (String col : row) {
//					System.out.print(col + " ");
//				}
//				System.out.println();
//			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
}
