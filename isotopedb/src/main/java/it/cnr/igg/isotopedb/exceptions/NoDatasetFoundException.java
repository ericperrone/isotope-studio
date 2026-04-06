package it.cnr.igg.isotopedb.exceptions;

public class NoDatasetFoundException extends Exception {
	public NoDatasetFoundException(Exception ex){
		super(ex.getMessage(), ex.getCause());
	}
	
	public NoDatasetFoundException(String exMessage){
		super(exMessage, null);
	}
}
