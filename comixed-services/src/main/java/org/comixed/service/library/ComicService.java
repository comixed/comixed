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
import org.comixed.tasks.AddComicWorkerTask;
import org.comixed.tasks.RescanComicWorkerTask;
import org.comixed.tasks.Worker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ComicService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicRepository comicRepository;
    @Autowired private LastReadDatesRepository lastReadDatesRepository;
    @Autowired private ComiXedUserRepository userRepository;
    @Autowired private Worker worker;

    public List<Comic> getComicsAddedSince(final long timestamp) {
        final Date lastUpdated = new Date(timestamp);

        this.logger.info("Getting comics added: last updated={}",
                         lastUpdated.toString());

        return this.comicRepository.findByDateAddedGreaterThan(lastUpdated);
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

    public Comic getComic(final long id) {
        this.logger.info("Getting comic: id={}",
                         id);

        final Optional<Comic> result = this.comicRepository.findById(id);

        if (result.isPresent()) {
            return result.get();
        }

        this.logger.error("No such comic");
        return null;
    }

    public Comic getComicSummary(final long id) {
        return null;
    }

    @Transactional
    public Comic updateComic(final long id,
                             final String series,
                             final String volume,
                             final String issueNumber) {
        this.logger.info("Updating comic: id={}",
                         id);

        final Optional<Comic> record = this.comicRepository.findById(id);

        if (record.isPresent()) {
            final Comic comic = record.get();

            comic.setSeries(series);
            comic.setVolume(volume);
            comic.setIssueNumber(issueNumber);

            this.logger.debug("Saving updated comic");
            return this.comicRepository.save(comic);
        }

        this.logger.debug("No such comic");
        return null;
    }

    public int getImportCount() {
        this.logger.info("Getting the current import count");

        return this.worker.getCountFor(AddComicWorkerTask.class);
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
}
