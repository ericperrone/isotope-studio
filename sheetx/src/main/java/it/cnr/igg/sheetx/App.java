package it.cnr.igg.sheetx;

import java.io.*;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import it.cnr.igg.sheetx.csv.Csv;
import it.cnr.igg.sheetx.xlsx.*;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )  {
    	new App().test01bis();
//        new App().readExcel("\\dev\\2022-3-IZSZBL_Lustrino_data.xlsx");
    }
    
    public void test03()  {
    	String[] headers = {
    			"SAMPLE ID", "REFERENCES", "TECTONIC SETTING", "Location", "LATITUDE", "LONGITUDE", 
    			"ROCK NAME", "ANALYZED MATERIAL", "ROCK TYPE" 
    	};
    	
    	List<String> hn = Arrays.asList(headers);
    	ArrayList<String> hhn = new ArrayList<String>(hn);
    	try {
    		Xlsx xls = new Xlsx("\\dev\\2022_09-0SVW6S_Stracke_data.xlsx");
    		ArrayList<ArrayList<String>> content = xls.getContent("Data_MORB");
    		xls.locateHeader(hhn);
    		ArrayList<String> metadata = xls.buildSamplesMetadada();
    	} catch (Exception x) {
    		x.printStackTrace();
    	}
    }
    
    public void test01bis() {
    	try {
    		Xlsx xls = new Xlsx("\\dev\\2022_09-0SVW6S_Stracke_data.xlsx");
    		ArrayList<ArrayList<String>> content = xls.getContent("Data_MORB");
    		for (int i = 2; i < 10; i++) {
    			ArrayList<String> riga = content.get(i);
    			for (String r : riga) {
    				System.out.print(r + ";");
    			}
    			System.out.println();
    		}
    		System.out.println("Header:");
    		ArrayList<String> header = xls.getHeader();
			for (String r : header) {
				System.out.print(" " + r);
			}
    		
    	} catch (Exception x) {
    		x.printStackTrace();
    	}
    }

    public void test01() {
    	try {
    		Xlsx xls = new Xlsx("\\dev\\2022-3-IZSZBL_Lustrino_data.xlsx");
    		ArrayList<ArrayList<String>> content = xls.getContent("Database");
    		for (int i = 0; i < 10; i++) {
    			ArrayList<String> riga = content.get(i);
    			for (String r : riga) {
    				System.out.print(" " + r);
    			}
    			System.out.println();
    		}
    		System.out.println("Header:");
    		ArrayList<String> header = xls.getHeader();
			for (String r : header) {
				System.out.print(" " + r);
			}
    		
    	} catch (Exception x) {
    		x.printStackTrace();
    	}
    }
}
