package it.cnr.igg.rest;

import java.util.ArrayList;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;

import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.SpiderBean;
import it.cnr.igg.isotopedb.beans.ThesauriBean;
import it.cnr.igg.isotopedb.queries.SpiderQuery;
import it.cnr.igg.isotopedb.queries.ThesauriQuery;

@Path("")
public class Thesauri extends ResultBuilder {
	@Path("/get-thesauri-list")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getThesauriListOpt() {
		return ok("");
	}

	@Path("/get-thesauri-list")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getThesauriList() {
		try {
			ThesauriQuery query = new ThesauriQuery();
			ArrayList<ThesauriBean> beans = query.getThesauriList();
			Gson gson = new Gson();
			String json = gson.toJson(beans);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}

	@Path("/get-thesauri")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getThesauriOpt() {
		return ok("");
	}

	@Path("/get-thesauri")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getThesauri(@QueryParam("id") String id) {
		try {
			ThesauriQuery query = new ThesauriQuery();
			ThesauriBean bean = query.getThesauri(Integer.valueOf(id));
			Gson gson = new Gson();
			String json = gson.toJson(bean);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}

}
