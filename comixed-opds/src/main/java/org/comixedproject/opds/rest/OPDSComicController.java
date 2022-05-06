/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.opds.rest;

import java.awt.image.BufferedImage;
import java.io.*;
import javax.imageio.ImageIO;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.encoders.WebResponseEncoder;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.auditlog.rest.AuditableRestEndpoint;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicException;
import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>OPDSComicController</code> provides REST APIs for retrieving comics via OPDS.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSComicController {
  @Autowired private ComicBookService comicBookService;
  @Autowired private WebResponseEncoder webResponseEncoder;
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;

  /**
   * Retrieves a specific comic by record id.
   *
   * @param id the record id
   * @param filename the filename
   * @return the comic content
   * @throws OPDSException if an error occurs
   */
  @GetMapping(value = "/opds/comics/{id}/content/{filename}")
  @AuditableRestEndpoint
  @ResponseBody
  public ResponseEntity<InputStreamResource> downloadComic(
      @PathVariable("id") long id, @PathVariable("filename") final String filename)
      throws OPDSException {
    try {
      log.info("Downloading comicBook: id={} filename={}", id, filename);
      ComicBook comicBook = this.comicBookService.getComic(id);
      log.trace("Returning encoded file: {}", comicBook.getFilename());
      return this.webResponseEncoder.encode(
          (int) comicBook.getFile().length(),
          new InputStreamResource(new FileInputStream(comicBook.getFile())),
          comicBook.getBaseFilename(),
          MediaType.parseMediaType(comicBook.getArchiveType().getMimeType()));
    } catch (ComicException | FileNotFoundException error) {
      throw new OPDSException("Failed to download comic: id=" + id, error);
    }
  }

  /**
   * Loads a single page from a comic.
   *
   * @param id the comic id
   * @param index the page index
   * @param maxWidth the max width
   * @return the page content
   * @throws OPDSException if an error occurs loading the page data
   */
  @GetMapping(value = "/opds/comics/{id}/pages/{index}/{maxWidth}")
  @AuditableRestEndpoint
  public ResponseEntity<byte[]> getPageByComicAndIndexWithMaxWidth(
      @PathVariable("id") long id,
      @PathVariable("index") int index,
      @PathVariable("maxWidth") int maxWidth)
      throws OPDSException {
    try {
      log.trace("Getting page content");
      var comic = this.comicBookService.getComic(id);
      if (index >= comic.getPages().size()) throw new OPDSException("Invalid page: index=" + index);
      var page = comic.getPages().get(index);
      byte[] content = this.comicBookAdaptor.loadPageContent(comic, index);

      if (maxWidth > 0 && page.getWidth() > maxWidth) {
        log.trace("Scaling page");
        ByteArrayInputStream bais = new ByteArrayInputStream(content);
        BufferedImage originalImage = ImageIO.read(bais);
        BufferedImage resizedImage =
            Scalr.resize(
                originalImage, Scalr.Method.ULTRA_QUALITY, Scalr.Mode.FIT_TO_WIDTH, maxWidth);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "jpg", baos);
        baos.flush();
        content = baos.toByteArray();

        baos.close();
      }

      final InputStream baos = new ByteArrayInputStream(content);
      String type =
          this.fileTypeAdaptor.getType(baos) + "/" + this.fileTypeAdaptor.getSubtype(baos);
      return this.webResponseEncoder.encode(
          content.length, content, page.getFilename(), MediaType.valueOf(type));
    } catch (ComicException | IOException | AdaptorException error) {
      throw new OPDSException("Failed to get comic page: id=" + id + " index=" + index, error);
    }
  }
}
