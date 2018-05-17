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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.comixed.library.adaptors.ArchiveAdaptor;
import org.comixed.library.adaptors.ArchiveAdaptorException;
import org.comixed.library.utils.FileTypeIdentifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
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
@PropertySource("classpath:archiveadaptors.properties")
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
                ArchiveAdaptor> archiveAdaptors;
    private List<ArchiveAdaptorEntry> adaptors = new ArrayList<>();
    private Map<String,
                ArchiveType> archiveTypes = new HashMap<>();

    public static class ArchiveAdaptorEntry
    {
        private String format;
        private String bean;
        private ArchiveType archiveType;

        public void setFormat(String format)
        {
            this.format = format;
        }

        public void setBean(String bean)
        {
            this.bean = bean;
        }

        public void setArchiveType(ArchiveType archiveType)
        {
            this.archiveType = archiveType;
        }

        public boolean isValid()
        {
            return this.format != null && !this.format.isEmpty() && this.bean != null && !this.bean.isEmpty()
                   && this.archiveType != null;
        }
    }

    public List<ArchiveAdaptorEntry> getAdaptors()
    {
        return adaptors;
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
        if (comic.isMissing())
        {
            logger.info("Unable to load missing file: " + comic.getFilename());
            return;
        }
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

        ArchiveAdaptor archiveAdaptor = archiveAdaptors.get(archiveType);

        if (archiveAdaptor == null) { throw new ComicFileHandlerException("No archive adaptor defined for type: "
                                                                          + archiveType); }

        comic.setArchiveType(this.archiveTypes.get(archiveType));

        try
        {
            archiveAdaptor.loadComic(comic);
        }
        catch (ArchiveAdaptorException error)
        {
            throw new ComicFileHandlerException("Unable to load comic", error);
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        logger.debug("Initializing ComicFileHandler");
        archiveAdaptors.clear();
        archiveTypes.clear();
        for (ArchiveAdaptorEntry loader : this.adaptors)
        {
            if (loader.isValid())
            {
                ArchiveAdaptor bean = (ArchiveAdaptor )context.getBean(loader.bean);

                if (context.containsBean(loader.bean))
                {
                    logger.debug("Adding new archive adaptor: format=" + loader.format + " bean=" + loader.bean);
                    this.archiveAdaptors.put(loader.format, bean);
                    logger.debug("Associating archive type with format: format=" + loader.format + " archive type="
                                 + loader.archiveType);
                    this.archiveTypes.put(loader.format, loader.archiveType);
                    logger.debug("Registering adaptor with archive type: " + loader.archiveType);
                    loader.archiveType.setArchiveAdaptor(bean);
                }
                else
                {
                    logger.warn("No such bean: name=" + loader.bean);
                }
            }
            else
            {
                if (loader.format == null || loader.format.isEmpty())
                {
                    logger.warn("Missing type for archive adaptor");
                }
                if (loader.bean == null || loader.bean.isEmpty())
                {
                    logger.warn("Missing name for archive adaptor");
                }
            }
        }
    }
}
