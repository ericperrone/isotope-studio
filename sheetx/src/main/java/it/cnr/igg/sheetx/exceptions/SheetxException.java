package it.cnr.igg.sheetx.exceptions;

public class SheetxException extends Exception {

	public SheetxException(Exception ex){
		super(ex.getMessage(), ex.getCause());
	}
	
	public SheetxException(String exMessage){
		super(exMessage, null);
	}

}
