package it.cnr.igg.helper;

import java.util.ArrayList;
import java.util.HashMap;
import java.io.File;
import java.security.MessageDigest;
import it.cnr.igg.sheetx.exceptions.SheetxException;
import it.cnr.igg.sheetx.helper.HexFilter;
import it.cnr.igg.sheetx.xlsx.Sheetx;
import it.cnr.igg.sheetx.xlsx.Xlsx;
import it.cnr.igg.sheetx.xlsx.Xsl;

public class Global {
	public static final int POOL_MAX = 3;
	public static String fileSeparator = File.separator;
	public static String receivedPayLoad = null;
	public static String dataFolder = fileSeparator + "srv" + fileSeparator + "data";
	public static Xlsx xls = null;
	public static HashMap<String, Sheetx> pool = null;

	public static ArrayList<String> contentDir() {
		ArrayList<String> dir = new ArrayList<String>();
		File folder = new File(dataFolder);

		for (final File entry : folder.listFiles()) {
			if (entry.isDirectory())
				continue;
			String name = entry.getName();
			String nameToLower = name.toLowerCase();
			if (nameToLower.endsWith(".xlsx") || nameToLower.endsWith(".csv") || nameToLower.endsWith(".xls")) {
				dir.add(name);
			}
		}
		return dir;
	}

	public static String openXls(String fileName) throws SheetxException {
		try {
			String inKey = fileName + "-" + System.currentTimeMillis();
			MessageDigest md = MessageDigest.getInstance("MD5");
			byte[] b = md.digest(inKey.getBytes());
			String key = HexFilter.toHexFromBytes(b).toString();
			if (pool == null) {
				pool = new HashMap<String, Sheetx>();
			}

			if (pool.containsKey(key)) {
				return key;
			}
			
			if (pool.size() >= POOL_MAX)
				throw new Exception("Max pool size has been reached. Please, wait and retry.");
			pool.put(key, new Xsl(Global.dataFolder + Global.fileSeparator + fileName));
			return key;
			// return pool.get(key);
		} catch (Exception e) {
			throw new SheetxException(e);
		}
	}

	public static String openXlsx(String fileName) throws SheetxException {
		try {
			String inKey = fileName + "-" + System.currentTimeMillis();
			MessageDigest md = MessageDigest.getInstance("MD5");
			byte[] b = md.digest(inKey.getBytes());
			String key = HexFilter.toHexFromBytes(b).toString();
			if (pool == null) {
				pool = new HashMap<String, Sheetx>();
			}

			if (pool.containsKey(key)) {
				return key;
			}

			pool.put(key, new Xlsx(Global.dataFolder + Global.fileSeparator + fileName));
			return key;
			// return pool.get(key);
		} catch (Exception e) {
			throw new SheetxException(e);
		}
	}

	public static void main(String[] args) {
		String fileName = "earth-ref-table1.xls";
		try {
			Xsl xls = new Xsl(Global.dataFolder + Global.fileSeparator + fileName);
			System.out.println("Aperto");
			ArrayList<String> sheets = xls.getSheets();
			for (String s : sheets) {
				System.out.println("" + s);
			}
			ArrayList<ArrayList<String>> content = xls.getContent(sheets.get(0));
			System.out.println("Letto contenuto");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	public static Sheetx getSheet(String key) throws SheetxException {
		try {
			if (pool == null || !pool.containsKey(key)) {
				throw new Exception("Invalid key");
			}

			return pool.get(key);

		} catch (Exception e) {
			throw new SheetxException(e);
		}
	}
	
	public static Xlsx getXlsx(String key) throws SheetxException {
		try {
			if (pool == null || !pool.containsKey(key)) {
				throw new Exception("Invalid key");
			}

			return (Xlsx) pool.get(key);

		} catch (Exception e) {
			throw new SheetxException(e);
		}
	}

	public static Xsl getXls(String key) throws SheetxException {
		try {
			if (pool == null || !pool.containsKey(key)) {
				throw new Exception("Invalid key");
			}

			return (Xsl) pool.get(key);

		} catch (Exception e) {
			throw new SheetxException(e);
		}
	}

	public static void releasXls(String key) {
		if (pool.containsKey(key)) {
			pool.remove(key);
		}
	}
}
