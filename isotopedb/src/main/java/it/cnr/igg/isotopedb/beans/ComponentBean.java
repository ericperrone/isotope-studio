package it.cnr.igg.isotopedb.beans;

public class ComponentBean extends TheBean {
	private Long componentId;
	private String component;
	private Double value;
	private String um;
	private String technique;
	private String uncertainty;
	private String uncertaintyType;
	private String refstd;
	
	public Long getComponentId() {
		return componentId;
	}

	private boolean isIsotope;
	
	public ComponentBean(Long id, String component, Double value, String um) {
		this.componentId = id;
		this.component = component;
		this.value = value;
		this.um = um;
	}
	
	public ComponentBean(String component, Double value, String um) {
		this.component = component;
		this.value = value;
		this.um = um;
	}
	
	public ComponentBean(String component, Double value, boolean isIsotope) {
		this.component = component;
		this.value = value;
		this.isIsotope = isIsotope;
	}
	
	public ComponentBean(String component, Double value, boolean isIsotope, String um) {
		this.component = component;
		this.value = value;
		this.isIsotope = isIsotope;
		this.um = um;
	}
	
	public ComponentBean(String component, Double value, boolean isIsotope, String um, String techinque, String uncertainty, String uncertaintyType, String refstd) {
		this.component = component;
		this.value = value;
		this.isIsotope = isIsotope;
		this.um = um;
		this.technique = techinque;
		this.uncertainty = uncertainty;
		this.uncertaintyType = uncertaintyType;
		this.refstd = refstd;
	}
	
	public ComponentBean() {
		
	}
	
	public void setRefstd(String refstd) {
		this.refstd = refstd;
	}

	public String getRefstd() {
		return refstd;
	}

	public Long getId() {
		return componentId;
	}

	public String getComponent() {
		return component;
	}

	public Double getValue() {
		return value;
	}

	public String getUm() {
		return um;
	}
	
	public String getTechnique() {
		return technique;
	}

	public String getUncertainty() {
		return uncertainty;
	}

	public String getUncertaintyType() {
		return uncertaintyType;
	}	
	
	public boolean getIsIsotope() {
		return isIsotope;
	}

	public void setId(Long id) {
		this.componentId = id;
	}

	public void setComponent(String component) {
		this.component = component;
	}

	public void setValue(Double value) {
		this.value = value;
	}

	public void setUm(String um) {
		this.um = um;
	}
		
	public void setComponentId(Long componentId) {
		this.componentId = componentId;
	}

	public void setTechnique(String technique) {
		this.technique = technique;
	}

	public void setUncertainty(String uncertainty) {
		this.uncertainty = uncertainty;
	}

	public void setUncertaintyType(String ucertaintyType) {
		this.uncertaintyType = ucertaintyType;
	}

	public void setIsotope(boolean isIsotope) {
		this.isIsotope = isIsotope;
	}

	public void setIsIsotope(boolean isIsotope) {
		this.isIsotope = isIsotope;
	}
	
	public boolean compareTo(ComponentBean cb) {
		return (cb.getComponent().equalsIgnoreCase(component));
	}
	
}
