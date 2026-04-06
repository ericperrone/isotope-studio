package it.cnr.igg.rest;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.google.gson.Gson;

import java.util.List;

import it.cnr.igg.isotopedb.beans.CountryBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.queries.CountryQuery;
import com.google.gson.Gson;

@Path("/country")
public class RestCountry {

	public RestCountry() {
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getCountry() throws Exception {
		try {
			List<CountryBean> countries = new CountryQuery().getByName("");
//			String json = "";
//			Gson gson = new Gson();
//			json = gson.toJson(countries);
//			return json;
			String output = "{ \"countries\": [";
			for (int i = 0; i < countries.size() - 1; i++) {
				output += countries.get(i).toJson() + ",";
			}
			output += countries.get(countries.size() - 1).toJson();
			output += "]}";
			return output;
		} catch (DbException e) {
			e.printStackTrace();
			throw e;
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}
}
