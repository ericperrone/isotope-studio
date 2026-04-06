package it.cnr.igg.isotopedb.beans;

public class SpiderBean extends TheBean {
	private String method;
	private String norm;
	private String ord;
	
	public SpiderBean() {
		super();
		method = norm = null;
	}

	public SpiderBean(String method, String norm, String ord) {
		super();
		this.method = method;
		this.norm = norm;
		this.ord = ord;
	}

	public String getMethod() {
		return method;
	}

	public String getNorm() {
		return norm;
	}

	public void setMethod(String method) {
		this.method = method;
	}

	public void setNorm(String norm) {
		this.norm = norm;
	}

	public String getOrd() {
		return ord;
	}

	public void setOrd(String ord) {
		this.ord = ord;
	}
	
}
