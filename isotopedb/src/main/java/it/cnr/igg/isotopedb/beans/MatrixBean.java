package it.cnr.igg.isotopedb.beans;

import java.util.ArrayList;

public class MatrixBean extends TheBean {
	private Long nodeId;
	private Long parentNodeId;
	private String matrix;
	private ArrayList<String> aliases;
	
	public MatrixBean(Long nodeId, Long parentNodeId, String matrix) {
		super();
		this.nodeId = nodeId;
		this.parentNodeId = parentNodeId;
		this.matrix = matrix;
	}

	public Long getNodeId() {
		return nodeId;
	}

	public Long getParentNodeId() {
		return parentNodeId;
	}

	public String getMatrix() {
		return matrix;
	}

	public ArrayList<String> getAliases() {
		return aliases;
	}

	public void setAliases(ArrayList<String> aliases) {
		this.aliases = aliases;
	}
}
