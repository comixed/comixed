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

package org.comixed.controller.comic;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixed.adaptors.ComicDataAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.comic.Comic;
import org.comixed.model.comic.ComicFormat;
import org.comixed.model.comic.Page;
import org.comixed.model.comic.ScanType;
import org.comixed.model.user.LastReadDate;
import org.comixed.net.GetLibraryUpdatesRequest;
import org.comixed.net.GetLibraryUpdatesResponse;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.comic.ComicFormatRepository;
import org.comixed.repositories.comic.ScanTypeRepository;
import org.comixed.repositories.library.LastReadDatesRepository;
import org.comixed.service.comic.ComicException;
import org.comixed.service.comic.ComicService;
import org.comixed.service.comic.PageCacheService;
import org.comixed.service.file.FileService;
import org.comixed.task.model.DeleteComicsWorkerTask;
import org.comixed.task.runner.Worker;
import org.comixed.utils.FileTypeIdentifier;
import org.comixed.views.View;
import org.comixed.views.View.ComicDetails;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/comics")
@Log4j2
public class ComicController {
  private static final Object STATUS_SEMAPHORE = new Object();

  @Autowired private ComicService comicService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private FileService fileService;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private LastReadDatesRepository lastReadRepository;
  @Autowired private ScanTypeRepository scanTypeRepository;
  @Autowired private ComicFormatRepository comicFormatRepository;
  @Autowired private ComicDataAdaptor comicDataAdaptor;
  @Autowired private Worker worker;
  @Autowired private ObjectFactory<DeleteComicsWorkerTask> deleteComicsWorkerTaskFactory;

  @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView({View.ComicDetails.class})
  public Comic deleteComic(@PathVariable("id") long id) throws ComicException {
    this.log.info("Marking comic for deletion: id={}", id);

    return this.comicService.deleteComic(id);
  }

  @DeleteMapping(value = "/{id}/metadata", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetails.class)
  public Comic deleteMetadata(@PathVariable("id") long id) throws ComicException {
    this.log.debug("Updating comic: id={}", id);

    Comic comic = this.comicService.getComic(id);

    if (comic != null) {
      this.log.debug("Clearing metadata for comic");
      this.comicDataAdaptor.clear(comic);
      this.log.debug("Saving updates to comic");
      this.comicService.save(comic);
      ComicController.stopWaitingForStatus();
    } else {
      this.log.debug("No such comic found");
    }

    return comic;
  }

  /** Tells any pending status calls to wake up. */
  public static void stopWaitingForStatus() {
    synchronized (STATUS_SEMAPHORE) {
      STATUS_SEMAPHORE.notifyAll();
    }
  }

  @PostMapping(value = "/multiple/delete")
  public boolean deleteMultipleComics(@RequestParam("comic_ids") List<Long> comicIds) {
    this.log.debug("Deleting multiple comics: ids={}", comicIds.toArray());

    DeleteComicsWorkerTask task = this.deleteComicsWorkerTaskFactory.getObject();

    this.log.debug("Setting comic ids");
    task.setComicIds(comicIds);

    this.log.debug("Queueing the delete task");
    this.worker.addTasksToQueue(task);

    return true;
  }

