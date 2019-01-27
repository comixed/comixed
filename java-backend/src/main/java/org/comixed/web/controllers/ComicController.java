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

package org.comixed.web.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.Principal;
import java.util.Date;
import java.util.List;

import org.comixed.library.metadata.ComicDataAdaptor;
import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFormat;
import org.comixed.library.model.LibraryStatus;
import org.comixed.library.model.ScanType;
import org.comixed.library.model.View;
import org.comixed.library.model.View.ComicDetails;
import org.comixed.library.model.user.LastReadDate;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ComicFormatRepository;
import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.LastReadDatesRepository;
import org.comixed.repositories.ScanTypeRepository;
import org.comixed.tasks.AddComicWorkerTask;
import org.comixed.tasks.RescanComicWorkerTask;
import org.comixed.tasks.Worker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonView;

@RestController
@RequestMapping(value = "/api/comics")
public class ComicController
{
    protected static final Logger classLogger = LoggerFactory.getLogger(ComicController.class);

    private static final Object STATUS_SEMAPHORE = new Object();

    /**
     * Tells any pending status calls to wake up.
     */
    public static void stopWaitingForStatus()
    {
        classLogger.debug("Notifying all pending status calls to exit immediately...");
        synchronized (STATUS_SEMAPHORE)
        {
            STATUS_SEMAPHORE.notifyAll();
        }
    }

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private ComiXedUserRepository userRepository;

    @Autowired
    private LastReadDatesRepository lastReadRepository;

    @Autowired
    private ScanTypeRepository scanTypeRepository;

    @Autowired
    private ComicFormatRepository comicFormatRepository;

    @Autowired
    private ComicDataAdaptor comicDataAdaptor;

    @Autowired
    private Worker worker;

