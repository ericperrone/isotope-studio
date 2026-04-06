package it.cnr.igg.rest;
import java.util.ArrayList;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;

import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.queries.KeywordsQuery;

@Path("")
public class Keywords extends ResultBuilder {

	@Path("/get-keywords")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getKeywordsOpt() {
		return ok("");
	}
	
	@Path("/get-keywords")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getKeywords() {
		try {
			String json = "";
			Gson gson = new Gson();

			KeywordsQuery kq = new KeywordsQuery();
			ArrayList<String> keywords = kq.getKeywords();
			json = gson.toJson(keywords);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
}
