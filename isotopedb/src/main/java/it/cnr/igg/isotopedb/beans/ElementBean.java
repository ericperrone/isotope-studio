package it.cnr.igg.isotopedb.beans;

public class ElementBean extends TheBean {
	private String element;
	private boolean isotope;
	private String group;
	
	public ElementBean() {
	}

	public ElementBean(String element, boolean isotope, String group) {
		super();
		this.element = element;
		this.isotope = isotope;
		this.group = group;
	}

	public String getElement() {
		return element;
	}

	public boolean isIsotope() {
		return isotope;
	}

	public String getGroup() {
		return group;
	}

	public void setElement(String element) {
		this.element = element;
	}

	public void setIsotope(boolean isotope) {
		this.isotope = isotope;
	}

	public void setGroup(String group) {
		this.group = group;
	}
}
