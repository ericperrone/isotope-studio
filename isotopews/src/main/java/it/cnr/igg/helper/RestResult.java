package it.cnr.igg.helper;

public class RestResult {
	private String status;
	private Object data;
	private String message;
	
	public RestResult(String status, String message) {
		this.status = status;
		this.message = message;
	}
	
	public RestResult(String status, Object data, String message) {
		this.status = status;
		this.data = data;
		this.message = message;
	}
	
	public static RestResult resultOk(Object data, String message) {
		RestResult rr = new RestResult("success", data, message);
		return rr;
	}

	public static RestResult resultOk(String message) {
		RestResult rr = new RestResult("success", message);
		return rr;
	}
	
	public static RestResult resultError(String message) {
		RestResult rr = new RestResult("error", message);
		return rr;
	}
}
