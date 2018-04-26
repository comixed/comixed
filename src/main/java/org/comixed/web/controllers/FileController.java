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

package org.comixed.web.controllers;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.comixed.library.model.FileDetails;
import org.comixed.repositories.ComicRepository;
import org.comixed.tasks.AddComicWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.utils.ComicFileUtils;
import org.json.JSONException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>FileController</code> allows the remote agent to query directories and
 * import files, to download files and work with the file system.
 * 
 * @author Darryl L. Pierce
 *
 */
@RestController
@RequestMapping("/files")
public class FileController
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private Worker worker;

    @Autowired
    private ObjectFactory<AddComicWorkerTask> taskFactory;

    @RequestMapping(value = "/contents",
                    method = RequestMethod.GET)
    @CrossOrigin
    public List<FileDetails> getAllComicsUnder(@RequestParam(value = "directory") String directory) throws IOException,
                                                                                                    JSONException
    {
        logger.debug("Searching for comics below: " + directory);

        File root = new File(directory);
        List<FileDetails> result = new ArrayList<>();

        if (root.isDirectory())
        {
            getAllFilesUnder(root, result);
            result.sort(new Comparator<FileDetails>()
            {
                @Override
                public int compare(FileDetails o1, FileDetails o2)
                {
                    return o1.getFilename().compareTo(o2.getFilename());
                }
            });
        }
        else if (root.isFile())
        {
            result.add(new FileDetails(root.getAbsolutePath(), root.length()));
        }
        else
        {
            logger.debug("Not a file or directory: " + directory);
        }

        return result;
    }

    @RequestMapping(value = "/import",
                    method = RequestMethod.POST)
    @CrossOrigin
    public void importComicFiles(@RequestParam(value = "filenames") List<String> filenames)
    {
        logger.debug("Attempting to post to controller");
        for (String filename : filenames)
        {
            File file = new File(filename);

            if (file.exists() && file.isFile())
            {
                logger.debug("Importing: {}", filename);
                AddComicWorkerTask task = this.taskFactory.getObject();

                task.setFile(file);
                worker.addTasksToQueue(task);
            }
            else
            {
                logger.error("Unable to import file: {}", filename);
            }
        }
    }

    private void getAllFilesUnder(File root, List<FileDetails> result) throws IOException
    {
        for (File file : root.listFiles())
        {
            if (file.isDirectory())
            {
                logger.debug("Searching directory: " + file.getAbsolutePath());
                getAllFilesUnder(file, result);
            }
            else
            {
                logger.debug("Adding file: " + file.getCanonicalPath());
                if (ComicFileUtils.isComicFile(file)
                    && comicRepository.findByFilename(file.getAbsolutePath()) == null) result.add(new FileDetails(file.getAbsolutePath(), file.length()));
            }
        }
    }
}