    @Autowired
    private ObjectFactory<RescanComicWorkerTask> taskFactory;

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.DELETE)
    public boolean deleteComic(@PathVariable("id") long id)
    {
        this.logger.debug("Preparing to delete comic: id={}", id);

        Comic comic = this.comicRepository.findById(id).get();

        if (comic == null)
        {
            this.logger.debug("No such comic: id={}", id);
            return false;
        }
        else
        {
            this.comicRepository.delete(comic);
            this.logger.debug("Comic deleted: id={}", id);
            ComicController.stopWaitingForStatus();
            return true;
        }
    }

    @RequestMapping(value = "/{id}/metadata",
                    method = RequestMethod.DELETE)
    @JsonView(ComicDetails.class)
    public Comic deleteMetadata(@PathVariable("id") long id)
    {
        this.logger.debug("Updating comic: id={}", id);

        Comic comic = this.comicRepository.findById(id).get();

        if (comic != null)
        {
            this.logger.debug("Clearing metadata for comic");
            this.comicDataAdaptor.clear(comic);
            this.logger.debug("Saving updates to comic");
            this.comicRepository.save(comic);
            ComicController.stopWaitingForStatus();
        }
        else
        {
            this.logger.debug("No such comic found");
        }

        return comic;
    }

    @RequestMapping(value = "/{id}/download",
                    method = RequestMethod.GET)
    public ResponseEntity<InputStreamResource> downloadComic(@PathVariable("id") long id) throws FileNotFoundException,
                                                                                          IOException
    {
        this.logger.debug("Attempting to download comic: id={}", id);

        Comic comic = this.comicRepository.findById(id).get();

        if (comic == null)
        {
            this.logger.error("No such comic");
            return null;
        }

        File file = new File(comic.getFilename());

        if (!file.exists() || !file.isFile())
        {
            this.logger.error("Missing or invalid comic file: {}", comic.getFilename());
            return null;
        }

        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok().contentLength(file.length())
                             .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
                             .contentType(MediaType.parseMediaType("application/x-cbr")).body(resource);
    }

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.GET)
    @JsonView(ComicDetails.class)
    public Comic getComic(@PathVariable("id") long id)
    {
        this.logger.debug("Fetching comic: id={}", id);

        Comic comic = this.comicRepository.findById(id).get();

        if (comic == null)
        {
            this.logger.debug("No such comic found: id={}", id);
        }
        else
        {
            this.logger.debug("Found: {}", comic.getFilename());
        }

        return comic;
    }

    @RequestMapping(value = "/formats",
                    method = RequestMethod.GET)
    public Iterable<ComicFormat> getComicFormats()
    {
        this.logger.debug("Fetching all comic format types");
        return this.comicFormatRepository.findAll();
    }

    @RequestMapping(value = "/since/{timestamp}",
                    method = RequestMethod.GET)
    @JsonView(View.ComicList.class)
    public LibraryStatus getComicsAddedSince(Principal principal,
                                             @PathVariable("timestamp") long timestamp,
                                             @RequestParam(value = "timeout",
                                                           required = false,
                                                           defaultValue = "0") long timeout) throws InterruptedException
    {
        logger.debug("Loading user: {}", principal.getName());
        ComiXedUser user = userRepository.findByEmail(principal.getName());

        Date latestDate = new Date(timestamp);
        boolean done = false;
        long returnBy = System.currentTimeMillis() + timeout;
        List<Comic> comics = null;

        int importCount = 0;
        int rescanCount = 0;

        this.logger.debug("Looking for comics added since {}: timeout={}", latestDate, timeout);

        while (!done)
        {
            this.logger.debug("Getting pending import count...");
            importCount = this.worker.getCountFor(AddComicWorkerTask.class);
            this.logger.debug("Import count is {}", importCount);

            this.logger.debug("Getting the rescan status..");
            rescanCount = this.worker.getCountFor(RescanComicWorkerTask.class);
            this.logger.debug("Rescan count is {}", rescanCount);

            comics = this.comicRepository.findByDateAddedGreaterThan(latestDate);

            if ((comics.size() == 0) && (System.currentTimeMillis() <= returnBy) && (rescanCount == 0))
            {
                synchronized (STATUS_SEMAPHORE)
                {
                    STATUS_SEMAPHORE.wait(1000);
                }
            }
            else
            {
                done = true;
            }
        }

        this.logger.debug("Found {} comics", comics.size());

        logger.debug("Getting last read dates");
        List<LastReadDate> lastReadDates = lastReadRepository.findAllForUser(user.getId());

        return new LibraryStatus(comics, lastReadDates, rescanCount, importCount);
    }

    @RequestMapping(value = "/{id}/summary",
                    method = RequestMethod.GET)
    @JsonView(View.ComicDetails.class)
    public Comic getComicSummary(@PathVariable("id") long id)
    {
        this.logger.debug("Fetching comic: id={}", id);

        Comic comic = this.comicRepository.findById(id).get();

        if (comic == null)
        {
            this.logger.debug("No such comic found: id={}", id);
        }
        else
        {
            this.logger.debug("Found: {}", comic.getFilename());
        }

        return comic;
    }

    @RequestMapping(value = "/scan_types",
                    method = RequestMethod.GET)
    public Iterable<ScanType> getScanTypes()
    {
        this.logger.debug("Fetching all scan types");
        return this.scanTypeRepository.findAll();
    }

    @RequestMapping(value = "/rescan",
                    method = RequestMethod.POST)
    public void rescanComics()
    {
        this.logger.debug("Rescanning comics in the library");

        ComicController.stopWaitingForStatus();

        Iterable<Comic> comics = this.comicRepository.findAll();

        for (Comic comic : comics)
        {
            this.logger.debug("Queueing comic for rescan: {}", comic.getFilename());
            RescanComicWorkerTask task = this.taskFactory.getObject();

            task.setComic(comic);
            this.worker.addTasksToQueue(task);
        }
    }

    @RequestMapping(value = "/{id}/format",
                    method = RequestMethod.PUT)
    public void setFormat(@PathVariable("id") long comicId, @RequestParam("format_id") long formatId)
    {
        this.logger.debug("Setting format: comicId={} formatId={}", comicId, formatId);

        Comic comic = this.comicRepository.findById(comicId).get();
        ComicFormat format = this.comicFormatRepository.findById(formatId).get();

        if (comic != null)
        {
            comic.setFormat(format);
            this.logger.debug("Saving update to comic");
            this.comicRepository.save(comic);
        }
        else
        {
            this.logger.debug("No such comic found");
        }
    }

    @RequestMapping(value = "/{id}/scan_type",
                    method = RequestMethod.PUT)
    public void setScanType(@PathVariable("id") long comicId, @RequestParam("scan_type_id") long scanTypeId)
    {
        this.logger.debug("Setting scan type: comicId={} scanTypeId={}", comicId, scanTypeId);

        Comic comic = this.comicRepository.findById(comicId).get();
        ScanType scanType = this.scanTypeRepository.findById(scanTypeId).get();

        if (comic != null)
        {
            comic.setScanType(scanType);
            this.logger.debug("Saving update to comic");
            this.comicRepository.save(comic);
        }
        else
        {
            this.logger.debug("No such comic found");
        }
    }

    @RequestMapping(value = "/{id}/sort_name",
                    method = RequestMethod.PUT)
    public void setSortName(@PathVariable("id") long comicId, @RequestParam("sort_name") String sortName)
    {
        this.logger.debug("Setting sort name: comicId={} sortName={}", comicId, sortName);

        Comic comic = this.comicRepository.findById(comicId).get();

        if (comic != null)
        {
            comic.setSortName(sortName);
            this.logger.debug("Saving update to comic");
            this.comicRepository.save(comic);
        }
        else
        {
            this.logger.debug("No such comic found");
        }
    }

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.PUT)
    public void updateComic(@PathVariable("id") long id,
                            @RequestParam("series") String series,
                            @RequestParam("volume") String volume,
                            @RequestParam("issue_number") String issueNumber)
    {
        this.logger.debug("Updating comic: id={}", id);

        Comic comic = this.comicRepository.findById(id).get();

        if (comic != null)
        {
            comic.setSeries(series);
            comic.setVolume(volume);
            comic.setIssueNumber(issueNumber);
            this.logger.debug("Saving updates to comic");
            this.comicRepository.save(comic);
        }
        else
        {
            this.logger.debug("No such comic found");
        }

        ComicController.stopWaitingForStatus();
    }
}
