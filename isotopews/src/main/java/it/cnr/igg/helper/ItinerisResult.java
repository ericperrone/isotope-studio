package it.cnr.igg.helper;

public class ItinerisResult {
	public static final String OK = "OK";
	public static final String ERROR = "ERROR";
	private String status;
	private Object data;
	private String message;
	
	public ItinerisResult() {
		
	}
	
	public ItinerisResult(String status, Object data, String message) {
		this.status = status;
		this.data = data;
		this.message = message;
	}
	
	public ItinerisResult(String status, String message) {
		this.status = status;
		this.message = message;
	}
	
	public static ItinerisResult resultOk(Object data, String message) {
		ItinerisResult rr = new ItinerisResult(ItinerisResult.OK, data, message);
		return rr;
	}

	public static ItinerisResult resultOk(String message) {
		ItinerisResult rr = new ItinerisResult(ItinerisResult.OK, message);
		return rr;
	}
	
	public static ItinerisResult resultOk(Object data) {
		ItinerisResult rr = new ItinerisResult(ItinerisResult.OK, data, "Success");
		return rr;
	}
	
	public static ItinerisResult resultError(String message) {
		ItinerisResult rr = new ItinerisResult(ItinerisResult.ERROR, null, message);
		return rr;
	}

	public static String getOk() {
		return OK;
	}

	public static String getError() {
		return ERROR;
	}

	public String getStatus() {
		return status;
	}

	public Object getData() {
		return data;
	}

	public String getMessage() {
		return message;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public void setData(Object data) {
		this.data = data;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
