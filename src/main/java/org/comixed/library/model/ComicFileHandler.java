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

package org.comixed.library.model;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.comixed.library.loaders.ArchiveLoader;
import org.comixed.library.loaders.ArchiveLoaderException;
import org.comixed.library.utils.FileTypeIdentifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

/**
 * <code>ComicFileHandler</code> performs the actual loading and saving of the
 * contents of a comic.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "comic.archive",
                         ignoreUnknownFields = false)
public class ComicFileHandler implements
                              InitializingBean
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ApplicationContext context;
    @Autowired
    private FileTypeIdentifier fileTypeIdentifier;
    @Autowired
    private Map<String,
                ArchiveLoader> archiveLoaders;
    private List<ArchiveLoaderEntry> loaders = new ArrayList<>();

    public static class ArchiveLoaderEntry
    {
        private String type;
        private String bean;

        public void setType(String type)
        {
            this.type = type;
        }

        public void setBean(String bean)
        {
            this.bean = bean;
        }

        public boolean isValid()
        {
            return this.type != null && !this.type.isEmpty() && this.bean != null && !this.bean.isEmpty();
        }
    }

    public List<ArchiveLoaderEntry> getLoaders()
    {
        return loaders;
    }

    /**
     * Loads the given comic from disk.
     * 
     * @param comic
     *            the comic
     * @throws ComicFileHandlerException
     *             if an error occurs
     */
    public void loadComic(Comic comic) throws ComicFileHandlerException
    {
        logger.debug("Loading comic: " + comic.getFilename());

        String archiveType = null;

        try
        {
            InputStream input = new BufferedInputStream(new FileInputStream(comic.getFilename()));
            archiveType = fileTypeIdentifier.typeFor(input);
        }
        catch (FileNotFoundException error)
        {
            throw new ComicFileHandlerException("Unable to load comic file", error);
        }

        if (archiveType == null) { throw new ComicFileHandlerException("Unknown comic type"); }

        ArchiveLoader archiveLoader = archiveLoaders.get(archiveType);

        if (archiveLoader == null) { throw new ComicFileHandlerException("No archive loader defined for type: "
                                                                         + archiveType); }

        comic.setArchiveLoader(archiveLoader);
        try
        {
            archiveLoader.loadComic(comic);
        }
        catch (ArchiveLoaderException error)
        {
            throw new ComicFileHandlerException("Unable to load comic", error);
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        logger.debug("Initializing ComicFileHandler");
        archiveLoaders.clear();
        for (ArchiveLoaderEntry loader : this.loaders)
        {
            if (loader.isValid())
            {
                logger.debug("Adding new archive loader: type=" + loader.type + " bean=" + loader.bean);

                if (context.containsBean(loader.bean))
                {
                    this.archiveLoaders.put(loader.type, (ArchiveLoader )context.getBean(loader.bean));
                }
                else
                {
                    logger.warn("No such bean: name=" + loader.bean);
                }
            }
            else
            {
                if (loader.type == null || loader.type.isEmpty())
                {
                    logger.warn("Missing type for archive loader");
                }
                if (loader.bean == null || loader.bean.isEmpty())
                {
                    logger.warn("Missing name for archive loader");
                }
            }
        }
    }
}
