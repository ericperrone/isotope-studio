package it.cnr.igg.isotopedb.beans;

public class SampleDataBean {
	private String type;
	private String name;
	private String sValue;
	private Float nValue;
	private String um;
	private String synonym;
	
	public SampleDataBean(String type, String name, String sValue, Float nValue, String um, String synonym) {
		super();
		this.type = type;
		this.name = name != null ? name.trim() : null;
		this.sValue = sValue;
		this.nValue = sValue != null && nValue == 0f ? null : nValue;
		this.um = um;
		this.synonym = synonym;
	}

	public String getType() {
		return type;
	}

	public String getName() {
		return name;
	}

	public String getsValue() {
		return sValue;
	}

	public Float getnValue() {
		return nValue;
	}

	public String getUm() {
		return um;
	}

	public String getSynonym() {
		return synonym;
	}
	
	public void setType(String type) {
		this.type = type;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setsValue(String sValue) {
		this.sValue = sValue;
	}

	public void setnValue(Float nValue) {
		this.nValue = nValue;
	}

	public void setUm(String um) {
		this.um = um;
	}

	public void setSynonym(String synonym) {
		this.synonym = synonym;
	}
}
