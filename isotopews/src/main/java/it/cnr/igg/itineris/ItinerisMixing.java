package it.cnr.igg.itineris;

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

import it.cnr.igg.helper.Commons;
import it.cnr.igg.helper.RestResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.queries.ItinerisCommon;

import it.cnr.igg.geomodels.Mixing;
import it.cnr.igg.geomodels.GeoData;
import it.cnr.igg.itineris.beans.ItinerisMixingInput;
import it.cnr.igg.itineris.beans.ItinerisMixingOut;
import it.cnr.igg.itineris.beans.ItinerisMixingOutBean;
import it.cnr.igg.itineris.beans.ItinerisEndMember;

@Path("")
public class ItinerisMixing extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/compute-mixing")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response mixingOpt() {
		return ok("");
	}

	@Path("/compute-mixing")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response mixing() {
		Gson gson = new Gson();
		try {
			String key = Commons.getItinerisKeyFromHeader(request);
			
			new ItinerisCommon().checkItinerisKey(key);
			
			final BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));

			String line = null;
			final StringBuffer buffer = new StringBuffer(2048);

			while ((line = rd.readLine()) != null) {
				buffer.append(line);
			}
			final String data = buffer.toString();

			LinkedTreeMap payload = gson.fromJson(data, LinkedTreeMap.class);
			ItinerisMixingInput in = prepareInput(payload);
			ArrayList<GeoData> geos = toGeoData(in);
			
			GeoData[] g = new GeoData[1];
			g[0] = geos.get(0);
			Double step = in.getIncrement();
			if (step != null && step > 0d) {
				g[0].setStep(step);
			} else {
				g[0].setStep(0.1d);
			}
			Mixing mixing = new Mixing(g);
			

			mixing.compute();
			ArrayList<ItinerisMixingOutBean> out1 = mixing.getMix();
			
			g[0] = geos.get(1);
			if (step != null && step > 0d) {
				g[0].setStep(step);
			} else {
				g[0].setStep(0.1d);
			}
			
			mixing = new Mixing(g);
			mixing.compute();
			ArrayList<ItinerisMixingOutBean> out2 = mixing.getMix();
			
			ItinerisMixingOut imOut = new ItinerisMixingOut(out1, out2);
			
			return ok(gson.toJson(RestResult.resultOk(imOut, "Success")));

		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	private ItinerisMixingInput prepareInput(LinkedTreeMap payload) {
		ItinerisMixingInput imi = new ItinerisMixingInput();
		Double increment = (Double) payload.get("increment");
		if (increment != null)
			imi.setIncrement(increment);
		ArrayList<LinkedTreeMap> m1 = (ArrayList<LinkedTreeMap>)payload.get("member1");
		imi.setEndMember1(getEndMember(m1));
		ArrayList<LinkedTreeMap> m2 = (ArrayList<LinkedTreeMap>)payload.get("member2");
		imi.setEndMember2(getEndMember(m2));
		return imi;
	}
	
	private ArrayList<GeoData> toGeoData(ItinerisMixingInput imi) {
		ArrayList<GeoData> geoData = new ArrayList<GeoData>();
		
		ArrayList<ItinerisEndMember> m1 = imi.getEndMember1();
		GeoData d = new GeoData();
		d.setMembers(imi.getEndMember1().size());
		int i = 0;
		for (ItinerisEndMember m : m1) {
			if (m.elementConcentration == null) {
				d.setMember(m.name, m.element, m.memberValue, i);
			} else {
				d.setMember(m.name, m.element, m.memberValue, m.elementConcentration, i);
			}
			i++;
		}
		geoData.add(d);
		
		ArrayList<ItinerisEndMember> m2 = imi.getEndMember2();
		d = new GeoData();
		d.setMembers(imi.getEndMember2().size());
		i = 0;
		for (ItinerisEndMember m : m2) {
			if (m.elementConcentration == null) {
				d.setMember(m.name, m.element, m.memberValue, i);
			} else {
				d.setMember(m.name, m.element, m.memberValue, m.elementConcentration, i);
			}
			i++;
		}
		geoData.add(d);		
		
		return geoData;
	}
	
	private ArrayList<ItinerisEndMember> getEndMember(ArrayList<LinkedTreeMap> m) {
		ArrayList<ItinerisEndMember> members = new ArrayList<ItinerisEndMember>();
		for (LinkedTreeMap ltm : m) {
			String name = (String) ltm.get("name");
			String element = (String) ltm.get("element");
			Double value = (Double) ltm.get("value");
			Double concentration = (Double) ltm.get("concentration");
			ItinerisEndMember iem = new ItinerisEndMember();
			iem.name = name;
			iem.element = element;
			iem.memberValue = value;
			iem.elementConcentration = concentration;
			members.add(iem);
		}
		
		return members;
	}
}
