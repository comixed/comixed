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

import java.io.File;
import java.util.Locale;

import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@ConfigurationProperties(prefix = "comic-file.handlers")
public class AddComicWorkerTask extends AbstractWorkerTask
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ComicFileHandler comicFileHandler;

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    File file;

    @Override
    public void startTask() throws WorkerTaskException
    {
        logger.debug("Adding file to library: " + file);

        Comic result = comicRepository.findByFilename(this.file.getAbsolutePath());
        if (result != null)
        {
            logger.debug("Comic already imported: " + file.getAbsolutePath());
            return;
        }

        try
        {
            showStatusText(messageSource.getMessage("status.comic.add", new Object[]
            {file.getAbsoluteFile()}, Locale.getDefault()));
            result = new Comic();
            result.setFilename(this.file.getAbsolutePath());
            comicFileHandler.loadComic(result);
            comicRepository.save(result);
            comicSelectionModel.reload();
        }
        catch (ComicFileHandlerException error)
        {
            throw new WorkerTaskException("Failed to load comic", error);
        }
    }

    /**
     * Sets the name of the file to be added.
     * 
     * @param file
     *            the file
     */
    public void setFile(File file)
    {
        logger.debug("Setting filename: " + file.getName());
        this.file = file;
    }
}
