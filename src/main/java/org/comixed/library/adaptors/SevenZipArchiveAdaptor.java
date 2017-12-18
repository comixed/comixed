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

import org.apache.commons.compress.archivers.sevenz.SevenZArchiveEntry;
import org.apache.commons.compress.archivers.sevenz.SevenZFile;
import org.apache.commons.compress.archivers.sevenz.SevenZMethod;
import org.apache.commons.compress.archivers.sevenz.SevenZOutputFile;
import org.comixed.library.model.Comic;
import org.comixed.library.model.Page;
import org.springframework.stereotype.Component;

/**
 * <code>SevenZipArchiveAdaptor</code> provides support for reading 7Z encoded
 * comics.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class SevenZipArchiveAdaptor extends AbstractArchiveAdaptor
{

    public SevenZipArchiveAdaptor()
    {
        super("cb7");
    }

    @Override
    protected byte[] loadComicInternal(Comic comic, String entryName) throws ArchiveAdaptorException
    {
        File file = validateFile(comic);

        try
        {
            SevenZFile comicFile = new SevenZFile(file);
            byte[] result = null;
            SevenZArchiveEntry entry = comicFile.getNextEntry();

            while (entry != null)
            {
                String filename = entry.getName();
                if (entryName == null || entryName.equals(filename))
                {
                    byte[] content = new byte[(int )entry.getSize()];

                    comicFile.read(content, 0, (int )entry.getSize());
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

                entry = comicFile.getNextEntry();
            }

            comicFile.close();

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

        try
        {
            SevenZOutputFile sevenzcomic = new SevenZOutputFile(new File(filename));
            sevenzcomic.setContentCompression(SevenZMethod.LZMA2);

            logger.debug("Adding the ComicInfo.xml entry");

            addFileToArchive(sevenzcomic, "ComicInfo.xml", comicInfoEntryAdaptor.saveContent(source));

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
                addFileToArchive(sevenzcomic, pagename, page.getContent());
            }

            sevenzcomic.finish();
            sevenzcomic.close();
        }
        catch (IOException error)
        {
            throw new ArchiveAdaptorException("error creating comic archive", error);
        }
    }

    private void addFileToArchive(SevenZOutputFile archive, String filename, byte[] content) throws IOException
    {
        logger.info("Saving file to archive: " + filename + " [size=" + content.length + "]");

        File tempFile = File.createTempFile("comixed", "tmp");
        logger.debug("Saving entry as temporary filename: " + tempFile.getAbsolutePath());
        FileOutputStream output = new FileOutputStream(tempFile);
        output.write(content, 0, content.length);
        output.close();

        logger.debug("Adding temporary file to archive");
        SevenZArchiveEntry entry = archive.createArchiveEntry(tempFile, filename);
        archive.putArchiveEntry(entry);
        archive.write(content);
        archive.closeArchiveEntry();

        logger.debug("Cleaning up the temporary file");
        tempFile.delete();
    }
}
