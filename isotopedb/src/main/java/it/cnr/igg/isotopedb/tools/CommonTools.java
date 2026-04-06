package it.cnr.igg.isotopedb.tools;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class CommonTools {

	public CommonTools() {

	}

	public static String md5(String in) throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("MD5");
		return doDigest(in, md);
	}
	
	
	public static String Sha1(String in) throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("SHA-1");
		return doDigest(in, md);
	}
	
	public static String Sha256(String in) throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("SHA-256");
		return doDigest(in, md);
	}
	
	public static String doDigest(String in, MessageDigest md) throws NoSuchAlgorithmException {
		md.update(in.getBytes());
		byte[] digest = md.digest();
		return CommonTools.byteArray2HexString(digest);
	}

	public static String byteArray2HexString(byte[] a) {
		StringBuilder sb = new StringBuilder(a.length * 2);
		for (byte b : a)
			sb.append(String.format("%02x", b));
		return sb.toString();
	}

}
