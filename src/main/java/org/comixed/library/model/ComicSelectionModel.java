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

import javax.swing.DefaultListSelectionModel;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;

import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.PageRepository;
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
public class ComicSelectionModel implements
                                 ListSelectionListener
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private PageRepository pageRepository;

    List<Comic> allComics = new ArrayList<>();
    boolean reload = true;
    List<ComicSelectionListener> listeners = new ArrayList<>();
    List<Comic> selections = new ArrayList<>();

    /**
     * Adds a new listener.
     *
     * @param listener
     *            the listener
     */
    public void addComicSelectionListener(ComicSelectionListener listener)
    {
        this.logger.debug("Adding listener: " + listener);
        this.listeners.add(listener);
    }

    void fireListChangedEvent()
    {
        for (ComicSelectionListener listener : this.listeners)
        {
            listener.comicListChanged();
        }
    }

    void fireSelectionChangedEvent()
    {
        for (ComicSelectionListener listener : this.listeners)
        {
            listener.selectionChanged();
        }
    }

    /**
     * Returns all loaded comics.
     *
     * @return all comics
     */
    public List<Comic> getAllComics()
    {
        this.logger.debug("Returning all comics");
        if (this.reload) this.reloadComics();
        return this.allComics;
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
        if (this.reload)
        {
            this.reloadComics();
        }

        this.logger.debug("Return allComics comic: index=" + index);
        return this.allComics.get(index);
    }

    /**
     * Returns the number of comics in the selection model.
     *
     * @return
     */
    public int getComicCount()
    {
        if (this.reload)
        {
            this.reloadComics();
        }
        int result = (this.allComics != null) ? this.allComics.size() : 0;
        this.logger.debug("Return comic count: " + result);
        return result;
    }

    public int getDuplicatePageCount()
    {
        this.logger.debug("Returning duplicate page count");
        return this.pageRepository.getDuplicatePageCount();
    }

    /**
     * Returns only those comics that are allComics.
     *
     * @return the allComics comics
     */
    public List<Comic> getSelectedComics()
    {
        this.logger.debug("Returning allComics comics");
        return this.selections;
    }

    public long getTotalComics()
    {
        return this.comicRepository.count();
    }

    public boolean hasSelections()
    {
        return this.selections.isEmpty() == false;
    }

    /**
     * Sets the reload flag and causes a reload to occur.
     */
    public void reload()
    {
        this.reload = true;
        this.fireListChangedEvent();
    }

    private void reloadComics()
    {
        this.logger.debug("Fetching comics");
        Iterable<Comic> selection = this.comicRepository.findAll();
        this.allComics.clear();
        selection.forEach(this.allComics::add);
        this.reload = false;
        this.fireSelectionChangedEvent();
    }

    @Override
    public void valueChanged(ListSelectionEvent event)
    {
        this.logger.debug("Table view selection changed");

        if (event.getSource() instanceof DefaultListSelectionModel)
        {
            this.selections.clear();

            if (event.getFirstIndex() >= 0)
            {
                DefaultListSelectionModel source = (DefaultListSelectionModel )event.getSource();
                for (int index = source.getMinSelectionIndex();
                     index <= source.getMaxSelectionIndex();
                     index++)
                {
                    this.logger.debug("Selected: index=" + index);
                    if (source.isSelectedIndex(index))
                    {
                        this.selections.add(this.getComic(index));
                    }
                }
            }
        }
        this.fireSelectionChangedEvent();
    }
}
