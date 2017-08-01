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

package org.comixed.library.adaptors;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Enumeration;

import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.archivers.ArchiveStreamFactory;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.comixed.library.model.Comic;
import org.comixed.library.model.Page;
import org.springframework.stereotype.Component;

/**
 * <code>ZipArchiveAdaptor</code> provides a concrete implementation of
 * {@link ArchiveAdaptor} for ZIP files.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ZipArchiveAdaptor extends AbstractArchiveAdaptor
{
    public ZipArchiveAdaptor()
    {
        super("cbz");
    }

    protected byte[] loadComicInternal(Comic comic, String entryName) throws ArchiveAdaptorException
    {
        File file = validateFile(comic);

        try
        {
            ZipFile input = new ZipFile(file);
            byte[] result = null;
            Enumeration<ZipArchiveEntry> entries = input.getEntries();

            while (entries.hasMoreElements())
            {
                ZipArchiveEntry entry = entries.nextElement();
                String filename = entry.getName();
                if (entryName == null || entryName.equals(filename))
                {
                    byte[] content = this.loadContent(entry.getName(), entry.getSize(), input.getInputStream(entry));
                    // if we were looking for a file, then we're done
                    if (entryName != null)
                    {
                        logger.debug("Return content for entry");
                        result = content;
                        break;
                    }
                    else
                    {
                        logger.debug("Processing entry content");
                        processContent(comic, filename, content);
                    }
                }
            }

            input.close();

            return result;
        }
        catch (IOException error)
        {
            throw new ArchiveAdaptorException("unable to open file: " + file.getAbsolutePath(), error);
        }
    }

    @Override
    void saveComicInternal(Comic source, String filename, boolean renamePages) throws ArchiveAdaptorException
    {
        logger.debug("Creating temporary file: " + filename);

        ZipArchiveOutputStream zoutput = null;
        try
        {
            ZipArchiveEntry entry;

            zoutput = (ZipArchiveOutputStream )new ArchiveStreamFactory().createArchiveOutputStream(ArchiveStreamFactory.ZIP,
                                                                                                    new FileOutputStream(filename));

            logger.debug("Adding the ComicInfo.xml entry");
            entry = new ZipArchiveEntry("ComicInfo.xml");
            byte[] content = comicInfoEntryAdaptor.saveContent(source);
            entry.setSize(content.length);
            zoutput.putArchiveEntry(entry);
            zoutput.write(content);
            zoutput.closeArchiveEntry();

            for (int index = 0;
                 index < source.getPageCount();
                 index++)
            {
                Page page = source.getPage(index);
                if (page.isMarkedDeleted())
                {
                    logger.debug("Skipping page marked for deletion");
                    continue;
                }
                String pagename = renamePages ? getFilenameForEntry(page.getFilename(), index) : page.getFilename();
                logger.debug("Adding entry: " + pagename + " size=" + page.getContent().length);
                entry = new ZipArchiveEntry(pagename);
                entry.setSize(page.getContent().length);
                zoutput.putArchiveEntry(entry);
                zoutput.write(page.getContent());
                zoutput.closeArchiveEntry();
            }

            zoutput.finish();
            zoutput.close();
        }
        catch (IOException
               | ArchiveException error)
        {
            throw new ArchiveAdaptorException("error creating comic archive", error);
        }
    }
}
