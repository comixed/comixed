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

import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.ComicDataAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFormat;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.comic.ScanType;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.model.messaging.EndOfList;
import org.comixedproject.model.net.UndeleteMultipleComicsRequest;
import org.comixedproject.model.net.UndeleteMultipleComicsResponse;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.comic.ComicFormatRepository;
import org.comixedproject.repositories.comic.ScanTypeRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.comic.PageCacheService;
import org.comixedproject.service.file.FileService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.task.model.DeleteComicsWorkerTask;
import org.comixedproject.task.model.RescanComicsWorkerTask;
import org.comixedproject.task.model.UndeleteComicsWorkerTask;
import org.comixedproject.task.runner.TaskManager;
import org.comixedproject.utils.FileTypeIdentifier;
import org.comixedproject.views.View;
import org.comixedproject.views.View.ComicDetailsView;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
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
  @Autowired private ObjectMapper objectMapper;

  @Autowired private ComicService comicService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private FileService fileService;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;
  @Autowired private ComicFormatRepository comicFormatRepository;
  @Autowired private ComicDataAdaptor comicDataAdaptor;
  @Autowired private TaskManager taskManager;
  @Autowired private ScanTypeRepository scanTypeRepository;
  @Autowired private ObjectFactory<DeleteComicsWorkerTask> deleteComicsWorkerTaskFactory;
  @Autowired private ObjectFactory<UndeleteComicsWorkerTask> undeleteComicsWorkerTaskObjectFactory;
  @Autowired private ObjectFactory<RescanComicsWorkerTask> rescanComicsWorkerTaskObjectFactory;
  @Autowired private ComicFileHandler comicFileHandler;

  /**
   * Loads the entire list of comics and sends them to the requesting user.
   *
   * @param principal the user principal
   */
  @MessageMapping(Constants.LOAD_COMIC_LIST_MESSAGE)
  public void loadComicList(final Principal principal) {
    log.info("Loading all comics for user: {}", principal.getName());
    this.comicService
        .loadComicList()
        .forEach(
            comic -> {
              log.trace("Sending comic to user: {}", comic.getId());
              try {
                this.messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    Constants.COMIC_LIST_UPDATE_TOPIC,
                    this.objectMapper
                        .writerWithView(ComicDetailsView.class)
                        .writeValueAsString(comic));
              } catch (JsonProcessingException error) {
                log.error("Could not send comic", error);
              }
            });
    this.messagingTemplate.convertAndSendToUser(
        principal.getName(), Constants.COMIC_LIST_UPDATE_TOPIC, EndOfList.MESSAGE);
  }

  /**
   * Retrieves a single comic for a user. The comic is populated with user-specific meta-data.
   *
   * @param principal the user principal
   * @param id the comic id
   * @return the comic
   * @throws ComicException if an error occurs
   */
  @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  public Comic getComic(Principal principal, @PathVariable("id") long id) throws ComicException {
    String email = principal.getName();
    log.info("Getting comic for user: id={} user={}", id, email);
    return this.comicService.getComic(id, email);
  }

  @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView({ComicDetailsView.class})
  @AuditableEndpoint
  public Comic deleteComic(@PathVariable("id") long id) throws ComicException {
    log.info("Marking comic for deletion: id={}", id);

    return this.comicService.deleteComic(id);
  }

  @DeleteMapping(value = "/{id}/metadata", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  public Comic deleteMetadata(@PathVariable("id") long id) throws ComicException {
    log.debug("Updating comic: id={}", id);

    Comic comic = this.comicService.getComic(id);

    if (comic != null) {
      log.debug("Clearing metadata for comic");
      this.comicDataAdaptor.clear(comic);
      log.debug("Saving updates to comic");
      this.comicService.save(comic);
    } else {
      log.debug("No such comic found");
    }

    return comic;
  }

  @PostMapping(value = "/multiple/delete")
  @AuditableEndpoint
  public boolean deleteMultipleComics(@RequestParam("comic_ids") List<Long> comicIds) {
    log.debug("Deleting multiple comics: ids={}", comicIds.toArray());

    DeleteComicsWorkerTask task = this.deleteComicsWorkerTaskFactory.getObject();

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
   * Starts the process of rescanning all comics in the library.
   *
   * @return the number of rescan tasks
   */
  @PostMapping(value = "/rescan")
  @AuditableEndpoint
  public int rescanComics() {
    log.info("Beginning rescan of library");

    final RescanComicsWorkerTask task = this.rescanComicsWorkerTaskObjectFactory.getObject();
    this.taskManager.runTask(task);
    return this.comicService.getRescanCount();
  }

  @PutMapping(value = "/{id}/format")
  @AuditableEndpoint
  public void setFormat(@PathVariable("id") long comicId, @RequestParam("format_id") long formatId)
      throws ComicException {
    log.debug("Setting format: comicId={} formatId={}", comicId, formatId);

    Comic comic = this.comicService.getComic(comicId);
    Optional<ComicFormat> formatRecord = this.comicFormatRepository.findById(formatId);

    if (comic != null && formatRecord.isPresent()) {
      comic.setFormat(formatRecord.get());
      log.debug("Saving updated format");
      this.comicService.save(comic);
    } else {
      log.debug("No such comic found");
    }
  }

  @PutMapping(value = "/{id}/scan_type")
  @AuditableEndpoint
  public void setScanType(
      @PathVariable("id") long comicId, @RequestParam("scan_type_id") long scanTypeId)
      throws ComicException {
    log.debug("Setting scan type: comicId={} scanTypeId={}", comicId, scanTypeId);

    Comic comic = this.comicService.getComic(comicId);
    Optional<ScanType> scanTypeRecord = this.scanTypeRepository.findById(scanTypeId);

    if (comic != null && scanTypeRecord.isPresent()) {
      comic.setScanType(scanTypeRecord.get());
      log.debug("Saving updated scan type");
      this.comicService.save(comic);
    } else {
      log.debug("No such comic found");
    }
  }

  @PutMapping(value = "/{id}/sort_name")
  @AuditableEndpoint
  public void setSortName(
      @PathVariable("id") long comicId, @RequestParam("sort_name") String sortName)
      throws ComicException {
    log.debug("Setting sort name: comicId={} sortName={}", comicId, sortName);

    Comic comic = this.comicService.getComic(comicId);

    if (comic != null) {
      comic.setSortName(sortName);
      log.debug("Saving updated sorted name");
      this.comicService.save(comic);
    } else {
      log.debug("No such comic found");
    }
  }

  @PutMapping(
      value = "/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  public Comic updateComic(@PathVariable("id") long id, @RequestBody() Comic comic) {
    log.info("Updating comic: id={}", id, comic);

    final Comic result = this.comicService.updateComic(id, comic);

    if (result == null) {
      log.error("No such comic");
    }

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

  @PutMapping(
      value = "/{id}/restore",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetailsView.class)
  @AuditableEndpoint
  public Comic restoreComic(@PathVariable("id") final long id) throws ComicException {
    log.info("Restoring comic: id={}", id);

    return this.comicService.restoreComic(id);
  }

  @PutMapping(
      value = "/{id}/read",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.UserDetailsView.class)
  @AuditableEndpoint
  public LastReadDate markAsRead(Principal principal, @PathVariable("id") Long id)
      throws ComicException, ComiXedUserException {
    String email = principal.getName();
    if (email == null) throw new ComicException("not authenticated");
    log.info("Marking comic as read for {}: id={}", email, id);

    return this.comicService.markAsRead(email, id);
  }

  @DeleteMapping(value = "/{id}/read", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public boolean markAsUnread(Principal principal, @PathVariable("id") Long id)
      throws ComicException, ComiXedUserException {
    String email = principal.getName();
    if (email == null) throw new ComicException("not authenticated");
    log.info("Marking comic as unread for {}: id={}", email, id);

    return this.comicService.markAsUnread(email, id);
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

    final UndeleteComicsWorkerTask task = this.undeleteComicsWorkerTaskObjectFactory.getObject();
    task.setIds(ids);
    this.taskManager.runTask(task);

    return new UndeleteMultipleComicsResponse(true);
  }
}
