package it.cnr.igg.rest;

import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;

import it.cnr.igg.helper.Commons;
import it.cnr.igg.helper.Global;
import it.cnr.igg.helper.RestResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.AuthorBean;
import it.cnr.igg.isotopedb.beans.CacheBean;
import it.cnr.igg.isotopedb.beans.DatasetBean;
import it.cnr.igg.isotopedb.beans.DatasetFullLinkBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.queries.DatasetQuery;
import it.cnr.igg.sheetx.csv.Csv;
import it.cnr.igg.sheetx.xlsx.Sheetx;
import it.cnr.igg.sheetx.xlsx.Xlsx;
import it.cnr.igg.sheetx.xlsx.Xsl;

class ContentHelper {
	public ArrayList<String> sheets;
	public String key;
}

class MetadataInfo {
	public String keywords;
}

@Path("")
public class ContentDir extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/getCache")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCacheOpt() {
		return ok();
	}

	@Path("/getCache")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCache(@QueryParam("datasetid") String datasetid) {
		Gson gson = new Gson();
		Long id = Long.parseLong(datasetid);
		DatasetQuery dq = new DatasetQuery();
		try {
			ArrayList<CacheBean> beans = dq.getCachedData(id);
			return ok(gson.toJson(RestResult.resultOk(beans, "")));
		} catch (Exception e) {
			return error(gson.toJson(RestResult.resultError("" + e.getMessage())));
		}
	}

	@Path("/deleteCache")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteCacheOpt() {
		return ok();
	}
	
	@Path("/deleteCache")
	@DELETE
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteCache(@QueryParam("datasetid") String datasetid) {
		Gson gson = new Gson();
		try {
			Long id = Long.parseLong(datasetid);
			DatasetQuery dq = new DatasetQuery();
			dq.deleteCachedData(id);
			return ok(gson.toJson(RestResult.resultOk("Ok")));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/pushCache")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response postCacheOpt() {
		return ok();
	}

	@Path("/pushCache")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response postCache() {
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
			ArrayList<CacheBean> beans = toCache(payload);
			DatasetQuery dq = new DatasetQuery();
			dq.insertCachedData(beans);
	
			return ok(gson.toJson(RestResult.resultOk("Ok")));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	private ArrayList<CacheBean> toCache(LinkedTreeMap payload) {
		ArrayList<CacheBean> beans = new ArrayList<CacheBean>();
		ArrayList<LinkedTreeMap> data = (ArrayList<LinkedTreeMap>) payload.get("cache");
		for (int i = 0; i < data.size(); i++) {
			LinkedTreeMap ltm = data.get(i);
			CacheBean bean = new CacheBean();
			String n = "" + ltm.get("datasetid");
			n = n.substring(0, n.indexOf("."));
			bean.datasetId = Long.valueOf(n);
			bean.fieldName = (String) ltm.get("fieldname");
			bean.fieldType = (String) ltm.get("fieldtype");
			bean.um = (String) ltm.get("um");
			bean.technique = (String) ltm.get("technique");	
			Double err = ltm.get("error") != null ? (Double) ltm.get("error") : null;
			if (err != null) {
				bean.error = Float.valueOf("" + err);
			} else 
				bean.error = null;
			bean.errorType = (String) ltm.get("errortype");
			beans.add(bean);
		}
		return beans;
	}

	@Path("/get-full-references")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getfullReferencesOpt() {
		return ok();
	}

	@Path("/get-full-references")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getfullReferences() {
		Gson gson = new Gson();
		DatasetQuery datasetQuery = new DatasetQuery();
		try {
			ArrayList<DatasetFullLinkBean> beans = datasetQuery.getFullLinks();
			return ok(gson.toJson(RestResult.resultOk(gson.toJson(beans), "")));
		} catch (Exception e) {
			return error(gson.toJson(RestResult.resultError("" + e.getMessage())));
		}
	}

	@Path("/insert-dataset")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response pushDatasetOpt() {
		return ok();
	}

	@Path("/insert-dataset")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response pushDataset() {
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
			DatasetBean bean = toDataseteBean(payload);
			DatasetQuery datasetQuery = new DatasetQuery();
			DatasetBean newBean = datasetQuery.insertDataset(bean);
			return ok(gson.toJson(RestResult.resultOk("" + gson.toJson(newBean))));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/update-dataset")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response updateDatasetOpt() {
		return ok();
	}
	
	@Path("/update-dataset")
	@PUT
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response updateDataset() {
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
			DatasetBean bean = toDataseteBean(payload);
			DatasetQuery datasetQuery = new DatasetQuery();
			datasetQuery.updateDataset(bean);
			return ok(gson.toJson(RestResult.resultOk("" + gson.toJson(bean))));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/delete-dataset/{id}")
	@OPTIONS
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteDatasetOpt(@PathParam("id") String id) {
		return ok();
	}

	@Path("/delete-dataset/{id}")
	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteDataset(@PathParam("id") String id) {
		Gson gson = new Gson();
		try {
			DatasetQuery datasetQuery = new DatasetQuery();
			datasetQuery.deleteCachedData(Long.valueOf(id));
			String fileName = datasetQuery.deleteDataset(Long.valueOf(id));
			deleteFile(fileName);
			return ok(gson.toJson(RestResult.resultOk("deleted")));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	@Path("/get-file-link/{name}")
	@OPTIONS
	@Produces(MediaType.APPLICATION_JSON)
	public Response getFileOpt(@PathParam("name") String name) {
		return ok();
	}

	@Path("/get-file-link/{name}")
	@GET
	@Produces(MediaType.APPLICATION_OCTET_STREAM)
	public Response getFile(@PathParam("name") String name) {

		try {
			String link = getFileLink(name);
			File file = new File(link);
			byte[] buffer = new byte[4096];
			BufferedInputStream bis = new BufferedInputStream(new FileInputStream(link));
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			int bytes = 0;
			while ((bytes = bis.read(buffer, 0, buffer.length)) > 0) {
				baos.write(buffer, 0, bytes);
			}
			baos.close();
			bis.close();
			byte[] imageData = baos.toByteArray();

			ResponseBuilder builder = Response.ok(imageData);
			builder.header("Access-Control-Allow-Origin", "*");
			builder.header("Content-Disposition", "attachment; filename=" + file.getName());

			return builder.build();
		} catch (Exception ex) {
			ex.printStackTrace();
			return null;
		}

	}

	@Path("/close-dataset")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response closeDatasetOpt() {
		return ok();
	}

	@Path("/close-dataset")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response closeDataset() {
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
			LinkedTreeMap ltm = (LinkedTreeMap) payload.get("dataset");
			Double id = (Double) ltm.get("id");
			DatasetBean bean = new DatasetBean();
			bean.setId(Math.round(id));
			bean.setProcessed(true);
			DatasetQuery datasetQuery = new DatasetQuery();
			String fileName = datasetQuery.updateProcessed(bean);
			deleteFile(fileName);
			datasetQuery.deleteCachedData(bean.getId());
			return ok(gson.toJson(RestResult.resultOk("" + gson.toJson(bean))));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	private DatasetBean toDataseteBean(LinkedTreeMap payload) {
		// ArrayList<LinkedTreeMap> dataset = (ArrayList<LinkedTreeMap>)
		// payload.get("dataset");
		LinkedTreeMap ltm = (LinkedTreeMap) payload.get("dataset");
		String ref = (String) ltm.get("ref");
		String authors = (String) ltm.get("authors");
		String fileName = (String) ltm.get("file");
		String year = "" + Commons.toInteger("" + ltm.get("year"));
		String keywords = (String) ltm.get("keywords");
		String metadata = (String) ltm.get("metadata");
		Gson gson = new Gson();
		DatasetBean sb = new DatasetBean();
		sb.setFileName(fileName);
		sb.setKeywords(keywords);
		sb.setLink(ref);
		sb.setAuthors(authors);
		// sb.setYear(Integer.valueOf(year));
		sb.setYear(Commons.toInteger(year));
		sb.setProcessed(false);
		sb.setMetadata(metadata);
		
		if (ltm.get("id") != null) {
			Integer id = Commons.toInteger("" + ltm.get("id"));
			if (id > 0)
				sb.setId(Long.valueOf(id));
		}
		return sb;
	}

	@Path("/get-available-dataset-list")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUnprocessedDatasets() {
		try {
			DatasetBean filter = new DatasetBean();
			String json = "";
			Gson gson = new Gson();
			ArrayList<DatasetBean> list = (new DatasetQuery()).getDatasets(filter, true);
			json = gson.toJson(list);
			return ok(json);
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	@Path("/get-years")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response geYears() {
		try {
			DatasetQuery dq = new DatasetQuery();
			ArrayList<Integer> list = dq.getYears();
			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(list);
			return ok(json);
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	@Path("/get-links")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getLinks() {
		try {
			DatasetQuery dq = new DatasetQuery();
			ArrayList<String> list = dq.getLinks();
			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(list);
			return ok(json);
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	@Path("/contentdir")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response contentDir() {
		try {
			ArrayList<String> list = Global.contentDir();
			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(list);
			return ok(json);
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	@Path("/process-file")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response processFile(@QueryParam("fileName") String name) {
		String key = null;
		ArrayList<String> sheets = null;
		try {
			if (name.toLowerCase().endsWith(".xlsx")) {
				key = Global.openXlsx(name);
				Xlsx xls = Global.getXlsx(key);
				sheets = xls.getSheets();
			} else if (name.toLowerCase().endsWith(".xls")) {
				key = Global.openXls(name);
				Xsl xls = Global.getXls(key);
				sheets = xls.getSheets();
			} else {
				// throw new Exception("Unsupported file type");
				return getUnprocessedDatasets();
			}

			ContentHelper ch = new ContentHelper();
			ch.key = key;
			ch.sheets = sheets;
			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(ch);
			return ok(json);

		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	@Path("/set-separator")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getContentWithSeparator(@QueryParam("fileName") String fileName,
			@QueryParam("separator") String separator) {
		char recordSeparator;
		if (separator.toLowerCase().equals("tab"))
			recordSeparator = '\t';
		else
			recordSeparator = separator.charAt(0);
		Csv csv = new Csv(Global.dataFolder + Global.fileSeparator + fileName, recordSeparator);
		return getContentCsv(csv);
	}

	@Path("/get-content-csv")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getContent(@QueryParam("fileName") String fileName) {
		Csv csv = new Csv(Global.dataFolder + Global.fileSeparator + fileName);
		return getContentCsv(csv);
	}

	private Response getContentCsv(Csv csv) {
		ArrayList<ArrayList<String>> content = null;
		try {
			content = csv.getContent();
			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(content);
			return ok(json);
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	@Path("/get-content-xls")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getContent(@QueryParam("sheet") String sheet, @QueryParam("key") String key) {
		try {
			if (Global.pool != null) {
				ArrayList<ArrayList<String>> content = null;
				Sheetx sheetx = Global.getSheet(key);
				if (sheetx instanceof Xlsx)
					content = ((Xlsx) sheetx).getContent(sheet);
				else
					content = ((Xsl) sheetx).getContent(sheet);
				boolean itineris = Commons.checkItinerisTemplate(content.get(0));
				if (true == itineris) {
					String doi = Commons.getDoi(content);
					ArrayList<AuthorBean> authors = Commons.getAuthors(content);
				}
				String json = "";
				Gson gson = new Gson();
				json = gson.toJson(content);
				return ok(json);
			} else {
				throw new Exception("Invalid request");
			}
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	@Path("/close-contentdir")
	@OPTIONS
	@Produces(MediaType.APPLICATION_JSON)
	public Response closeContentDir() {
		return ok();
	}

	@Path("/close-contentdir")
	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	public Response closeContentDir(@QueryParam("key") String key) {
		try {
			if (key != null && key.length() > 0)
				Global.releasXls(key);
			return ok();
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

	private void deleteFile(String fileName) {
		String file = Global.dataFolder + Global.fileSeparator + fileName;
		File f = new File(file);
		f.delete();
	}

	private String getFileLink(String fileName) {
		return Global.dataFolder + Global.fileSeparator + fileName;
	}

	@Path("/get-dataset-by-sample")
	@OPTIONS
	@Produces(MediaType.APPLICATION_JSON)
	public Response getDatasetBySampleOpt() {
		return ok();
	}

	@Path("/get-dataset-by-sample")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getDatasetBySample(@QueryParam("id") String id) {
		DatasetQuery dq = new DatasetQuery();
		Long nid = Long.parseLong(id);
		try {
			DatasetBean bean = dq.getDatasetBySampleId(nid);
			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(bean);
			return ok(json);
		} catch (Exception x) {
			return error(x.getMessage());
		}
	}

}