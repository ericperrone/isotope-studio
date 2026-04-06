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
import it.cnr.igg.isotopedb.beans.MeasureUnitBean;
import it.cnr.igg.isotopedb.queries.MeasureUnitQuery;

@Path("")
public class MeasureUnit extends ResultBuilder {
	@Path("/get-measure-unit")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUnitsOpt() {
		return ok("");
	}
	
	@Path("/get-measure-unit")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUnits() {
		try {
			String json = "";
			Gson gson = new Gson();
			
			MeasureUnitQuery muq = new MeasureUnitQuery();
			ArrayList<MeasureUnitBean> ums = muq.getAll();
			json = gson.toJson(ums);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
	
	@Path("/get-uncertainty-type")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUTypeOpt() {
		return ok("");
	}
	
	@Path("/get-uncertainty-type")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUType() {
		try {
			String json = "";
			Gson gson = new Gson();
			
			MeasureUnitQuery muq = new MeasureUnitQuery();
			ArrayList<String> types = muq.getUncertaintyTypes();
			json = gson.toJson(types);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
	
}
