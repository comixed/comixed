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

package org.comixed.tasks;

import java.io.File;

import org.comixed.library.adaptors.AdaptorException;
import org.comixed.library.adaptors.FilenameScraperAdaptor;
import org.comixed.library.model.BlockedPageHash;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.comixed.repositories.BlockedPageHashRepository;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@ConfigurationProperties(prefix = "comic-file.handlers")
public class AddComicWorkerTask extends AbstractWorkerTask
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ObjectFactory<Comic> comicFactory;

    @Autowired
    private ComicFileHandler comicFileHandler;

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private BlockedPageHashRepository blockedPageHashRepository;

    @Autowired
    private FilenameScraperAdaptor filenameScraper;

    File file;

    private boolean deleteBlockedPages;

    /**
     * Sets whether blocked pages are marked as deleted.
     *
     * @param deleteBlockedPages
     *            the flag
     */
    public void setDeleteBlockedPages(boolean deleteBlockedPages)
    {
        this.deleteBlockedPages = deleteBlockedPages;
    }

    /**
     * Sets the name of the file to be added.
     *
     * @param file
     *            the file
     */
    public void setFile(File file)
    {
        this.logger.debug("Setting filename: " + file.getName());
        this.file = file;
    }

    @Override
    public void startTask() throws WorkerTaskException
    {
        this.logger.debug("Adding file to library: " + this.file);

        Comic result = this.comicRepository.findByFilename(this.file.getAbsolutePath());
        if (result != null)
        {
            this.logger.debug("Comic already imported: " + this.file.getAbsolutePath());
            return;
        }

        try
        {
            result = this.comicFactory.getObject();
            result.setFilename(this.file.getAbsolutePath());
            this.comicFileHandler.loadComic(result);
            this.filenameScraper.execute(result);
            if (this.deleteBlockedPages)
            {
                this.logger.debug("Looking for blocked pages");
                for (int index = 0;
                     index < result.getPageCount();
                     index++)
                {
                    String hash = result.getPage(index).getHash();
                    BlockedPageHash blocked = this.blockedPageHashRepository.findByHash(hash);

                    if (blocked != null)
                    {
                        this.logger.debug("Marking blocked offset as deleted: hash={}", hash);
                        result.getPage(index).markDeleted(true);
                    }
                }
            }
            this.comicRepository.save(result);
        }
        catch (ComicFileHandlerException
               | AdaptorException error)
        {
            throw new WorkerTaskException("Failed to load comic", error);
        }
    }
}
