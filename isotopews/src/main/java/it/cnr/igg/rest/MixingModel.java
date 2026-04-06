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
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;

import it.cnr.igg.helper.RestResult;
import it.cnr.igg.helper.ResultBuilder;

import it.cnr.igg.geomodels.Mixing;
import it.cnr.igg.geomodels.GeoData;

@Path("")
public class MixingModel extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/mixing-model")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response mixingOpt() {
		return ok("");
	}

	@Path("/mixing-model")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response mixing() {
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
			GeoData[] geoData = jsonToGeoData(payload);
			
			Mixing mixing = new Mixing(geoData);
			mixing.compute();
			Object result = mixing.getMixingOutput();
			return ok(gson.toJson(result));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/mixing-plot")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response mixingPlotOpt() {
		return ok("");
	}
	
	@Path("/mixing-plot")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response mixingPlot() {
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
			GeoData geoData = jsonToGeoDataPlot(payload);
			GeoData[] gd = new GeoData[1];
			gd[0] = geoData;
			Mixing mixing = new Mixing(gd);
			Object result = mixing.getPlotted();
			return ok(gson.toJson(result));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	private GeoData jsonToGeoDataPlot(LinkedTreeMap payload) {
		GeoData geoData = new GeoData();
		String x = "" + payload.get("xPoint");
		String y = "" + payload.get("yPoint");
		geoData.setPlottedX(Double.valueOf(x));
		geoData.setPlottedY(Double.valueOf(y));
		
		ArrayList<LinkedTreeMap> xs = (ArrayList<LinkedTreeMap>) payload.get("xs");
		ArrayList<LinkedTreeMap> ys = (ArrayList<LinkedTreeMap>) payload.get("ys");

		geoData.setXYs(xs.size());
		for (int j = 0; j < xs.size(); j++) {
			String member = "" + xs.get(j).get("member");
			String element = "" + xs.get(j).get("element");
			Double concentration =  Double.valueOf("" + xs.get(j).get("concentration"));
			Double concentration2 =  0d;
			if (xs.get(j).get("concentration2") != null) {
				concentration2 = Double.valueOf("" + xs.get(j).get("concentration2"));
			}
			geoData.addXs(member, element, concentration, concentration2, j);
		}		
		for (int j = 0; j < ys.size(); j++) {
			String member = "" + ys.get(j).get("member");
			String element = "" + ys.get(j).get("element");
			Double concentration =  Double.valueOf("" + ys.get(j).get("concentration"));
			Double concentration2 =  0d;
			if (xs.get(j).get("concentration2") != null) {
				concentration2 = Double.valueOf("" + ys.get(j).get("concentration2"));
			}
			geoData.addYs(member, element, concentration, concentration2, j);
		}		
		
		return geoData;
	}
	
	private GeoData[] jsonToGeoData(LinkedTreeMap payload) {
		ArrayList<GeoData> geoData = new ArrayList<GeoData>();
		ArrayList<LinkedTreeMap> data = (ArrayList<LinkedTreeMap>) payload.get("data");
		for (int i = 0; i < data.size(); i++) {
			LinkedTreeMap item = data.get(i);
			String increment = item.get("increment") == null ? null : "" + item.get("increment");
			ArrayList<LinkedTreeMap> members = (ArrayList<LinkedTreeMap>)item.get("members");
			GeoData gd = new GeoData();
//			gd.setElement(element);
			if (increment == null) {
				gd.setStep(0.01d);
			} else {
				gd.setStep(Double.valueOf(increment));
			}
			
			gd.setMembers(members.size());
			for (int j = 0; j < members.size(); j++) {
				String member = "" + members.get(j).get("member");
				String element = "" + members.get(j).get("element");
				Double concentration =  Double.valueOf("" + members.get(j).get("concentration"));
				Double concentration2 =  0d;
				if (members.get(j).get("concentration2") != null) {
					concentration2 = Double.valueOf("" + members.get(j).get("concentration2"));
				}
				gd.setMember(member, element, concentration, concentration2, j);
			}
			geoData.add(gd);
		}
		return (GeoData[])geoData.toArray(new GeoData[geoData.size()]);
	}
}
