package it.cnr.igg.sheetx.xlsx;

import java.io.*;
import java.util.*;
import it.cnr.igg.sheetx.exceptions.SheetxException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

class HeaderPosition {
	public String headerName;
	public int column;
	public int row;
}

public class Xlsx extends Sheetx {
//	private Workbook workBook = null;
//	private ArrayList<String> sheets = null;
	private ArrayList<String> samples = null;
	private ArrayList<HeaderPosition> hp = null;
//	private ArrayList<ArrayList<String>> content = null;
	private ArrayList<String> samplesMetadata = null;

	public Xlsx(String filePath) throws SheetxException {
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
			workBook = new XSSFWorkbook(inputStream);
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

	public ArrayList<String> buildSamplesMetadada() {
		if (hp != null && content != null) {
			samplesMetadata = new ArrayList<String>();
			int contentSize = content.size();
			int startRow = 1 + hp.get(0).row;
			for (int i = startRow; i < contentSize; i++) {
				ArrayList<String> row = content.get(i);
				if (row != null) {
					String meta = "{";
					for (HeaderPosition h : hp) {
						if (i == 2301) {
							int n = 1;
						}
						try {
							String cell = row.get(h.column);
							if (cell != null) {
								meta += "\"" + h.headerName + "\":";
								meta += "\"" + cell + "\";";
							}
						} catch (IndexOutOfBoundsException ex) {
							// do nothing
						}
					}
					meta += "}";
					if (!meta.equals("{}"))
						samplesMetadata.add(meta);
				}
			}
		}
		return samplesMetadata;
	}

	public void locateHeader(ArrayList<String> headerNames) {
		hp = new ArrayList<HeaderPosition>();
		if (content != null) {
			int contentSize = content.size();
			int headerIndex = 0;
			for (int i = 0, score = 0; i < contentSize; i++) {
				ArrayList<String> riga = content.get(i);
				for (int j = 0; j < riga.size(); j++) {
					if (score == headerNames.size())
						break;
					for (String h : headerNames) {
						if (h.equalsIgnoreCase(riga.get(j))) {
							score++;
							break;
						}
					}
				}
				if (score == headerNames.size()) {
					headerIndex = i;
					break;
				}
			}

			ArrayList<String> headerRow = content.get(headerIndex);
			for (int i = 0; i < headerRow.size(); i++) {
				String cell = headerRow.get(i);
				if (cell != null) {
					for (String h : headerNames) {
						if (cell.equalsIgnoreCase(h)) {
							HeaderPosition pos = new HeaderPosition();
							pos.headerName = h;
							pos.column = i;
							pos.row = headerIndex;
							hp.add(pos);
						}
					}
				}
			}
		}
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
			}
			content.add(cellSet);
		}
		return content;
	}

	public ArrayList<String> getHeader() {
		ArrayList<String> header = null;
		if (content != null) {
			int contentSize = content.size();
			int limit = contentSize < 10 ? contentSize : 10;
			int maxCounter = 0;
			for (int i = 0; i < limit; i++) {
				ArrayList<String> riga = content.get(i);
				int counter = 0;
				for (String r : riga) {
					if (r == null)
						continue;
					counter++;
				}
				if (counter > maxCounter) {
					maxCounter = counter;
					header = riga;
				}

			}
		}
		return header;
	}

}
