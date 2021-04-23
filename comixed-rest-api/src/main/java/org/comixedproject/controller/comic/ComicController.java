/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project.
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

package org.comixedproject.controller.comic;

import static org.comixedproject.model.messaging.Constants.COMIC_LIST_UPDATE_TOPIC;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.net.UndeleteMultipleComicsRequest;
import org.comixedproject.model.net.UndeleteMultipleComicsResponse;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.comic.PageCacheService;
import org.comixedproject.service.file.FileService;
import org.comixedproject.task.DeleteComicsTask;
import org.comixedproject.task.UndeleteComicsTask;
import org.comixedproject.task.runner.TaskManager;
import org.comixedproject.utils.FileTypeIdentifier;
import org.comixedproject.views.View.ComicDetailsView;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ComicController</code> provides REST endpoints for instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping(value = "/api/comics")
@Log4j2
public class ComicController {
  @Autowired private SimpMessagingTemplate messagingTemplate;
  @Autowired private ComicService comicService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private FileService fileService;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;
  @Autowired private TaskManager taskManager;
  @Autowired private ObjectFactory<DeleteComicsTask> deleteComicsWorkerTaskFactory;
  @Autowired private ObjectFactory<UndeleteComicsTask> undeleteComicsWorkerTaskObjectFactory;
  @Autowired private ComicFileHandler comicFileHandler;

  /**
   * Retrieves a single comic for a user. The comic is populated with user-specific meta-data.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicException if an error occurs
   */
  @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  public Comic getComic(@PathVariable("id") long id) throws ComicException {
    log.info("Getting comic: id={}", id);
    return this.comicService.getComic(id);
  }

  /**
   * Marks a comic for deletion.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicException if the id is invalid
   */
  @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView({ComicDetailsView.class})
  @AuditableEndpoint
  @SendTo(COMIC_LIST_UPDATE_TOPIC)
  public Comic deleteComic(@PathVariable("id") long id) throws ComicException {
    log.info("Marking comic for deletion: id={}", id);

    return this.comicService.deleteComic(id);
  }

  /**
   * Removes all metadata from a comic.
   *
   * @param id the comic id
   * @return the upddtaed comic
   * @throws ComicException if the id is invalid
   */
  @DeleteMapping(value = "/{id}/metadata", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  @SendTo(COMIC_LIST_UPDATE_TOPIC)
  public Comic deleteMetadata(@PathVariable("id") long id) throws ComicException {
    log.debug("Deleting comic metadata: id={}", id);
    return this.comicService.deleteMetadata(id);
  }

  @PostMapping(value = "/multiple/delete")
  @AuditableEndpoint
  public boolean deleteMultipleComics(@RequestParam("comic_ids") List<Long> comicIds) {
    log.debug("Deleting multiple comics: ids={}", comicIds.toArray());

    DeleteComicsTask task = this.deleteComicsWorkerTaskFactory.getObject();

    log.debug("Setting comic ids");
    task.setComicIds(comicIds);

    log.debug("Queueing the delete task");
    this.taskManager.runTask(task);

    return true;
  }

  @GetMapping(value = "/{id}/download")
  @AuditableEndpoint
  public ResponseEntity<InputStreamResource> downloadComic(@PathVariable("id") long id)
      throws IOException, ComicException {
    log.info("Preparing to download comic: id={}", id);

    final Comic comic = this.comicService.getComic(id);
    if (comic == null) {
      log.error("No such comic");
      return null;
    }

    final byte[] content = this.comicService.getComicContent(comic);
    if (content == null) {
      log.error("No comic content found");
      return null;
    }

    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + comic.getFilename() + "\"")
        .contentType(MediaType.parseMediaType(comic.getArchiveType().getMimeType()))
        .body(new InputStreamResource(new ByteArrayInputStream(content)));
  }

  /**
   * Updates a comic with all incoming data.
   *
   * @param id the comic id
   * @param comic the source comic
   * @return the updated comic
   * @throws ComicException if the id is invalid
   */
  @PutMapping(
      value = "/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  public Comic updateComic(@PathVariable("id") long id, @RequestBody() Comic comic)
      throws ComicException {
    log.info("Updating comic: id={}", id, comic);

    final Comic result = this.comicService.updateComic(id, comic);
    this.messagingTemplate.convertAndSend(COMIC_LIST_UPDATE_TOPIC, result);
    return result;
  }

  @GetMapping(value = "/{id}/cover/content")
  @AuditableEndpoint
  public ResponseEntity<byte[]> getCoverImage(@PathVariable("id") final long id)
      throws ComicException, ArchiveAdaptorException, ComicFileHandlerException, IOException {
    log.info("Getting cover for comic: id={}", id);
    final Comic comic = this.comicService.getComic(id);

    if (comic.isMissing()) {
      throw new ComicException("comic file is missing: " + comic.getFilename());
    }

    if (comic.getPageCount() > 0) {
      final String filename = comic.getPage(0).getFilename();
      final Page page = comic.getPage(0);
      log.debug("Looking for cached image: hash={}", page.getHash());
      byte[] content = this.pageCacheService.findByHash(page.getHash());
      if (content == null) {
        log.debug("Loading page from archive");
        final ArchiveAdaptor archiveAdaptor =
            this.comicFileHandler.getArchiveAdaptorFor(comic.getFilename());
        if (archiveAdaptor == null) {
          throw new ComicFileHandlerException("no archive adaptor found");
        }
        content = archiveAdaptor.loadSingleFile(comic, filename);
        this.pageCacheService.saveByHash(page.getHash(), content);
      }
      log.debug("Returning comic cover: filename={} size={}", filename, content.length);
      return this.getResponseEntityForImage(content, filename);
    } else {
      log.debug("Comic is unprocessed; getting the first image instead");
      return this.getResponseEntityForImage(
          this.fileService.getImportFileCover(comic.getFilename()), "cover-image");
    }
  }

  private ResponseEntity<byte[]> getResponseEntityForImage(byte[] content, String filename) {
    final ByteArrayInputStream inputStream = new ByteArrayInputStream(content);
    String type =
        this.fileTypeIdentifier.typeFor(inputStream)
            + "/"
            + this.fileTypeIdentifier.subtypeFor(inputStream);
    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.valueOf(type))
        .body(content);
  }

  /**
   * Unmarks a comic for deletion.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicException if the id is invalid
   */
  @PutMapping(
      value = "/{id}/restore",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  @SendTo(COMIC_LIST_UPDATE_TOPIC)
  public Comic restoreComic(@PathVariable("id") final long id) throws ComicException {
    log.info("Restoring comic: id={}", id);

    return this.comicService.restoreComic(id);
  }

  @PostMapping(
      value = "/multiple/undelete",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public UndeleteMultipleComicsResponse undeleteMultipleComics(
      @RequestBody() final UndeleteMultipleComicsRequest request) {
    final List<Long> ids = request.getIds();
    log.debug("Undeleting {} comic{}", ids.size(), ids.size() == 1 ? "" : "s");

    final UndeleteComicsTask task = this.undeleteComicsWorkerTaskObjectFactory.getObject();
    task.setIds(ids);
    this.taskManager.runTask(task);

    return new UndeleteMultipleComicsResponse(true);
  }
}
