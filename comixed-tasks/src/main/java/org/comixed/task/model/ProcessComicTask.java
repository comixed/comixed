/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.task.model;

import org.apache.commons.io.FileUtils;
import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.model.library.Comic;
import org.comixed.model.library.ComicFileDetails;
import org.comixed.model.tasks.ProcessComicEntry;
import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.tasks.ProcessComicEntryRepository;
import org.comixed.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.Date;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ProcessComicTask
        extends AbstractWorkerTask {
    private static final Object semaphore = new Object();

    @Autowired private ProcessComicEntryRepository processComicEntryRepository;
    @Autowired private ComicRepository comicRepository;
    @Autowired private Utils utils;

    private ProcessComicEntry entry;

    @Override
    protected String createDescription() {
        return "Process entry task [" + this.entry.getComic()
                                                  .getFilename() + "]";
    }

    @Override
    @Transactional(rollbackFor = {WorkerTaskException.class})
    public void startTask()
            throws
            WorkerTaskException {
        final Comic comic = this.entry.getComic();

        this.logger.debug("Processing comic: id={}",
                          comic.getId());

        this.logger.debug("Getting archive adaptor");
        final ArchiveAdaptor adaptor = comic.getArchiveAdaptor();
        this.logger.debug("Loading comic");
        try {
            adaptor.loadComic(comic);
        }
        catch (ArchiveAdaptorException error) {
            throw new WorkerTaskException("failed to load comic: " + comic.getFilename(),
                                          error);
        }

        this.logger.debug("Setting comic file details");
        final ComicFileDetails fileDetails = new ComicFileDetails();

        try {
            fileDetails.setHash(this.utils.createHash(FileUtils.readFileToByteArray(new File(comic.getFilename()))));
        }
        catch (IOException error) {
            throw new WorkerTaskException("failed to get hash for file: " + comic.getFilename(),
                                          error);
        }
        comic.setFileDetails(fileDetails);

        this.logger.debug("Updating comic");
        comic.setDateLastUpdated(new Date());
        this.comicRepository.save(comic);

        this.logger.debug("Deleting process entry");
        this.processComicEntryRepository.delete(this.entry);
    }

    public void setEntry(final ProcessComicEntry entry) {
        this.entry = entry;
    }
}
