/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import org.comixed.adaptors.AdaptorException;
import org.comixed.adaptors.FilenameScraperAdaptor;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.library.Comic;
import org.comixed.model.library.ComicFileDetails;
import org.comixed.model.tasks.ProcessComicEntry;
import org.comixed.model.tasks.ProcessComicEntryType;
import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.tasks.ProcessComicEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@ConfigurationProperties(prefix = "comic-file.handlers")
public class AddComicWorkerTask
        extends AbstractWorkerTask {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ObjectFactory<Comic> comicFactory;
    @Autowired private ComicFileHandler comicFileHandler;
    @Autowired private ComicRepository comicRepository;
    @Autowired private ProcessComicEntryRepository processComicEntryRepository;
    @Autowired private FilenameScraperAdaptor filenameScraper;

    private File file;
    private boolean deleteBlockedPages = false;
    private boolean ignoreMetadata = false;

    /**
     * Sets whether blocked pages are marked as deleted.
     *
     * @param deleteBlockedPages
     *         the flag
     */
    public void setDeleteBlockedPages(boolean deleteBlockedPages) {
        this.deleteBlockedPages = deleteBlockedPages;
    }

    /**
     * Sets the name of the file to be added.
     *
     * @param file
     *         the file
     */
    public void setFile(File file) {
        this.logger.debug("Setting filename: {}",
                          file.getName());
        this.file = file;
    }

    public void setIgnoreMetadata(boolean ignore) {
        this.ignoreMetadata = ignore;
    }

    @Override
    @Transactional
    public void startTask()
            throws
            WorkerTaskException {
        this.logger.info("Adding file to library: {}",
                         this.file);

        Comic result = this.comicRepository.findByFilename(this.file.getAbsolutePath());
        if (result != null) {
            this.logger.debug("Comic already imported: " + this.file.getAbsolutePath());
            return;
        }

        try {
            result = this.comicFactory.getObject();
            this.logger.debug("Setting comic filename");
            result.setFilename(this.file.getAbsolutePath());
            this.logger.debug("Scraping details from filename");
            this.filenameScraper.execute(result);
            this.logger.debug("Loading comic details");
            this.comicFileHandler.loadComicArchiveType(result);

            this.logger.debug("Saving comic");
            this.comicRepository.save(result);

            this.logger.debug("Creating process comic entry");
            final ProcessComicEntry processComicEntry = new ProcessComicEntry();
            processComicEntry.setComic(result);
            ProcessComicEntryType.setProcessTypeFor(processComicEntry,
                                                    this.deleteBlockedPages,
                                                    this.ignoreMetadata);

            this.logger.debug("Saving process comic entry: type={}",
                              processComicEntry.getProcessType());
            this.processComicEntryRepository.save(processComicEntry);
        }
        catch (ComicFileHandlerException | AdaptorException error) {
            throw new WorkerTaskException("Failed to load comic",
                                          error);
        }
    }

    @Override
    protected String createDescription() {
        final StringBuilder result = new StringBuilder();

        result.append("Add comic to library:")
              .append(" filename=")
              .append(this.file.getAbsolutePath())
              .append(" delete blocked pages=")
              .append(this.deleteBlockedPages
                      ? "Yes"
                      : "No")
              .append(" ignore metadata=")
              .append(this.ignoreMetadata
                      ? "Yes"
                      : "No");

        return result.toString();
    }
}
