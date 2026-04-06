package it.cnr.igg.tools;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.BufferedReader;
import java.util.ArrayList;
import java.io.File;

// import org.apache.commons.io.IOUtils;

public class GermGrabber {
	private final String[] Header = { "reservoir", "z", "element", "value", "median", "sd", "low", "high", "n", "unit",
			"info", "reference", "source" };

	private int nCol = Header.length;

	private final String RESERVOIR = ">Reservoir";
	private final String TH = "<th";
	private final String TD = "<td";
	private final String VSTART = ">";
	private final String VEND = "</td>";
	private final String NBSP = "&nbsp;"; 
	private final String IMG = "<img";
	private final String LINKSTART = "<a";
	private final String LINKEND = "</a>";

	public GermGrabber() {

	}

	public static void main(String[] args) {
		String[] files = {
//				"germ.rivers.txt", 
//				"germ.atmosphere.txt",
//				"germ.seawater.txt", 
//				"germ.tanganyka.txt", 
//				"germ.baikal.txt",
//				"germ.caspian.txt", 
//				"germ.deadsea.txt",
//				"germ.amourpart.txt",
//				"germ.bluenilo.txt",
//				"germ.congo.txt",
//				"germ.congopart.txt",
//				"germ.juba.txt",
//				"germ.dnepr.txt",
//				"germ.don.txt",
//				"germ.core.txt",
//				"germ.silicates.txt"
//				"germ.kenya.txt",
//				"germ.mozambique.txt",
//				"germ.niger.txt",
//				"germ.orange.txt",
//				"germ.tanzania.txt",
//				"germ.victoria.txt",
//				"germ.zambezi.txt",
//				"germ.aldan.txt"
//				"germ.brahmaputra.txt",
//				"germ.dvina.txt",
//				"germ.gange.txt",
//				"germ.indus.txt",
//				"germ.irrawaddy.txt",
//				"germ.lena.txt",
//				"germ.mekong.txt"
				"germ.yangtze.txt",
				"germ.yellow.txt"
				};
		for (String f : files) {
			String filePath = File.separator + "dev" + File.separator + "germ" + File.separator + f;
			try {
				new GermGrabber().process(filePath);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	public void process(String filePath) {
		String csv = initCsv();		
		boolean startData = false;
		int counter = 0;
		try {
			ArrayList<String> rows = readFile(filePath);
			String line = "";
			for (String row : rows) {				
				if (row.startsWith(TH) && row.indexOf(RESERVOIR) > 0) {
					startData = true;
					counter = 0;
					line = "";
				}
				if (startData && row.startsWith(TD)) {
					counter ++;
					String value = parseValue(row.substring(row.indexOf(VSTART) + 1, row.indexOf(VEND)));
										
					line += value + ";";
					if (counter == nCol) {
						counter = 0;
						csv += line.substring(0, line.length() - 1) + "\n";
						line = "";
					}
				}
			}
			System.out.println(csv);
			String outPath = filePath + ".csv";
			writeFile(csv, outPath);
			
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}
	
	private String parseValue(String value) {
		String nValue = "";
		if (value.equals(NBSP) || value.indexOf(IMG) >= 0)
			nValue = "";
		else if (value.indexOf(LINKSTART) >= 0) {
			value = value.substring(value.indexOf(LINKSTART) + 1);
			nValue = value.substring(value.indexOf(VSTART) + 1, value.indexOf(LINKEND));
		}			
		else
			nValue = value;
		return nValue;
	}
	
	private String initCsv() {
		String csv = "";
		for (String h : Header) {
			csv += h + ";";
		}
		csv = csv.substring(0, csv.length() - 1);
		csv += "\n";
		return csv;
	}

	private void writeFile(String content, String fileName) throws Exception {
		FileWriter fw = null;
		try {
			fw = new FileWriter(fileName);
			fw.write(content);
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (fw != null)
				fw.close();
		}
	}
	
	private ArrayList<String> readFile(String filePath) throws Exception {
		BufferedReader br = null;
		try {
			ArrayList<String> rows = new ArrayList<String>();
			br = new BufferedReader(new FileReader(filePath));
			String line = "";
			do {
				line = br.readLine();
				if (line != null) {
					rows.add(line);
				}
			} while (line != null);
			return rows;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (br != null)
				br.close();
		}
	}
}
