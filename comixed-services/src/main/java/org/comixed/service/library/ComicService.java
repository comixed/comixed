/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixed.service.library;

import org.apache.commons.io.FileUtils;
import org.comixed.model.library.Comic;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.LastReadDatesRepository;
import org.comixed.repositories.tasks.ProcessComicEntryRepository;
import org.comixed.task.model.RescanComicWorkerTask;
import org.comixed.task.runner.Worker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class ComicService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicRepository comicRepository;
    @Autowired private LastReadDatesRepository lastReadDatesRepository;
    @Autowired private ProcessComicEntryRepository processComicEntryRepository;
    @Autowired private ComiXedUserRepository userRepository;
    @Autowired private Worker worker;
    @Autowired private ObjectFactory<RescanComicWorkerTask> rescanComicWorkerTaskFactory;

    public List<Comic> getComicsUpdatedSince(final long timestamp,
                                             final int maximumResults) {
        final Date lastUpdated = new Date(timestamp);
        this.logger.debug("Getting {} comic{} updated since {}",
                          maximumResults,
                          maximumResults == 1
                          ? ""
                          : "s",
                          lastUpdated);

        final List<Comic> result = this.comicRepository.findAllByDateLastUpdatedGreaterThan(lastUpdated,
                                                                                            PageRequest.of(0,
                                                                                                           maximumResults));

        this.logger.debug("Returning {} comic{}",
                          result.size(),
                          result.size() == 1
                          ? ""
                          : "s");

        return result;
    }

    @Transactional
    public boolean deleteComic(final long id) {
        this.logger.info("Deleting comics: id={}",
                         id);

        final Optional<Comic> comic = this.comicRepository.findById(id);

        if (!comic.isPresent()) {
            this.logger.error("No such comic");
            return false;
        }

        this.comicRepository.delete(comic.get());
        return true;
    }

    @Transactional
    public List<Long> deleteMultipleComics(final List<Long> ids) {
        this.logger.info("Preparing to delete {} comic{}",
                         ids.size(),
                         ids.size() == 1
                         ? ""
                         : "s");
        List<Long> result = new ArrayList<>();

        for (long id : ids) {
            this.logger.debug("Fetching comic: id={}",
                              id);
            final Optional<Comic> comic = this.comicRepository.findById(id);

            if (comic.isPresent()) {
                this.logger.debug("Deleting comics");
                this.comicRepository.delete(comic.get());
                result.add(id);
            } else {
                this.logger.error("No such comic");
            }
        }
        return result;
    }

    public Comic getComic(final long id)
            throws
            ComicException {
        this.logger.info("Getting comic: id={}",
                         id);

        final Optional<Comic> comicRecord = this.comicRepository.findById(id);

        if (!comicRecord.isPresent()) {
            throw new ComicException("no such comic: id=" + id);
        }

        final Comic comic = comicRecord.get();
        final String series = comic.getSeries();

        this.logger.debug("Getting all comics for series: {}",
                          series);
        final List<Comic> comics = this.comicRepository.findBySeries(series);
        Collections.sort(comics,
                         new ComicsComparatorByIssueNumber());

        this.logger.debug("Searching {} comic{} for next and previous issues",
                          comics.size(),
                          comics.size() == 1
                          ? ""
                          : "s");
        long previousId = -1L;
        long nextId = -1L;
        long currentId = comic.getId();
        for (int index = 0;
             index < comics.size();
             index++) {
            if (comics.get(index)
                      .getId() == currentId) {
                if (index > 0) {
                    previousId = comics.get(index - 1)
                                       .getId();
                }
                if (index < comics.size() - 1) {
                    nextId = comics.get(index + 1)
                                   .getId();
                }
                break;
            }
        }

        comic.setNextIssueId(nextId);
        comic.setPreviousIssueId(previousId);

        this.logger.debug("Returning comic");
        return comic;
    }

    public Comic getComicSummary(final long id) {
        return null;
    }

    @Transactional
    public Comic updateComic(final long id,
                             final Comic update) {
        this.logger.info("Updating comic: id={}",
                         id);

        final Optional<Comic> record = this.comicRepository.findById(id);

        if (record.isPresent()) {
            final Comic comic = record.get();
            this.logger.debug("Updating the comic fields");

            comic.setSeries(update.getSeries());
            comic.setVolume(update.getVolume());
            comic.setIssueNumber(update.getIssueNumber());
            comic.setSortName(update.getSortName());
            comic.setScanType(update.getScanType());
            comic.setFormat(update.getFormat());
            comic.setDateLastUpdated(new Date());

            this.logger.debug("Saving updated comic");
            return this.comicRepository.save(comic);
        }

        this.logger.debug("No such comic");
        return null;
    }

    public long getProcessingCount() {
        this.logger.info("Getting the current processing count");

        final long result = this.processComicEntryRepository.count();

        this.logger.debug("There {} {} record{} to be processed",
                          result,
                          result == 1
                          ? ""
                          : "s");

        return result;
    }

    public int getRescanCount() {
        this.logger.info("Getting the current rescan count");

        return this.worker.getCountFor(RescanComicWorkerTask.class);
    }

    public List<LastReadDate> getLastReadDatesSince(final String email,
                                                    final long timestamp) {
        this.logger.info("Getting last read dates for user: email={}",
                         email);

        final ComiXedUser user = this.userRepository.findByEmail(email);

        return this.lastReadDatesRepository.findAllForUser(user.getId());
    }

    public Comic save(final Comic comic) {
        this.logger.info("Saving comic: filename={}",
                         comic.getFilename());

        comic.setDateLastUpdated(new Date());

        return this.comicRepository.save(comic);
    }

    @Transactional
    public byte[] getComicContent(final Comic comic) {
        this.logger.info("Getting file content: filename={}",
                         comic.getFilename());

        try {
            return FileUtils.readFileToByteArray(new File(comic.getFilename()));
        }
        catch (IOException error) {
            this.logger.error("Failed to read comic file content",
                              error);
            return null;
        }
    }

    public int rescanComics() {
        this.logger.debug("Rescanning comics in the library");

        final Iterable<Comic> comics = this.comicRepository.findAll();
        int count = 0;

        for (Comic comic : comics) {
            count++;
            this.logger.debug("Queueing comic for rescan: {}",
                              comic.getFilename());
            RescanComicWorkerTask task = this.rescanComicWorkerTaskFactory.getObject();

            task.setComic(comic);
            this.worker.addTasksToQueue(task);
        }

        return count;
    }
}
