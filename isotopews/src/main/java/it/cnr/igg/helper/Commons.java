package it.cnr.igg.helper;

import java.util.ArrayList;
import javax.servlet.http.HttpServletRequest;

import it.cnr.igg.isotopedb.beans.AuthorBean;
import it.cnr.igg.itineris.NoKeyException;

public class Commons {
	public static final String ITINERIS_KEY = "it-key";
	public static final String KEY = "token";
	public static final String ITINERIS_DOC = "itineris document";

	public Commons() {
	}
	
	public static Integer toInteger(String s) {
		if ((s == null) || (s.length() == 0) || (s.equalsIgnoreCase("null")))
			return null;
		Double f = Double.valueOf(s);
		int ff = (int)f.doubleValue();
		Integer n = Integer.valueOf(ff);
		return n;
	}
	
	public static String getItinerisKeyFromHeader(HttpServletRequest request) throws Exception {
		String key = request.getHeader(Commons.ITINERIS_KEY);
		if (key == null)
			throw new NoKeyException();
		return key;
	}

	public static String getKeyFromHeader(HttpServletRequest request) throws Exception {
		String key = request.getHeader(Commons.KEY);
		if (key == null)
			throw new Exception("Missing authorization key");
		return key;
	}

	public static boolean checkItinerisTemplate(ArrayList<String> header) {
		for (String h : header) {
			String local = h.toLowerCase();
			local = local.replaceAll("_", " ");
			local = local.replaceAll("-", " ");
			if (ITINERIS_DOC.equals(local))
				return true;
		}
		return false;
	}

	public static String getDoi(ArrayList<ArrayList<String>> content) {
		String doi = "";
		ArrayList<String> header = content.get(0);
		int col = -1;
		for (int i = 0; i < header.size(); i++) {
			if (header.get(i).trim().toLowerCase().equals("doi")) {
				col = i;
				break;
			}
		}
		
		//
		// ipotesi semplificativa: il template contiene solo un doi e una lista di
		// autori
		//	
		
		if (col >= 0) {
			doi = content.get(1).get(col).trim();
		}
		
		return doi;
	}

	public static ArrayList<AuthorBean> getAuthors(ArrayList<ArrayList<String>> content) {
		ArrayList<AuthorBean> authors = new ArrayList<AuthorBean>();
		ArrayList<String> header = content.get(0);
		int col = -1;
		for (int i = 0; i < header.size(); i++) {
			if (header.get(i).trim().toLowerCase().equals("authors")) {
				col = i;
				break;
			}
		}
		
		//
		// ipotesi semplificativa: il template contiene solo un doi e una lista di
		// autori
		//
		
		if (col >= 0) {
			String auths = content.get(1).get(col);
			String[] tokens = auths.split("\\)");
			for (String token : tokens) {
				String wholeName = token.trim();
				wholeName = wholeName.substring(1 + wholeName.indexOf("("));
				String[] identity = wholeName.split(",");
				if (identity.length == 2) {
					authors.add(new AuthorBean(identity[1].trim(), identity[0].trim()));
				} else {
					authors.add(new AuthorBean(identity[0].trim(), ""));
				}
			}
		}
		return authors;
	}

}
