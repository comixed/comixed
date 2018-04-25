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

import java.util.List;

import org.comixed.library.model.Comic;
import org.comixed.library.model.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/comics/{id}")
public class PageController
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicController comicRepository;

    @RequestMapping(value = "/pages",
                    method = RequestMethod.GET)
    @CrossOrigin
    public List<Page> getAll(@PathVariable("id") long id)
    {
        this.logger.debug("Getting all pages for comic: id={}", id);

        return this.getPagesForComic(id);
    }

    @RequestMapping(value = "/pages/{index}",
                    method = RequestMethod.GET)
    @CrossOrigin
    public Page getPage(@PathVariable("id") long id, @PathVariable("index") int index)
    {
        this.logger.debug("Getting page for comic: id={} page={}", id, index);

        List<Page> pages = this.getPagesForComic(id);

        return (pages == null) || (index >= pages.size()) ? null : pages.get(index);
    }

    private List<Page> getPagesForComic(long id)
    {
        Comic comic = this.comicRepository.getComic(id);
        if (comic == null)
        {
            this.logger.debug("No such comic found: id={}", id);

            return null;
        }
        else return comic.getPages();
    }

    @RequestMapping(value = "/pages/{index}/content",
                    method = RequestMethod.GET)
    @CrossOrigin
    public byte[] getImage(@PathVariable("id") long id, @PathVariable("index") int index)
    {
        this.logger.debug("Getting the image for comic: id={} index={}", id, index);

        Comic comic = comicRepository.getComic(id);

        if (comic != null && index < comic.getPageCount()) { return comic.getPage(index).getContent(); }

        if (comic == null)
        {
            logger.debug("No such comic: id={}", id);
        }
        else
        {
            logger.debug("No such page: index={} page count={}", index, comic.getPageCount());
        }

        return null;
    }
}
