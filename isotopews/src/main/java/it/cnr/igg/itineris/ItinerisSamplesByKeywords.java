package it.cnr.igg.itineris;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;

import it.cnr.igg.helper.Commons;
import it.cnr.igg.helper.ItinerisResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;
import it.cnr.igg.isotopedb.queries.ItinerisSamplesByKeywordsDb;

@Path("")
public class ItinerisSamplesByKeywords extends ResultBuilder {
	@Context
	private HttpServletRequest request;
	
	@Path("/get-samples-by-keywords")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSamplesOpt() {
		return ok();
	}
	
	@Path("/get-samples-by-keywords/{keywords}")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSamples(@PathParam("keywords") String keywords) {
		Gson gson = new Gson();
		try {
			String key = Commons.getItinerisKeyFromHeader(request);
			ItinerisSamplesByKeywordsDb db = new ItinerisSamplesByKeywordsDb(key);
			ArrayList<Integer> list = db.getSamples(keywords);
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
