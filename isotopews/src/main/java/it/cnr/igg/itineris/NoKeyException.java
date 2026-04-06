package it.cnr.igg.itineris;

public class NoKeyException extends Exception{
	
	public NoKeyException() {
		super("No access key provided.");
	}

}
