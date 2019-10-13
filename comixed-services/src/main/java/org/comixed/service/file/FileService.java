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

package org.comixed.service.file;

import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.file.FileDetails;
import org.comixed.model.library.Comic;
import org.comixed.repositories.ComicRepository;
import org.comixed.task.model.AddComicWorkerTask;
import org.comixed.task.model.QueueComicsWorkerTask;
import org.comixed.task.runner.Worker;
import org.comixed.utils.ComicFileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class FileService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicFileHandler comicFileHandler;
    @Autowired private ComicRepository comicRepository;
    @Autowired private Worker worker;
    @Autowired private ObjectFactory<QueueComicsWorkerTask> taskFactory;

    private int requestId = 0;

    public byte[] getImportFileCover(final String comicArchive)
            throws
            ComicFileHandlerException,
            ArchiveAdaptorException {
        this.logger.info("Getting first image from archive: {}",
                         comicArchive);

        byte[] result = null;
        final ArchiveAdaptor archiveAdaptor = this.comicFileHandler.getArchiveAdaptorFor(comicArchive);
        if (archiveAdaptor == null) {
            this.logger.debug("No archive adaptor available");
            return null;
        }

        final String coverFile = archiveAdaptor.getFirstImageFileName(comicArchive);
        if (coverFile == null) {
            this.logger.info("Archive contains no images");
            return null;
        }

        this.logger.debug("Fetching image content: entry={}",
                          coverFile);
        result = archiveAdaptor.loadSingleFile(comicArchive,
                                               coverFile);

        this.logger.debug("Returning {} bytes",
                          result == null
                          ? 0
                          : result.length);

        return result;
    }

    public List<FileDetails> getAllComicsUnder(final String rootDirectory)
            throws
            IOException {
        this.logger.info("Getting comics below root: {}",
                         rootDirectory);

        final File rootFile = new File(rootDirectory);
        final List<FileDetails> result = new ArrayList<>();

        if (rootFile.exists()) {
            if (rootFile.isDirectory()) {
                this.loadFilesUnder(result,
                                    rootFile);
            } else {
                this.logger.debug("Cannot process a file");
            }
        } else {
            this.logger.debug("Directory not found");
        }

        return result;
    }

    private void loadFilesUnder(final List<FileDetails> files,
                                final File directory)
            throws
            IOException {
        this.logger.debug("Loading files in directory: {}",
                          directory);
        for (File file : directory.listFiles()) {
            if (file.isDirectory()) {
                this.loadFilesUnder(files,
                                    file);
            } else {
                if (ComicFileUtils.isComicFile(file)) {
                    final String filePath = file.getCanonicalPath();
                    final long fileSize = file.length();

                    final Comic comic = this.comicRepository.findByFilename(filePath);

                    if (comic != null) {
                        this.logger.debug("File already in the library: id={}",
                                          comic.getId());
                    } else {
                        this.logger.info("Adding file: {} ({} bytes)",
                                         filePath,
                                         fileSize);

                        files.add(new FileDetails(filePath,
                                                  fileSize));
                    }
                }
            }
        }
    }

    public int getImportStatus()
            throws
            InterruptedException {

        long started = System.currentTimeMillis();
        this.logger.debug("Received import status request [{}]",
                          ++this.requestId);
        boolean done = false;
        int result = 0;

        while (!done) {
            result = this.worker.getCountFor(AddComicWorkerTask.class);

            if (result == 0) {
                Thread.sleep(1000);
                if ((System.currentTimeMillis() - started) > 60000) {
                    done = true;
                }
            } else {
                done = true;
            }
        }

        this.logger.debug("Responding to import status request [{}] in {}ms (BTW, there are {} imports pending)",
                          this.requestId,
                          (System.currentTimeMillis() - started),
                          result);

        return result;
    }

    public int importComicFiles(final String[] filenames,
                                final boolean deleteBlockedPages,
                                final boolean ignoreMetadata)
            throws
            UnsupportedEncodingException {
        this.logger.info("Preparing to import {} comic files: delete blocked pages={} ignore metadata={}",
                         filenames.length,
                         deleteBlockedPages
                         ? "Yes"
                         : "No",
                         ignoreMetadata
                         ? "Yes"
                         : "No");

        QueueComicsWorkerTask task = this.taskFactory.getObject();
        
        task.setFilenames(Arrays.asList(filenames));
        task.setDeleteBlockedPages(deleteBlockedPages);
        task.setIgnoreMetadata(ignoreMetadata);

        this.logger.debug("Adding import task to queue");
        this.worker.addTasksToQueue(task);

        return filenames.length;
    }
}
