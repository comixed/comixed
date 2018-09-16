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

package org.comixed.library.adaptors.archive;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.utils.IOUtils;
import org.codehaus.plexus.util.FileUtils;
import org.comixed.library.adaptors.ComicInfoEntryAdaptor;
import org.comixed.library.loaders.EntryLoader;
import org.comixed.library.loaders.EntryLoaderException;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.comixed.library.utils.FileTypeIdentifier;
import org.comixed.utils.ComicFileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

/**
 * <code>AbstractArchiveAdaptor</code> provides a foundation for creating new
 * instances of {@link ArchiveAdaptor}.
 *
 * @author Darryl L. Pierce
 * @param <I>
 *            the archive iterator type
 */
@Component
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "comic.entry",
                         ignoreUnknownFields = false)
public abstract class AbstractArchiveAdaptor<I> implements
                                            ArchiveAdaptor,
                                            InitializingBean
{
    public static class EntryLoaderForType
    {
        private String type;
        private String bean;

        public boolean isValid()
        {
            return (this.type != null) && !this.type.isEmpty() && (this.bean != null) && !this.bean.isEmpty();
        }

        public void setBean(String bean)
        {
            this.bean = bean;
        }

        public void setType(String type)
        {
            this.type = type;
        }

    }

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    protected FileTypeIdentifier fileTypeIdentifier;

    @Autowired
    private ApplicationContext context;

    @Autowired
    private ComicFileHandler comicFileHandler;

    @Autowired
    protected ComicInfoEntryAdaptor comicInfoEntryAdaptor;

    protected List<EntryLoaderForType> loaders = new ArrayList<>();
    protected Map<String,
                  EntryLoader> entryLoaders = new HashMap<>();
    private String defaultExtension;

    public AbstractArchiveAdaptor(String defaultExtension)
    {
        super();
        this.defaultExtension = defaultExtension;
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.entryLoaders.clear();
        for (EntryLoaderForType entry : this.loaders)
        {
            if (entry.isValid())
            {
                if (this.context.containsBean(entry.bean))
                {
                    this.entryLoaders.put(entry.type, (EntryLoader )this.context.getBean(entry.bean));
                }
                else
                {
                    this.logger.debug("No such entry adaptor bean: " + entry.bean);
                }
            }
            else
            {
                if ((entry.type == null) || entry.type.isEmpty())
                {
                    this.logger.debug("Missing type for entry adaptor");
                }
                if ((entry.bean == null) || entry.bean.isEmpty())
                {
                    this.logger.debug("Missing bean for entry adaptor");
                }
            }
        }
    }

    /**
     * Closes the specified archive file.
     *
     * @param archiveReference
     *            the archive reference
     * @throws ArchiveAdaptorException
     *             if an error occurs
     */
    abstract protected void closeArchive(I archiveReference) throws ArchiveAdaptorException;

    /**
     * Returns the list of filenames from the archive.
     *
     * @param archiveReference
     *            the archive reference
     * @return the list of filenames
     */
    abstract protected List<String> getEntryFilenames(I archiveReference);

    protected String getFilenameForEntry(String filename, int index)
    {
        return String.format("offset-%03d.%s", index, FileUtils.getExtension(filename));
    }

    protected EntryLoader getLoaderForContent(byte[] content)
    {
        String type = this.fileTypeIdentifier.typeFor(new ByteArrayInputStream(content));

        this.logger.debug("Content type: " + type);

        return this.entryLoaders.get(type);
    }

    public List<EntryLoaderForType> getLoaders()
    {
        return this.loaders;
    }

    @Override
    public void loadComic(Comic comic) throws ArchiveAdaptorException
    {
        I archiveReference = null;

        this.logger.debug("Processing archive: " + comic.getFilename());

        try
        {
            File comicFile = this.validateFile(comic);
            archiveReference = this.openArchive(comicFile);

            // get the archive entries
            List<String> entryFilenames = this.getEntryFilenames(archiveReference);
            Collections.sort(entryFilenames);
            this.logger.debug("Retrieved {} filenames", entryFilenames.size());

            // load the entries
            for (String entryFilename : entryFilenames)
            {
                byte[] content = this.loadSingleFileInternal(archiveReference, entryFilename);

                this.processContent(comic, entryFilename, content);
            }
        }
        finally
        {
            // clean up
            if (archiveReference != null)
            {
                this.logger.debug("Closing archive: " + comic.getFilename());
                this.closeArchive(archiveReference);
            }
        }
    }

    protected byte[] loadContent(String filename, long size, InputStream input) throws IOException
    {
        this.logger.debug("Loading entry: name=" + filename + " size=" + size);
        byte[] content = new byte[(int )size];

        IOUtils.readFully(input, content);

        return content;
    }

    @Override
    public byte[] loadSingleFile(Comic comic, String entryName) throws ArchiveAdaptorException
    {
        this.logger.debug("Loading single entry from comic: comic=" + comic.getFilename() + " entry=" + entryName);

        return this.loadSingleFile(comic.getFilename(), entryName);
    }

    @Override
    public byte[] loadSingleFile(String filename, String entryName) throws ArchiveAdaptorException
    {
        this.logger.debug("Loading single entry from file: filename={} entry={}", filename, entryName);
        I archiveReference = this.openArchive(new File(filename));
        byte[] result = this.loadSingleFileInternal(archiveReference, entryName);
        this.closeArchive(archiveReference);

        return result;
    }

    /**
     * Loads the content for a single entry in the specified archive.
     *
     * @param archiveReference
     *            the archive
     * @param entryName
     *            the entry filename
     * @return the content of the entry
     * @throws ArchiveAdaptorException
     *             if an error occurs
     */
    abstract protected byte[] loadSingleFileInternal(I archiveReference,
                                                     String entryName) throws ArchiveAdaptorException;

    /**
     * Opens the archive, returning an archive reference object.
     *
     * @param comicFile
     *            the comic file
     * @return the archive reference object
     * @throws ArchiveAdaptorException
     *             if an error occurs
     */
    abstract protected I openArchive(File comicFile) throws ArchiveAdaptorException;

    protected void processContent(Comic comic, String filename, byte[] content)
    {
        EntryLoader loader = this.getLoaderForContent(content);
        if (loader != null)
        {
            try
            {
                this.logger.debug("Loading content: filename={} length={}", filename, content.length);
                loader.loadContent(comic, filename, content);
            }
            catch (EntryLoaderException error)
            {
                this.logger.error("Error loading content", error);
            }
        }
        else
        {
            this.logger.debug("No registered adaptor for type");
        }
    }

    @Override
    public Comic saveComic(Comic source, boolean renamePages) throws ArchiveAdaptorException
    {
        this.logger.debug("Saving comic: " + source.getFilename());

        String tempFilename;
        try
        {
            tempFilename = File.createTempFile(source.getFilenameWithoutExtension() + "-temporary", "tmp").getAbsolutePath();
        }
        catch (IOException error)
        {
            throw new ArchiveAdaptorException("unable to write comic", error);
        }

        this.saveComicInternal(source, tempFilename, renamePages);

        String filename = ComicFileUtils.findAvailableFilename(source.getFilenameWithoutExtension(), 0, this.defaultExtension);
        File file1 = new File(tempFilename);
        File file2 = new File(filename);
        try
        {
            this.logger.debug("Copying " + tempFilename + " to " + filename + ".");
            FileUtils.copyFile(file1, file2);
        }
        catch (IOException error)
        {
            throw new ArchiveAdaptorException("Unable to copy file", error);
        }

        Comic result = new Comic();

        result.setFilename(filename);

        try
        {
            this.comicFileHandler.loadComic(result);
        }
        catch (ComicFileHandlerException error)
        {
            throw new ArchiveAdaptorException("Error loading new comic", error);
        }

        return result;
    }

    /**
     * Performs the underlying creation of the new comic.
     *
     * @param source
     *            the source comic
     * @param filename
     *            the new filename
     * @param renamePages
     *            rename pages
     * @throws ArchiveException
     *             if an error occurs
     */
    abstract void saveComicInternal(Comic source, String filename, boolean renamePages) throws ArchiveAdaptorException;

    protected File validateFile(Comic comic) throws ArchiveAdaptorException
    {
        File file = new File(comic.getFilename());

        if (!file.exists()) throw new ArchiveAdaptorException("File not found: " + file.getAbsolutePath());
        if (file.isDirectory()) throw new ArchiveAdaptorException("Cannot open directory: " + file.getAbsolutePath());

        return file;
    }

    @Override
    public String getFirstImageFileName(String filename) throws ArchiveAdaptorException
    {
        I archiveRef = this.openArchive(new File(filename));

        List<String> entries = this.getEntryFilenames(archiveRef);
        Collections.sort(entries);
        String result = null;

        for (String entry : entries)
        {
            byte[] content = this.loadSingleFileInternal(archiveRef, entry);
            String contentType = this.fileTypeIdentifier.typeFor(new ByteArrayInputStream(content));

            if (contentType != null && FileTypeIdentifier.IMAGE_TYPES.contains(contentType))
            {
                result = entry;
                break;
            }
        }

        this.closeArchive(archiveRef);

        return result;
    }
}
