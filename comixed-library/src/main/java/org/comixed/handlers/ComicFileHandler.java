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

package org.comixed.handlers;

import org.comixed.adaptors.ArchiveType;
import org.comixed.adaptors.ComicDataAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.model.library.Comic;
import org.comixed.utils.FileTypeIdentifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <code>ComicFileHandler</code> performs the actual loading and saving of the contents of a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@PropertySource("classpath:archiveadaptors.properties")
@ConfigurationProperties(prefix = "comic.archive",
                         ignoreUnknownFields = false)
public class ComicFileHandler
        implements InitializingBean {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ApplicationContext context;
    @Autowired private FileTypeIdentifier fileTypeIdentifier;
    @Autowired private Map<String, ArchiveAdaptor> archiveAdaptors;
    @Autowired private ComicDataAdaptor comicDataAdaptor;

    private List<ArchiveAdaptorEntry> adaptors = new ArrayList<>();
    private Map<String, ArchiveType> archiveTypes = new HashMap<>();

    @Override
    public void afterPropertiesSet()
            throws
            Exception {
        this.logger.debug("Initializing ComicFileHandler");
        this.archiveAdaptors.clear();
        this.archiveTypes.clear();
        for (ArchiveAdaptorEntry loader : this.adaptors) {
            if (loader.isValid()) {
                ArchiveAdaptor bean = (ArchiveAdaptor) this.context.getBean(loader.bean);

                if (this.context.containsBean(loader.bean)) {
                    this.logger.debug("Adding new archive adaptor: format=" + loader.format + " bean=" + loader.bean);
                    this.archiveAdaptors.put(loader.format,
                                             bean);
                    this.logger.debug(
                            "Associating archive type with format: format=" + loader.format + " archive type=" +
                            loader.archiveType);
                    this.archiveTypes.put(loader.format,
                                          loader.archiveType);
                    this.logger.debug("Registering adaptor with archive type: " + loader.archiveType);
                    loader.archiveType.setArchiveAdaptor(bean);
                } else {
                    this.logger.warn("No such bean: name=" + loader.bean);
                }
            } else {
                if ((loader.format == null) || loader.format.isEmpty()) {
                    this.logger.warn("Missing type for archive adaptor");
                }
                if ((loader.bean == null) || loader.bean.isEmpty()) {
                    this.logger.warn("Missing name for archive adaptor");
                }
            }
        }
    }

    public List<ArchiveAdaptorEntry> getAdaptors() {
        return this.adaptors;
    }

    /**
     * Returns the {@linkk ArchiveAdaptor} for the specified filename.
     *
     * @param filename
     *         the comic filename
     *
     * @return the adaptor, or <code>null</code> if no adaptor is registered
     *
     * @throws ComicFileHandlerException
     *         if an error occurs
     */
    public ArchiveAdaptor getArchiveAdaptorFor(String filename)
            throws
            ComicFileHandlerException {
        this.logger.debug("Fetching archive adaptor for file: {}",
                          filename);

        String archiveType = null;

        try {
            InputStream input = new BufferedInputStream(new FileInputStream(filename));
            archiveType = this.fileTypeIdentifier.subtypeFor(input);
        }
        catch (FileNotFoundException error) {
            throw new ComicFileHandlerException("Unable to load comic file",
                                                error);
        }

        ArchiveAdaptor result = null;

        if (archiveType == null) {
            this.logger.debug("Unable to determine the file type");
        } else {
            this.logger.debug("Archive is of type={}",
                              archiveType);
            result = this.archiveAdaptors.get(archiveType);
        }

        return result;
    }

    /**
     * Loads the given comic from disk.
     *
     * @param comic
     *         the comic
     *
     * @throws ComicFileHandlerException
     *         if an error occurs
     */
    public void loadComic(Comic comic)
            throws
            ComicFileHandlerException {
        this.loadComic(comic,
                       false);
    }

    /**
     * Loads the given comic from disk.
     *
     * @param comic
     *         the comic
     * @param ignoreComicInfoXml
     *         true if the ComicINfo.xml file is to be ignored.
     *
     * @throws ComicFileHandlerException
     *         if an error occurs
     */
    public void loadComic(Comic comic,
                          boolean ignoreComicInfoXml)
            throws
            ComicFileHandlerException {
        if (comic.isMissing()) {
            this.logger.info("Unable to load missing file: " + comic.getFilename());
            return;
        }
        this.logger.debug("Loading comic: " + comic.getFilename());

        ArchiveAdaptor archiveAdaptor;

        if (comic.getArchiveType() != null) {
            archiveAdaptor = comic.getArchiveType()
                                  .getArchiveAdaptor();
        } else {
            archiveAdaptor = this.getArchiveAdaptorFor(comic.getFilename());
        }

        try {
            archiveAdaptor.loadComic(comic);
            if (ignoreComicInfoXml) {
                this.logger.debug("Clearing out meta-data");
                this.comicDataAdaptor.clear(comic);
            }
        }
        catch (ArchiveAdaptorException error) {
            throw new ComicFileHandlerException("Unable to load comic",
                                                error);
        }
    }

    public void loadComicArchiveType(final Comic comic)
            throws
            ComicFileHandlerException {
        if (comic.isMissing()) {
            this.logger.info("Unable to determine type for missing file: file={}",
                             comic.getFilename());
            return;
        }
        this.logger.debug("Determining archive type: file={}",
                          comic.getFilename());

        String archiveType = null;

        try {
            InputStream input = new BufferedInputStream(new FileInputStream(comic.getFilename()));
            archiveType = this.fileTypeIdentifier.subtypeFor(input);
        }
        catch (FileNotFoundException error) {
            throw new ComicFileHandlerException("Unable to load comic file",
                                                error);
        }

        if (archiveType == null)
            throw new ComicFileHandlerException("Unknown comic type");

        ArchiveAdaptor archiveAdaptor = this.archiveAdaptors.get(archiveType);

        if (archiveAdaptor == null)
            throw new ComicFileHandlerException("No archive adaptor defined for type: " + archiveType);

        comic.setArchiveType(this.archiveTypes.get(archiveType));
    }

    public static class ArchiveAdaptorEntry {
        private String format;
        private String bean;
        private ArchiveType archiveType;

        public boolean isValid() {
            return (this.format != null) && !this.format.isEmpty() && (this.bean != null) && !this.bean.isEmpty() &&
                   (this.archiveType != null);
        }

        public void setArchiveType(ArchiveType archiveType) {
            this.archiveType = archiveType;
        }

        public void setBean(String bean) {
            this.bean = bean;
        }

        public void setFormat(String format) {
            this.format = format;
        }
    }
}
