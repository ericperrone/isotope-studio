package it.cnr.igg.isotopedb.beans;

public class MeasureUnitBean extends TheBean {
	private String um;
	private Double toPPM;
	
	public MeasureUnitBean(String um, Double toPPM) {
		this.um = um;
		this.toPPM = toPPM;
	}

	public String getUm() {
		return um;
	}

	public Double getToPPM() {
		return toPPM;
	}
}
