package it.cnr.igg.rest;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.ws.rs.Consumes;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import it.cnr.igg.helper.Global;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.models.MetaBean;

@Path("")
public class FileUploader extends ResultBuilder {
	@Path("/upload")
	@OPTIONS
	@Produces(MediaType.APPLICATION_JSON)
	public Response insertOpt() {
		return ok("");
	}

	@POST
	@Path("/upload")
	@Consumes({ MediaType.MULTIPART_FORM_DATA })
	@Produces(MediaType.APPLICATION_JSON)
	public Response uploadFile(@FormDataParam("file") InputStream fileInputStream,
			@FormDataParam("file") FormDataContentDisposition fileMetaData) throws IOException {
		OutputStream out = null;
		try {
			int read = 0;
			byte[] bytes = new byte[1024];

			out = new FileOutputStream(new File(Global.dataFolder + Global.fileSeparator + fileMetaData.getFileName()));
			while ((read = fileInputStream.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			out.flush();
			out.close();
		} catch (Exception e) {
			e.printStackTrace();
			return error(e.getMessage());
		} finally {
			if (out != null) 
				out.close();
		}
		return ok();
	}
	
	@Path("/metadataup")
	@OPTIONS
	@Produces(MediaType.APPLICATION_JSON)
	public Response uploadMetadataOpt() {
		return ok("");
	}
	
	@POST
	@Path("/metadataup")
	@Consumes({ MediaType.MULTIPART_FORM_DATA })
	@Produces(MediaType.APPLICATION_JSON)
	public Response uploadMetadata(@FormDataParam("file") InputStream fileInputStream,
			@FormDataParam("file") FormDataContentDisposition fileMetaData) throws IOException {
		OutputStream out = null;
		MetaBean bean = new MetaBean();
		try {
			int read = 0;
			byte[] bytes = new byte[1024];

			out = new ByteArrayOutputStream ();
			while ((read = fileInputStream.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			out.close();
			String content = out.toString();
			bean.setMeta(content);
		} catch (Exception e) {
			e.printStackTrace();
			return error(e.getMessage());
		} finally {
			if (out != null) 
				out.close();
		}
		return ok(bean);
	}	

}
