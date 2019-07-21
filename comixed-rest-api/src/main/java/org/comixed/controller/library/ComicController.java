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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.adaptors.ComicDataAdaptor;
import org.comixed.model.library.Comic;
import org.comixed.model.library.ComicFormat;
import org.comixed.model.library.ScanType;
import org.comixed.model.state.LibraryStatus;
import org.comixed.model.user.LastReadDate;
import org.comixed.repositories.*;
import org.comixed.service.library.ComicService;
import org.comixed.tasks.DeleteComicsWorkerTask;
import org.comixed.tasks.RescanComicWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.views.View;
import org.comixed.views.View.ComicDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping(value = "/api/comics")
public class ComicController {
    protected static final Logger classLogger = LoggerFactory.getLogger(ComicController.class);

    private static final Object STATUS_SEMAPHORE = new Object();
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicService comicService;
    @Autowired private ComicRepository comicRepository;
    @Autowired private ComiXedUserRepository userRepository;
    @Autowired private LastReadDatesRepository lastReadRepository;
    @Autowired private ScanTypeRepository scanTypeRepository;
    @Autowired private ComicFormatRepository comicFormatRepository;
    @Autowired private ComicDataAdaptor comicDataAdaptor;
    @Autowired private Worker worker;
    @Autowired private ObjectFactory<RescanComicWorkerTask> rescanComicWorkerTaskFactory;
    @Autowired private ObjectFactory<DeleteComicsWorkerTask> deleteComicsWorkerTaskFactory;

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.DELETE)
    public boolean deleteComic(
            @PathVariable("id")
                    long id) {
        this.logger.info("Deleting comic: id={}",
                         id);

        final boolean result = this.comicService.deleteComic(id);

        this.logger.debug("Deletion was {}successful",
                          result
                          ? ""
                          : "un");

        return result;
    }

    @RequestMapping(value = "/{id}/metadata",
                    method = RequestMethod.DELETE)
    @JsonView(ComicDetails.class)
    public Comic deleteMetadata(
            @PathVariable("id")
                    long id) {
        this.logger.debug("Updating comic: id={}",
                          id);

        Comic comic = this.comicRepository.findById(id)
                                          .get();

        if (comic != null) {
            this.logger.debug("Clearing metadata for comic");
            this.comicDataAdaptor.clear(comic);
            this.logger.debug("Saving updates to comic");
            this.comicRepository.save(comic);
            ComicController.stopWaitingForStatus();
        } else {
            this.logger.debug("No such comic found");
        }

        return comic;
    }

    /**
     * Tells any pending status calls to wake up.
     */
    public static void stopWaitingForStatus() {
        classLogger.debug("Notifying all pending status calls to exit immediately...");
        synchronized (STATUS_SEMAPHORE) {
            STATUS_SEMAPHORE.notifyAll();
        }
    }

    @RequestMapping(value = "/multiple/delete",
                    method = RequestMethod.POST)
    public boolean deleteMultipleComics(
            @RequestParam("comic_ids")
                    List<Long> comicIds) {
        this.logger.debug("Deleting multiple comics: ids={}",
                          comicIds.toArray());

        DeleteComicsWorkerTask task = this.deleteComicsWorkerTaskFactory.getObject();

        this.logger.debug("Setting comic ids");
        task.setComicIds(comicIds);

        this.logger.debug("Queueing the delete task");
        this.worker.addTasksToQueue(task);

        return true;
    }

    @RequestMapping(value = "/{id}/download",
                    method = RequestMethod.GET)
    public ResponseEntity<InputStreamResource> downloadComic(
            @PathVariable("id")
                    long id)
            throws
            FileNotFoundException,
            IOException {
        this.logger.info("Preparing to download comic: id={}",
                         id);

        final Comic comic = this.comicService.getComic(id);
        if (comic == null) {
            this.logger.error("No such comic");
            return null;
        }

        final byte[] content = this.comicService.getComicContent(comic);
        if (content == null) {
            this.logger.error("No comic content found");
            return null;
        }

        return ResponseEntity.ok()
                             .contentLength(content.length)
                             .header("Content-Disposition",
                                     "attachment; filename=\"" + comic.getFilename() + "\"")
                             .contentType(MediaType.parseMediaType(comic.getArchiveType()
                                                                        .getMimeType()))
                             .body(new InputStreamResource(new ByteArrayInputStream(content)));
    }

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.GET)
    @JsonView(ComicDetails.class)
    public Comic getComic(
            @PathVariable("id")
                    long id) {
        this.logger.info("Getting comic: id={}",
                         id);

        final Comic result = this.comicService.getComic(id);

        if (result == null) {
            this.logger.error("No such comic");
        }

        return result;
    }

    @RequestMapping(value = "/formats",
                    method = RequestMethod.GET)
    public Iterable<ComicFormat> getComicFormats() {
        this.logger.debug("Fetching all comic format types");
        return this.comicFormatRepository.findAll();
    }

    @RequestMapping(value = "/since/{timestamp}",
                    method = RequestMethod.GET)
    @JsonView(View.ComicList.class)
    public LibraryStatus getComicsAddedSince(Principal principal,
                                             @PathVariable("timestamp")
                                                     long timestamp,
                                             @RequestParam(value = "timeout",
                                                           required = false,
                                                           defaultValue = "0")
                                                     long timeout)
            throws
            InterruptedException {
        final String email = principal.getName();
        final Date lastUpdated = new Date(timestamp);
        final long latestCheck = System.currentTimeMillis() + timeout;
        boolean done = false;

        this.logger.info("Getting library updates: user={} timestamp={}",
                         email,
                         lastUpdated);

        List<Comic> comics = null;
        List<LastReadDate> lastReadDates = null;
        int importCount = 0;
        int rescanCount = 0;
        boolean firstRun = true;

        while (!done) {
            if (System.currentTimeMillis() >= latestCheck) {
                this.logger.debug("Timed out checking for library updates");
                done = true;
            } else {
                if (!firstRun) {
                    synchronized (STATUS_SEMAPHORE) {
                        this.logger.debug("Sleeping for 1000ms");
                        STATUS_SEMAPHORE.wait(1000);
                    }
                }
                firstRun = false;
                comics = this.comicService.getComicsAddedSince(timestamp);
                this.logger.debug("Found {} new or updated comic{}",
                                  comics.size(),
                                  comics.size() == 1
                                  ? ""
                                  : "s");
                lastReadDates = this.comicService.getLastReadDatesSince(email,
                                                                        timestamp);
                this.logger.debug("Found {} updated last read record{}",
                                  lastReadDates.size(),
                                  lastReadDates.size() == 1
                                  ? ""
                                  : "s");
                importCount = this.comicService.getImportCount();
                this.logger.debug("Import count: {}",
                                  importCount);
                rescanCount = this.comicService.getRescanCount();
                this.logger.debug("Rescan count: {}",
                                  rescanCount);

                done = !comics.isEmpty() || !lastReadDates.isEmpty() || (importCount > 0) || (rescanCount > 0);
            }
        }

        if (comics == null) {
            comics = new ArrayList<>();
        }
        if (lastReadDates == null) {
            lastReadDates = new ArrayList<>();
        }

        return new LibraryStatus(comics,
                                 lastReadDates,
                                 rescanCount,
                                 importCount);
    }

    @RequestMapping(value = "/scan_types",
                    method = RequestMethod.GET)
    public Iterable<ScanType> getScanTypes() {
        this.logger.debug("Fetching all scan types");
        return this.scanTypeRepository.findAll();
    }

    @RequestMapping(value = "/rescan",
                    method = RequestMethod.POST)
    public void rescanComics() {
        this.logger.debug("Rescanning comics in the library");

        ComicController.stopWaitingForStatus();

        Iterable<Comic> comics = this.comicRepository.findAll();

        for (Comic comic : comics) {
            this.logger.debug("Queueing comic for rescan: {}",
                              comic.getFilename());
            RescanComicWorkerTask task = this.rescanComicWorkerTaskFactory.getObject();

            task.setComic(comic);
            this.worker.addTasksToQueue(task);
        }
    }

    @RequestMapping(value = "/{id}/format",
                    method = RequestMethod.PUT)
    public void setFormat(
            @PathVariable("id")
                    long comicId,
            @RequestParam("format_id")
                    long formatId) {
        this.logger.debug("Setting format: comicId={} formatId={}",
                          comicId,
                          formatId);

        Comic comic = this.comicRepository.findById(comicId)
                                          .get();
        ComicFormat format = this.comicFormatRepository.findById(formatId)
                                                       .get();

        if (comic != null) {
            comic.setFormat(format);
            this.logger.debug("Saving update to comic");
            this.comicRepository.save(comic);
        } else {
            this.logger.debug("No such comic found");
        }
    }

    @RequestMapping(value = "/{id}/scan_type",
                    method = RequestMethod.PUT)
    public void setScanType(
            @PathVariable("id")
                    long comicId,
            @RequestParam("scan_type_id")
                    long scanTypeId) {
        this.logger.debug("Setting scan type: comicId={} scanTypeId={}",
                          comicId,
                          scanTypeId);

        Comic comic = this.comicRepository.findById(comicId)
                                          .get();
        ScanType scanType = this.scanTypeRepository.findById(scanTypeId)
                                                   .get();

        if (comic != null) {
            comic.setScanType(scanType);
            this.logger.debug("Saving update to comic");
            this.comicRepository.save(comic);
        } else {
            this.logger.debug("No such comic found");
        }
    }

    @RequestMapping(value = "/{id}/sort_name",
                    method = RequestMethod.PUT)
    public void setSortName(
            @PathVariable("id")
                    long comicId,
            @RequestParam("sort_name")
                    String sortName) {
        this.logger.debug("Setting sort name: comicId={} sortName={}",
                          comicId,
                          sortName);

        Comic comic = this.comicRepository.findById(comicId)
                                          .get();

        if (comic != null) {
            comic.setSortName(sortName);
            this.logger.debug("Saving update to comic");
            this.comicRepository.save(comic);
        } else {
            this.logger.debug("No such comic found");
        }
    }

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.PUT)
    public Comic updateComic(
            @PathVariable("id")
                    long id,
            @RequestParam("series")
                    String series,
            @RequestParam("volume")
                    String volume,
            @RequestParam("issue_number")
                    String issueNumber) {
        this.logger.info("Updating comic: id={} series={} volume={} issue number={}",
                         id,
                         series,
                         volume,
                         issueNumber);

        final Comic result = this.comicService.updateComic(id,
                                                           series,
                                                           volume,
                                                           issueNumber);

        if (result == null) {
            this.logger.error("No such comic");
        }

        return result;
    }
}
