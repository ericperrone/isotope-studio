package it.cnr.igg.itineris;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;

import it.cnr.igg.helper.Commons;
import it.cnr.igg.helper.ItinerisResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.FullSampleDataBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;
import it.cnr.igg.isotopedb.queries.ItinerisSampleDataDb;

@Path("")
public class ItinerisSampleData extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/get-sample-data")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSampleDataOpt() {
		return ok();
	}

	@Path("/get-sample-data/{sampleid}")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSampleData(@PathParam("sampleid") Integer sampleid) {
		Gson gson = new Gson();
		try {
			String key = Commons.getItinerisKeyFromHeader(request);
			ItinerisSampleDataDb db = new ItinerisSampleDataDb(key);
			FullSampleDataBean bean = db.getSampleData(sampleid);
			return ok(gson.toJson(ItinerisResult.resultOk(bean)));
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

//	private ArrayList<SampleDataBean> formatData(ArrayList<SampleDataBean> list) {
//		ArrayList<SampleDataBean> list2 = new ArrayList<SampleDataBean>();
//		for (SampleDataBean sdb : list) {
//			String type = sdb.getType();
//
//			if (sdb.getName().equalsIgnoreCase("GEOROC_ID"))
//				continue;
//
//			switch (type) {
//			case "C":
//				sdb.setType("Chemical element");
//				break;
//			case "I":
//				sdb.setType("Isotope");
//				break;
//			case "F":
//				sdb.setType("Descriptor");
//				break;
//			}
//			list2.add(sdb);
//		}
//		return list2;
//	}
}
