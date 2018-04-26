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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.comixed.library.model.Comic;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

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

    @RequestMapping(method = RequestMethod.GET)
    @CrossOrigin
    public List<Comic> getAll()
    {
        this.logger.debug("Getting all comics");

        List<Comic> comics = new ArrayList<>();

        for (Comic comic : this.comicRepository.findAll())
        {
            this.logger.debug("Adding comic: {}", comic.getFilename());
            comics.add(comic);
        }

        if (comics.isEmpty())
        {
            this.logger.debug("No comics retrieved");
        }

        this.logger.debug("Returning {} comic(s)", comics.size());

        return comics;
    }

    @RequestMapping(value = "/{id}",
                    method = RequestMethod.GET)
    @CrossOrigin
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

    @RequestMapping(value = "/count",
                    method = RequestMethod.GET)
    @CrossOrigin
    public Map<String,
               String> getCount()
    {
        Map<String,
            String> result = new HashMap<>();
        result.put("count", String.valueOf(this.comicRepository.count()));
        return result;
    }
}
