package it.cnr.igg.itineris;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;

import it.cnr.igg.helper.Commons;
import it.cnr.igg.helper.ItinerisResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.AuthorBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;
import it.cnr.igg.isotopedb.queries.ItinerisAuthorsDb;
import it.cnr.igg.itineris.beans.ItinerisAuthorBean;

@Path("")
public class ItinerisAuthors extends ResultBuilder {
	@Context
	private HttpServletRequest request;
	
	@Path("/get-author-list")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAuthorListOpt() {
		return ok();
	}
	
	@Path("/get-author-list")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAuthorList() {
		Gson gson = new Gson();
		try {
			String key = Commons.getItinerisKeyFromHeader(request);
			ItinerisAuthorsDb db = new ItinerisAuthorsDb(key);
			ArrayList<AuthorBean> list = db.getItinerisAuthors();
			ArrayList<ItinerisAuthorBean> itList = toItinerisAuthor(list);
			return ok(gson.toJson(ItinerisResult.resultOk(itList)));
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
	
	private ArrayList<ItinerisAuthorBean> toItinerisAuthor(ArrayList<AuthorBean> list) {
		ArrayList<ItinerisAuthorBean> itList = new ArrayList<ItinerisAuthorBean>();
		for (AuthorBean ab : list) {
			itList.add(new ItinerisAuthorBean(ab.getId(), ab.getSurname() + ", " + ab.getName()));
		}
		return itList;
	}
}
