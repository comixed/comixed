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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.compress.utils.IOUtils;
import org.comixed.library.model.Comic;
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
    protected List<EntryLoaderForType> loaders = new ArrayList<>();
    protected Map<String,
                  EntryLoader> entryLoaders = new HashMap<>();

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

    @Override
    public byte[] loadSingleFile(Comic comic, String entryName) throws ArchiveLoaderException
    {
        this.logger.debug("Loading single entry from archive: filename=" + comic.getFilename() + " entry=" + entryName);
        return this.loadComicInternal(comic, entryName);
    }

    protected EntryLoader getLoaderForContent(byte[] content)
    {
        String type = this.fileTypeIdentifier.typeFor(new ByteArrayInputStream(content));

        this.logger.debug("Content type: " + type);

        return this.entryLoaders.get(type);
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

    protected File validateFile(Comic comic) throws ArchiveLoaderException
    {
        File file = new File(comic.getFilename());

        if (!file.exists()) throw new ArchiveLoaderException("File not found: " + file.getAbsolutePath());
        if (file.isDirectory()) throw new ArchiveLoaderException("Cannot open directory: " + file.getAbsolutePath());

        return file;
    }
}
