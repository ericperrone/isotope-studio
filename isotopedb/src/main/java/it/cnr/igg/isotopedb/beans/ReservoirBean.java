package it.cnr.igg.isotopedb.beans;

public class ReservoirBean extends TheBean {
	private Long id;
	private String reservoir;
	private int z;
	private String element;
	private Double value;
	private String um;
	private String reference;
	private String source;
	private String doi;
	private String errorType;
	private Double error;
	
	public ReservoirBean() {
		super();
	}
	

	public ReservoirBean(Long id, String reservoir, int z, String element, Double value, String um, String reference,
			String source, String doi, String errorType, Double error) {
		super();
		this.id = id;
		this.reservoir = reservoir;
		this.z = z;
		this.element = element;
		this.value = value;
		this.um = um;
		this.reference = reference;
		this.source = source;
		this.doi = doi;
		this.errorType = errorType;
		this.error = error;
	}

	public Long getId() {
		return id;
	}

	public String getReservoir() {
		return reservoir;
	}

	public int getZ() {
		return z;
	}

	public String getElement() {
		return element;
	}

	public Double getValue() {
		return value;
	}

	public String getUm() {
		return um;
	}

	public String getReference() {
		return reference;
	}

	public String getSource() {
		return source;
	}

	public String getDoi() {
		return doi;
	}

	public String getErrorType() {
		return errorType;
	}

	public Double getError() {
		return error;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setReservoir(String reservoir) {
		this.reservoir = reservoir;
	}

	public void setZ(int z) {
		this.z = z;
	}

	public void setElement(String element) {
		this.element = element;
	}

	public void setValue(Double value) {
		this.value = value;
	}

	public void setUm(String um) {
		this.um = um;
	}

	public void setReference(String reference) {
		this.reference = reference;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public void setDoi(String doi) {
		this.doi = doi;
	}

	public void setErrorType(String errorType) {
		this.errorType = errorType;
	}

	public void setError(Double error) {
		this.error = error;
	}
	
}
