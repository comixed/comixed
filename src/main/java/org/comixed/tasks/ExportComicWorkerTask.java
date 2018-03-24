/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import java.util.Locale;

import org.comixed.AppConfiguration;
import org.comixed.library.adaptors.AbstractArchiveAdaptor;
import org.comixed.library.adaptors.ArchiveAdaptor;
import org.comixed.library.adaptors.ArchiveAdaptorException;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
public class ExportComicWorkerTask extends AbstractWorkerTask
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private Comic comic;
    private ArchiveAdaptor archiveAdaptor;

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private ComicRepository comicRepository;
    @Autowired
    private ComicSelectionModel comicSelectionModel;
    @Autowired
    private ComicFileHandler comicFileHandler;
    @Autowired
    private AppConfiguration configuration;

    public void setArchiveAdaptor(AbstractArchiveAdaptor archiveAdaptor)
    {
        this.archiveAdaptor = archiveAdaptor;
    }

    public void setComics(Comic comic)
    {
        this.comic = comic;
    }

    @Override
    public void startTask() throws WorkerTaskException
    {
        this.logger.debug("Loading comic to be converted: " + this.comic.getFilename());
        try
        {
            this.comicFileHandler.loadComic(comic);
        }
        catch (ComicFileHandlerException error)
        {
            throw new WorkerTaskException("unable to load comic file: " + comic.getFilename(), error);
        }
        this.logger.debug("Converting comic");

        try
        {
            this.showStatusText(this.messageSource.getMessage("status.comic.exported", new Object[]
            {this.comic.getFilename()}, Locale.getDefault()));
            boolean rename = false;
            if (this.configuration.hasOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT))
            {
                rename = Boolean.valueOf(this.configuration.getOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT));
            }
            Comic result = this.archiveAdaptor.saveComic(this.comic, rename);
            this.comicRepository.save(result);
            this.comicSelectionModel.reload();
        }
        catch (ArchiveAdaptorException error)
        {
            throw new WorkerTaskException("Unable to convert comic", error);
        }
    }
}
