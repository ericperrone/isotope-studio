package it.cnr.igg.isotopedb.beans;
import com.google.gson.internal.LinkedTreeMap;
import com.google.gson.Gson;
import java.util.Set;

public class TheBean {
	public String toJson() {
		String json = "";
		Gson gson = new Gson();
		json = gson.toJson(this);
		return json;
	}
	
	public LinkedTreeMap fromJson(String jsonIn) {
		Gson gson = new Gson();
		return gson.fromJson(jsonIn, LinkedTreeMap.class);
	}
	
	public Set<String> getKeys(LinkedTreeMap o) {
		Set<String> keys = o.keySet();
		return keys;
	}
}
