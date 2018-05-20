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
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.comixed.library.model.Comic;
import org.comixed.library.model.View;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonView;

@RestController
@RequestMapping(value = "/comics")
public class ComicController
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.DELETE)
    @CrossOrigin
    public boolean deleteComic(@PathVariable("id") long id)
    {
        this.logger.debug("Preparing to delete comic: id={}", id);

        Comic comic = this.comicRepository.findOne(id);

        if (comic == null)
        {
            this.logger.debug("No such comic: id={}", id);
            return false;
        }
        else
        {
            this.comicRepository.delete(comic);
            this.logger.debug("Comic deleted: id={}", id);
            return true;
        }
    }

    @RequestMapping(value = "/{id}/download",
                    method = RequestMethod.GET)
    @CrossOrigin
    public ResponseEntity<InputStreamResource> downloadComic(@PathVariable("id") long id) throws FileNotFoundException,
                                                                                          IOException
    {
        this.logger.debug("Attempting to download comic: id={}", id);

        Comic comic = this.comicRepository.findOne(id);

        if (comic == null)
        {
            this.logger.error("No such comic");
            return null;
        }

        File file = new File(comic.getFilename());

        if (!file.exists() || !file.isFile())
        {
            this.logger.error("Missing or invalid comic file: {}", comic.getFilename());
            return null;
        }

        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok().contentLength(file.length())
                             .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
                             .contentType(MediaType.parseMediaType("application/x-cbr")).body(resource);
    }

    @RequestMapping(method = RequestMethod.GET)
    @CrossOrigin
    @JsonView(View.List.class)
    // public List<Comic> getAll(@RequestParam("after") @DateTimeFormat(iso =
    // ISO.DATE_TIME) Optional<Date> after)
    public List<Comic> getAll(@RequestParam("after") Optional<Long> timestamp) throws ParseException
    {
        this.logger.debug("Getting all comics");

        List<Comic> result;

        if (timestamp.isPresent())
        {
            Date after = new Date(new Timestamp(timestamp.get()).getTime());
            this.logger.debug("Getting comics added after {}", after);
            result = comicRepository.findByDateAddedGreaterThan(after);
        }
        else
        {
            Iterable<Comic> comics = this.comicRepository.findAll();

            this.logger.debug("Adding comics to the result");
            result = new ArrayList<>();
            for (Comic comic : comics)
            {
                result.add(comic);
            }
        }

        if (result.isEmpty())
        {
            this.logger.debug("No comics retrieved");
        }

        this.logger.debug("Returning {} comic(s)", result.size());

        return result;
    }

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.GET)
    @CrossOrigin
    @JsonView(View.Details.class)
    public Comic getComic(@PathVariable("id") long id)
    {
        this.logger.debug("Fetching comic: id={}", id);

        Comic comic = this.comicRepository.findOne(id);

        if (comic == null)
        {
            this.logger.debug("No such comic found: id={}", id);
        }
        else
        {
            this.logger.debug("Found: {}", comic.getFilename());
        }

        return comic;
    }

    @RequestMapping(value = "/{id}/summary",
                    method = RequestMethod.GET)
    @CrossOrigin
    @JsonView(View.Summary.class)
    public Comic getComicSummary(@PathVariable("id") long id)
    {
        this.logger.debug("Fetching comic: id={}", id);

        Comic comic = this.comicRepository.findOne(id);

        if (comic == null)
        {
            this.logger.debug("No such comic found: id={}", id);
        }
        else
        {
            this.logger.debug("Found: {}", comic.getFilename());
        }

        return comic;
    }

    @RequestMapping(value = "/count",
                    method = RequestMethod.GET)
    @CrossOrigin
    public long getCount()
    {
        return this.comicRepository.count();
    }
}
