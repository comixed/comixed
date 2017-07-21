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

package org.comixed.library.loaders;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.utils.IOUtils;
import org.codehaus.plexus.util.FileUtils;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
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
 * <code>AbstractArchiveLoader</code> provides a foundation for creating new
 * instances of {@link ArchiveLoader}.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "comic.entry",
                         ignoreUnknownFields = false)
public abstract class AbstractArchiveLoader implements
                                            ArchiveLoader,
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

    protected List<EntryLoaderForType> loaders = new ArrayList<>();
    protected Map<String,
                  EntryLoader> entryLoaders = new HashMap<>();
    private String defaultExtension;

    public AbstractArchiveLoader(String defaultExtension)
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
                    this.logger.debug("No such entry loader bean: " + entry.bean);
                }
            }
            else
            {
                if ((entry.type == null) || entry.type.isEmpty())
                {
                    this.logger.debug("Missing type for entry loader");
                }
                if ((entry.bean == null) || entry.bean.isEmpty())
                {
                    this.logger.debug("Missing bean for entry loader");
                }
            }
        }
    }

    private String findAvailableFilename(String filename, int attempt)
    {
        String candidate = filename;

        if (attempt > 0)
        {
            candidate = MessageFormat.format("{0}-{1}.{2}", filename, attempt, this.defaultExtension);
        }
        else
        {
            candidate = MessageFormat.format("{0}.{1}", filename, this.defaultExtension);
        }

        this.logger.debug("Candidate filename=" + candidate);
        File file = new File(candidate);
        return (!file.exists()) ? candidate : this.findAvailableFilename(filename, ++attempt);
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
    public void loadComic(Comic comic) throws ArchiveLoaderException
    {
        this.logger.debug("Opening archive: " + comic.getFilename());

        this.loadComicInternal(comic, null);
    }

    /**
     * Performs the underlying loading of the comic's contents from the archive
     * file.
     *
     * If the entry name is null, then all content is loaded.
     *
     * @param comic
     *            the comic
     * @param entryName
     *            the entry name
     * @return
     * @throws ArchiveLoaderException
     *             if an error occurs
     */
    protected abstract byte[] loadComicInternal(Comic comic, String entryName) throws ArchiveLoaderException;

    protected byte[] loadContent(String filename, long size, InputStream input) throws IOException
    {
        this.logger.debug("Loading entry: name=" + filename + " size=" + size);
        byte[] content = new byte[(int )size];

        IOUtils.readFully(input, content);

        return content;
    }

    @Override
    public byte[] loadSingleFile(Comic comic, String entryName) throws ArchiveLoaderException
    {
        this.logger.debug("Loading single entry from archive: filename=" + comic.getFilename() + " entry=" + entryName);
        return this.loadComicInternal(comic, entryName);
    }

    protected void processContent(Comic comic, String filename, byte[] content)
    {
        EntryLoader loader = this.getLoaderForContent(content);
        if (loader != null)
        {
            try
            {
                loader.loadContent(comic, filename, content);
            }
            catch (EntryLoaderException e)
            {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        else
        {
            this.logger.debug("No registered loader for type");
        }
    }

    @Override
    public Comic saveComic(Comic source) throws ArchiveLoaderException
    {
        this.logger.debug("Saving comic: " + source.getFilename());

        String tempFilename;
        try
        {
            tempFilename = File.createTempFile(source.getBaseFilename() + "-temporary", "tmp").getAbsolutePath();
        }
        catch (IOException error)
        {
            throw new ArchiveLoaderException("unable to write comic", error);
        }

        this.saveComicInternal(source, tempFilename);

        String filename = this.findAvailableFilename(source.getBaseFilename(), 0);
        File file1 = new File(tempFilename);
        File file2 = new File(filename);
        try
        {
            this.logger.debug("Copying " + tempFilename + " to " + filename + ".");
            FileUtils.copyFile(file1, file2);
        }
        catch (IOException error)
        {
            throw new ArchiveLoaderException("Unable to copy file", error);
        }

        Comic result = new Comic();

        result.setFilename(filename);

        try
        {
            comicFileHandler.loadComic(result);
        }
        catch (ComicFileHandlerException error)
        {
            throw new ArchiveLoaderException("Error loading new comic", error);
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
     * @throws ArchiveException
     *             if an error occurs
     */
    abstract void saveComicInternal(Comic source, String filename) throws ArchiveLoaderException;

    protected File validateFile(Comic comic) throws ArchiveLoaderException
    {
        File file = new File(comic.getFilename());

        if (!file.exists()) throw new ArchiveLoaderException("File not found: " + file.getAbsolutePath());
        if (file.isDirectory()) throw new ArchiveLoaderException("Cannot open directory: " + file.getAbsolutePath());

        return file;
    }
}
