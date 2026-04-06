package it.cnr.igg.rest;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;

import it.cnr.igg.helper.RestResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.ReservoirBean;
import it.cnr.igg.isotopedb.queries.ReservoirQuery;


class ReservoirList {
	public String status;
	public ArrayList<ReservoirBean> list;
}

class ReservoirOut {
	public String status;
	public ReservoirBean data;
}

class ReservoirListOut {
	public String status;
	public ArrayList<String> data;
}

@Path("")
public class Reservoir extends ResultBuilder {
	@Context
	private HttpServletRequest request;
	
	@Path("/get-reservoir-list")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getReservoirListOpt() {
		return ok("");
	}
	
	@Path("/get-reservoir-list")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getReservoirList() {
		ReservoirQuery rQuery = new ReservoirQuery();
		Gson gson = new Gson();
		try {
			ArrayList<String> list = rQuery.getRerservoirList();
			ReservoirListOut out = new ReservoirListOut();
			out.status = "success";
			out.data = list;
			return ok(gson.toJson(out));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}	
	}
	
	@Path("/get-reservoir")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getReservoirOpt() {
		return ok("");
	}

	@Path("/get-reservoir")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getReservoir(@QueryParam("filter") String filter) {
		ReservoirQuery rQuery = new ReservoirQuery();
		Gson gson = new Gson();
		try {
			ArrayList<ReservoirBean> list = rQuery.getReservoir(filter);
			ReservoirList out = new ReservoirList();
			out.status = "success";
			out.list = list;
			return ok(gson.toJson(out));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/put-reservoir")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response putReservoirOpt() {
		return ok("");
	}
	
	@Path("/put-reservoir")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response putReservoir() {
		Gson gson = new Gson();
		try {
			final BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));

			String line = null;
			final StringBuffer buffer = new StringBuffer(2048);

			while ((line = rd.readLine()) != null) {
				buffer.append(line);
			}
			final String data = buffer.toString();
			LinkedTreeMap payload = gson.fromJson(data, LinkedTreeMap.class);
			ReservoirBean bean = toReservoirBean(payload);
			bean = (new ReservoirQuery().insert(bean));
			ReservoirOut out = new ReservoirOut();
			out.status = "success";
			out.data = bean;
			return ok(gson.toJson(out));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	private ReservoirBean toReservoirBean(LinkedTreeMap payload) {
		ReservoirBean bean = new ReservoirBean();
		bean.setReservoir((String)payload.get("reservoir"));
		bean.setElement((String)payload.get("element"));
		bean.setValue((Double)payload.get("value"));
		bean.setUm((String)payload.get("um"));
		bean.setError((Double)payload.get("error"));
		bean.setErrorType((String)payload.get("errorType"));
		bean.setReference((String)payload.get("reference"));
		bean.setDoi((String)payload.get("doi"));
		bean.setSource((String)payload.get("source"));
		return bean;
	}
	
}
