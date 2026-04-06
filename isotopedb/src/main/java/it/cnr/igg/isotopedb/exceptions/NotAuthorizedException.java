package it.cnr.igg.isotopedb.exceptions;

public class NotAuthorizedException extends Exception {
	public NotAuthorizedException() {
		super("Not authorized", null);
	}
}
