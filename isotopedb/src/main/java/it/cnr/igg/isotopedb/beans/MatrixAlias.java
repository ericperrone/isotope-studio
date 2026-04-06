package it.cnr.igg.isotopedb.beans;

public class MatrixAlias extends TheBean {
	private Long matrixId;
	private String alias;
	private String origin;
	
	public MatrixAlias(Long matrixId, String alias, String origin) {
		super();
		this.matrixId = matrixId;
		this.alias = alias;
		this.origin = origin;
	}

	public Long getMatrixId() {
		return matrixId;
	}

	public String getAlias() {
		return alias;
	}

	public String getOrigin() {
		return origin;
	}
}
