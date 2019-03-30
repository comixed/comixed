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

package org.comixed.importer.adaptors;

import org.comixed.importer.PathReplacement;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.List;

/**
 * <code>ComicFileImportAdaptor</code> handles taking a list of comic files and importing them into the database.
 *
 * @author Darryl L. Pierce
 */
@Component
public class ComicFileImportAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private ComicFileHandler comicFileHandler;

    public void importComics(List<Comic> comics, List<PathReplacement> replacements) throws ImportAdaptorException
    {
        for (int index = 0; index < comics.size(); index++)
        {
            try
            {
                this.logger.debug("Importing comic: {}", comics.get(index).getFilename());
                this.importComic(comics.get(index));
            }
            catch (FileNotFoundException error)
            {
                this.logger.error("Comic not found: skipping");
            }
            catch (ComicFileHandlerException error)
            {
                throw new ImportAdaptorException("unable to load comic file", error);
            }
        }
    }

    protected void importComic(Comic comic) throws FileNotFoundException, ComicFileHandlerException
    {
        if (this.comicRepository.findByFilename(comic.getFilename()) != null)
        {
            this.logger.debug("Found in the library");
            return;
        }

        File file = new File(comic.getFilename());
        if (!file.exists())
        {
            this.logger.debug("No such file: {}", comic.getFilename());
            throw new FileNotFoundException("no such file: " + comic.getFilename());
        }

        this.logger.debug("Loading comic details");
        this.comicFileHandler.loadComic(comic);

        this.logger.debug("Saving comic to database");
        this.comicRepository.save(comic);
    }

    public void verifyPath(Comic comic, List<PathReplacement> pathReplacements)
    {
        for (PathReplacement replacement : pathReplacements)
        {
            if (replacement.isMatch(comic.getFilename()))
            {
                this.logger.debug("Replacement comic path: old={}", comic.getFilename());
                comic.setFilename(replacement.getReplacement(comic.getFilename()));
                this.logger.debug("                      : new={}", comic.getFilename());
                return;
            }
        }
    }
}
