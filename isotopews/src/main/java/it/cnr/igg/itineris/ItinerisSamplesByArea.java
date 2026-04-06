package it.cnr.igg.itineris;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;

import it.cnr.igg.helper.Commons;
import it.cnr.igg.helper.ItinerisResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;
import it.cnr.igg.isotopedb.queries.ItinerisSamplesByAreaDb;
import it.cnr.igg.isotopedb.beans.GeoAreaBean;
import it.cnr.igg.itineris.NoKeyException;

@Path("")
public class ItinerisSamplesByArea extends ResultBuilder {
	@Context
	private HttpServletRequest request;
	
	@Path("/get-samples-by-area")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSamplesOpt() {
		return ok();
	}
	
	@Path("/get-samples-by-area")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSamples(@QueryParam("toplon") float toplon, @QueryParam("toplat") float toplat, @QueryParam("bottomlon") float bottomlon, @QueryParam("bottomlat") float bottomlat) {
		Gson gson = new Gson();
		try {
			String key = Commons.getItinerisKeyFromHeader(request);
			ItinerisSamplesByAreaDb db = new ItinerisSamplesByAreaDb(key);
			ArrayList<Integer> list = db.getSamples(new GeoAreaBean(toplat, toplon, bottomlat, bottomlon));
			return ok(gson.toJson(ItinerisResult.resultOk(list)));
		} catch (NoKeyException nke) {
			nke.printStackTrace();
			return error(ItinerisResult.resultError(nke.getMessage()));
		} catch (NotAuthorizedException nae) {
			nae.printStackTrace();
			return error(ItinerisResult.resultError(nae.getMessage()));
		} catch (DbException de) {
			de.printStackTrace();
			return error(ItinerisResult.resultError(de.getMessage()));
		} catch (Exception e) {
			e.printStackTrace();
			return error(ItinerisResult.resultError(e.getMessage()));
		}
	}

}
