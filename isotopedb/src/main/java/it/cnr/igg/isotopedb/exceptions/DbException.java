package it.cnr.igg.isotopedb.exceptions;

public class DbException extends Exception {
	public DbException(Exception ex){
		super(ex.getMessage(), ex.getCause());
	}
	
	public DbException(String exMessage){
		super(exMessage, null);
	}
}
