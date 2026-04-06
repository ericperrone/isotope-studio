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
import it.cnr.igg.isotopedb.beans.SpiderBean;
import it.cnr.igg.isotopedb.queries.SpiderQuery;

@Path("")
public class Spider extends ResultBuilder {
	@Path("/get-normalization")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getNormsOpt() {
		return ok("");
	}

	@Path("/get-normalization")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getNorms() {
		try {
			SpiderQuery query = new SpiderQuery();
			ArrayList<SpiderBean> norms = query.getNorms();
			Gson gson = new Gson();
			String json = gson.toJson(norms);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
}