  @GetMapping(value = "/{id}/download")
  public ResponseEntity<InputStreamResource> downloadComic(@PathVariable("id") long id)
      throws IOException, ComicException {
    this.log.info("Preparing to download comic: id={}", id);

    final Comic comic = this.comicService.getComic(id);
    if (comic == null) {
      this.log.error("No such comic");
      return null;
    }

    final byte[] content = this.comicService.getComicContent(comic);
    if (content == null) {
      this.log.error("No comic content found");
      return null;
    }

    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + comic.getFilename() + "\"")
        .contentType(MediaType.parseMediaType(comic.getArchiveType().getMimeType()))
        .body(new InputStreamResource(new ByteArrayInputStream(content)));
  }

  @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(ComicDetails.class)
  public Comic getComic(@PathVariable("id") long id) throws ComicException {
    this.log.info("Getting comic: id={}", id);

    final Comic result = this.comicService.getComic(id);

    if (result == null) {
      this.log.error("No such comic");
    }

    return result;
  }

  @GetMapping(value = "/formats")
  public Iterable<ComicFormat> getComicFormats() {
    this.log.debug("Fetching all comic format types");
    return this.comicFormatRepository.findAll();
  }

  @PostMapping(
      value = "/since/{timestamp}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicList.class)
  public GetLibraryUpdatesResponse getComicsUpdatedSince(
      Principal principal,
      @PathVariable("timestamp") long timestamp,
      @RequestBody() GetLibraryUpdatesRequest request)
      throws InterruptedException {
    final String email = principal.getName();
    final Date lastUpdated = new Date(timestamp);
    final long timeout = request.getTimeout();
    final int maximumResults = request.getMaximumResults();
    final long latestCheck = System.currentTimeMillis() + (timeout * 1000L);

    boolean done = false;

    this.log.info("Getting library updates: user={} timestamp={}", email, lastUpdated);

    List<Comic> comics = null;
    List<LastReadDate> lastReadDates = null;
    long processCount = 0;
    int rescanCount = 0;
    boolean firstRun = true;

    while (!done) {
      if (System.currentTimeMillis() >= latestCheck) {
        this.log.debug("Timed out checking for library updates");
        done = true;
      } else {
        if (!firstRun) {
          synchronized (STATUS_SEMAPHORE) {
            this.log.debug("Sleeping for 1000ms");
            STATUS_SEMAPHORE.wait(1000);
          }
        }
        firstRun = false;
        comics = this.comicService.getComicsUpdatedSince(timestamp, maximumResults);
        this.log.debug(
            "Found {} new or updated comic{}", comics.size(), comics.size() == 1 ? "" : "s");
        lastReadDates = this.comicService.getLastReadDatesSince(email, timestamp);
        this.log.debug(
            "Found {} updated last read record{}",
            lastReadDates.size(),
            lastReadDates.size() == 1 ? "" : "s");
        processCount = this.comicService.getProcessingCount();
        this.log.debug("Import count: {}", processCount);
        rescanCount = this.comicService.getRescanCount();
        this.log.debug("Rescan count: {}", rescanCount);

        done =
            !comics.isEmpty()
                || !lastReadDates.isEmpty()
                || (processCount != request.getLastProcessingCount())
                || (rescanCount != request.getLastRescanCount());
      }
    }

    if (comics == null) {
      comics = new ArrayList<>();
    }
    if (lastReadDates == null) {
      lastReadDates = new ArrayList<>();
    }

    return new GetLibraryUpdatesResponse(comics, lastReadDates, rescanCount, processCount);
  }

  @GetMapping(value = "/scan_types")
  public Iterable<ScanType> getScanTypes() {
    this.log.debug("Fetching all scan types");
    return this.scanTypeRepository.findAll();
  }

  @PostMapping(value = "/rescan")
  public int rescanComics() {
    this.log.info("Beginning rescan of library");

    final int result = this.comicService.rescanComics();

    ComicController.stopWaitingForStatus();

    this.log.debug("Returning: {}", result);

    return result;
  }

  @PutMapping(value = "/{id}/format")
  public void setFormat(@PathVariable("id") long comicId, @RequestParam("format_id") long formatId)
      throws ComicException {
    this.log.debug("Setting format: comicId={} formatId={}", comicId, formatId);

    Comic comic = this.comicService.getComic(comicId);
    Optional<ComicFormat> formatRecord = this.comicFormatRepository.findById(formatId);

    if (comic != null && formatRecord.isPresent()) {
      comic.setFormat(formatRecord.get());
      this.log.debug("Saving updated format");
      this.comicService.save(comic);
    } else {
      this.log.debug("No such comic found");
    }
  }

  @PutMapping(value = "/{id}/scan_type")
  public void setScanType(
      @PathVariable("id") long comicId, @RequestParam("scan_type_id") long scanTypeId)
      throws ComicException {
    this.log.debug("Setting scan type: comicId={} scanTypeId={}", comicId, scanTypeId);

    Comic comic = this.comicService.getComic(comicId);
    Optional<ScanType> scanTypeRecord = this.scanTypeRepository.findById(scanTypeId);

    if (comic != null && scanTypeRecord.isPresent()) {
      comic.setScanType(scanTypeRecord.get());
      this.log.debug("Saving updated scan type");
      this.comicService.save(comic);
    } else {
      this.log.debug("No such comic found");
    }
  }

  @PutMapping(value = "/{id}/sort_name")
  public void setSortName(
      @PathVariable("id") long comicId, @RequestParam("sort_name") String sortName)
      throws ComicException {
    this.log.debug("Setting sort name: comicId={} sortName={}", comicId, sortName);

    Comic comic = this.comicService.getComic(comicId);

    if (comic != null) {
      comic.setSortName(sortName);
      this.log.debug("Saving updated sorted name");
      this.comicService.save(comic);
    } else {
      this.log.debug("No such comic found");
    }
  }

  @PutMapping(
      value = "/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicDetails.class)
  public Comic updateComic(@PathVariable("id") long id, @RequestBody() Comic comic) {
    this.log.info("Updating comic: id={}", id, comic);

    final Comic result = this.comicService.updateComic(id, comic);

    if (result == null) {
      this.log.error("No such comic");
    }

    return result;
  }

  @GetMapping(value = "/{id}/cover/content")
  public ResponseEntity<byte[]> getCoverImage(@PathVariable("id") final long id)
      throws ComicException, ArchiveAdaptorException, ComicFileHandlerException, IOException {
    this.log.info("Getting cover for comic: id={}", id);
    final Comic comic = this.comicService.getComic(id);

    if (comic.isMissing()) {
      throw new ComicException("comic file is missing: " + comic.getFilename());
    }

    if (comic.getPageCount() > 0) {
      final String filename = comic.getPage(0).getFilename();
      final Page page = comic.getPage(0);
      this.log.debug("Looking for cached image: hash={}", page.getHash());
      byte[] content = this.pageCacheService.findByHash(page.getHash());
      if (content == null) {
        this.log.debug("Loading page from archive");
        content = comic.getPage(0).getContent();
        this.pageCacheService.saveByHash(page.getHash(), content);
      }
      this.log.debug("Returning comic cover: filename={} size={}", filename, content.length);
      return this.getResponseEntityForImage(content, filename);
    } else {
      this.log.debug("Comic is unprocessed; getting the first image instead");
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
  @JsonView(View.ComicDetails.class)
  public Comic restoreComic(@PathVariable("id") final long id) throws ComicException {
    this.log.info("Restoring comic: id={}", id);

    return this.comicService.restoreComic(id);
  }
}
