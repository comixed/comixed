/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.opds;

import java.awt.image.BufferedImage;
import java.io.*;
import java.security.Principal;
import java.util.Optional;
import javax.imageio.ImageIO;
import lombok.extern.log4j.Log4j2;
import marvin.image.MarvinImage;
import marvinplugins.MarvinPluginCollection;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.repositories.comicbooks.ComicRepository;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * <code>OPDSController</code> provides the web interface for accessing the OPDS feeds.
 *
 * @author João França
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSController {
  public static final String FEED_HEADER = "Comics - ";
  @Autowired private ComicRepository comicRepository;
  @Autowired private ReadingListService readingListService;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicFileHandler comicFileHandler;

  @ResponseBody
  @GetMapping(value = "/opds-comics", produces = MediaType.APPLICATION_XML_VALUE)
  @CrossOrigin
  @AuditableEndpoint
  public OPDSFeed getNavigationFeed() {
    return new OPDSNavigationFeed();
  }

  @ResponseBody
  @GetMapping(value = "/opds-comics/all", produces = MediaType.APPLICATION_XML_VALUE)
  @CrossOrigin
  @AuditableEndpoint
  public OPDSFeed getAllComics() {
    return new OPDSAcquisitionFeed("/opds/all", FEED_HEADER, this.comicRepository.findAll());
  }

  @ResponseBody
  @GetMapping(
      value = "/opds/all",
      params = {"groupByFolder"},
      produces = MediaType.APPLICATION_XML_VALUE)
  @CrossOrigin
  @AuditableEndpoint
  public OPDSFeed getAllLists(Principal principal) throws ReadingListException {
    return new OPDSNavigationFeed(
        "/opds/all?groupByFolder=true",
        FEED_HEADER,
        this.readingListService.getReadingListsForUser(principal.getName()));
  }

  @ResponseBody
  @GetMapping(value = "/opds/{id}", produces = MediaType.APPLICATION_XML_VALUE)
  @CrossOrigin
  @AuditableEndpoint
  public OPDSFeed getList(Principal principal, @PathVariable("id") long id)
      throws ReadingListException {
    return new OPDSNavigationFeed(
        "/opds/" + id,
        FEED_HEADER,
        this.readingListService.getReadingListForUser(principal.getName(), id));
  }

  @GetMapping(value = "/opds/feed/comics/{id}/download/{filename}")
  @CrossOrigin
  @AuditableEndpoint
  public ResponseEntity<InputStreamResource> downloadComic(
      @PathVariable("id") long id, @PathVariable("filename") String filename) throws IOException {
    log.debug("Attempting to download comic: id={}", id);

    Optional<Comic> comicRecord = this.comicRepository.findById(id);

    if (!comicRecord.isPresent()) {
      log.error("No such comic");
      return null;
    }

    Comic comic = comicRecord.get();
    File file = new File(comic.getFilename());

    if (!file.exists() || !file.isFile()) {
      log.error("Missing or invalid comic file: {}", comic.getFilename());
      return null;
    }

    InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

    return ResponseEntity.ok()
        .contentLength(file.length())
        .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.parseMediaType(comic.getArchiveType().getMimeType()))
        .body(resource);
  }

  @GetMapping(value = "/opds/feed/comics/{id}/{index}/{maxWidth}")
  @CrossOrigin
  @AuditableEndpoint
  public ResponseEntity<byte[]> getImageInComicByIndex(
      @PathVariable("id") long id,
      @PathVariable("index") int index,
      @PathVariable("maxWidth") int maxWidth)
      throws IOException, ArchiveAdaptorException {
    log.debug("Getting the image for comic: id={} index={}", id, index);

    Optional<Comic> comicRecord = this.comicRepository.findById(id);

    if (comicRecord.isPresent() && (index < comicRecord.get().getPageCount())) {
      Page page = comicRecord.get().getPage(index);
      var adaptor = this.comicFileHandler.getArchiveAdaptorFor(page.getComic().getArchiveType());
      var content = adaptor.loadSingleFile(page.getComic(), page.getFilename());

      ByteArrayInputStream bais = new ByteArrayInputStream(content);
      BufferedImage image = ImageIO.read(bais);

      if (maxWidth != 0 && maxWidth < image.getWidth()) {
        MarvinImage unscaledImage = new MarvinImage(image);
        MarvinImage scaledImage = new MarvinImage();
        MarvinPluginCollection.scale(unscaledImage, scaledImage, maxWidth);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        BufferedImage buffered = scaledImage.getBufferedImage();
        ImageIO.write(buffered, "jpg", baos);
        baos.flush();
        content = baos.toByteArray();
        baos.close();
      }

      String type =
          this.fileTypeAdaptor.typeFor(new ByteArrayInputStream(content))
              + "/"
              + this.fileTypeAdaptor.subtypeFor(new ByteArrayInputStream(content));
      log.debug("Image {} mimetype: {}", index, type);
      return ResponseEntity.ok()
          .contentLength(content.length)
          .contentType(MediaType.valueOf(type))
          .body(content);
    }

    if (!comicRecord.isPresent()) {
      log.debug("Could now download page. No such comic: id={}", id);
    } else {
      log.debug("No such page: index={} page count={}", index, comicRecord.get().getPageCount());
    }

    return null;
  }
}
