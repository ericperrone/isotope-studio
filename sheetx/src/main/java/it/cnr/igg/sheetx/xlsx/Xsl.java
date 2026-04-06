package it.cnr.igg.sheetx.xlsx;

import java.io.*;
import java.util.*;
import it.cnr.igg.sheetx.exceptions.SheetxException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;


public class Xsl extends Sheetx {
//	private Workbook workBook = null;
//	private ArrayList<String> sheets = null;
//	private ArrayList<ArrayList<String>> content = null;
	
	public Xsl(String filePath) throws SheetxException {
		try {
			readFile(filePath);
		} catch (Exception ex) {
			throw new SheetxException(ex);
		}
	}
	
	public void readFile(String filePath) throws Exception {
		File file = new File(filePath);
		FileInputStream inputStream = null;
		try {
			inputStream = new FileInputStream(file);
			workBook = new HSSFWorkbook(inputStream);
		} catch (IOException ex) {
			ex.printStackTrace();
			throw ex;
		} finally {
			if (inputStream != null)
				inputStream.close();
		}
	}
	
	public ArrayList<String> getSheets() {
		sheets = new ArrayList<String>();
		if (workBook != null) {
			for (Sheet s : workBook) {
				sheets.add(s.getSheetName());
			}
		}
		return sheets;
	}
	
	public ArrayList<ArrayList<String>> getContent(String sheetName) {
		content = new ArrayList<ArrayList<String>>();
		Sheet sheet = workBook.getSheet(sheetName);
		int firstRow = sheet.getFirstRowNum();
		int lastRow = sheet.getLastRowNum();
		for (int index = firstRow; index <= lastRow; index++) {
			Row row = sheet.getRow(index);
			if (row == null)
				continue;
			int limit = row.getLastCellNum();
			ArrayList<String> cellSet = new ArrayList<String>();
			for (int i = 0; i < limit; i++) {
				Cell cell = row.getCell(i);
				String value = "";
				if (cell != null) {
					switch (cell.getCellType()) {
					case STRING:
						value = cell.getStringCellValue();
						break;
					case NUMERIC:
						value = "" + cell.getNumericCellValue();
						break;
					default:
						break;
					}
				}
				cellSet.add(value);

//			Iterator<Cell> cells = row.cellIterator();
//			while (cells.hasNext()) {
//				String value = "";
//				Cell cell = cells.next();
//				switch (cell.getCellType()) {
//				case STRING:
//					value = cell.getStringCellValue();
//					break;
//				case NUMERIC:
//					value = "" + cell.getNumericCellValue();
//					break;
//				default:
//					break;
//				}
//				cellSet.add(value);
			}
			content.add(cellSet);
		}
		return content;
	}
	

}
