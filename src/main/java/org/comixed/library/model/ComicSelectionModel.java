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

package org.comixed.library.model;

import java.util.ArrayList;
import java.util.List;

import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicSelectionModel</code> maintains the list of comics to be
 * displayed.
 * 
 * By default, it references all comics in the library. But the set is reduced
 * to those that meet filtering criteria as they're applied.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class ComicSelectionModel
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;
    List<Comic> selected = new ArrayList<>();
    boolean reload = true;

    /**
     * Returns the number of comics in the selection model.
     * 
     * @return
     */
    public int getComicCount()
    {
        if (reload)
        {
            reloadComics();
        }
        int result = (selected != null) ? selected.size() : 0;
        logger.debug("Return comic count: " + result);
        return result;
    }

    private void reloadComics()
    {
        logger.debug("Fetching comics");
        Iterable<Comic> selection = comicRepository.findAll();
        selected.clear();
        selection.forEach(selected::add);
    }

    /**
     * Returns the comic at the specified index.
     * 
     * @param index
     *            the index
     * @return the comic
     */
    public Comic getComic(int index)
    {
        if (reload)
        {
            reloadComics();
        }

        logger.debug("Return selected comic: index=" + index);
        return selected.get(index);
    }

}
