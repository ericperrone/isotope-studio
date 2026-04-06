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
import it.cnr.igg.isotopedb.beans.SampleDataBean;
import it.cnr.igg.isotopedb.beans.DatasetBean;
import it.cnr.igg.isotopedb.beans.FullSampleDataBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;
import it.cnr.igg.isotopedb.queries.ItinerisReferenceListDb;
import it.cnr.igg.isotopedb.queries.ItinerisSampleDataDb;
import it.cnr.igg.isotopedb.queries.ItinerisSamplesByAuthorDb;
import it.cnr.igg.itineris.NoKeyException;
import it.cnr.igg.itineris.beans.ItinerisReferenceBean;

@Path("")
public class ItinerisReferenceList extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/get-reference-list")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getRefOpt() {
		return ok();
	}
	
	@Path("/get-reference-list")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getRef() {
		Gson gson = new Gson();
		try {
			String key = Commons.getItinerisKeyFromHeader(request);
			ItinerisReferenceListDb db = new ItinerisReferenceListDb(key);
			ArrayList<DatasetBean> beans = db.getReferenceList();
			ArrayList<ItinerisReferenceBean> refs = toItinerisReferenceBean(beans);
			return ok(gson.toJson(ItinerisResult.resultOk(refs)));
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
	
	private ArrayList<ItinerisReferenceBean> toItinerisReferenceBean(ArrayList<DatasetBean> beans) {
		ArrayList<ItinerisReferenceBean> refs = new ArrayList<ItinerisReferenceBean>();
		for (DatasetBean bean : beans) {
			refs.add(new ItinerisReferenceBean(bean.getLink(), bean.getMetadata()));
		}
		return refs;
	}

}
