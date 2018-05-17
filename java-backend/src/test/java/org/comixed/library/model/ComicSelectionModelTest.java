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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.PageRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicSelectionModelTest
{
    private static final int TEST_COMIC_LIST_SIZE = 717;
    private static final int TEST_COMIC_INDEX = 65;
    private static final long TEST_COMIC_COUNT = 71765L;
    private static final int TEST_DUPLICATE_PAGE_COUNT = 129;

    @InjectMocks
    private ComicSelectionModel model;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private PageRepository pageRepository;

    @Mock
    private List<Comic> comicList;

    @Mock
    private Comic comic;

    @Mock
    private ComicSelectionListener comicSelectionListener;

    @Test
    public void testGetComicCountReload()
    {
        model.reload = true;

        Mockito.when(comicRepository.findAll()).thenReturn(comicList);
        Mockito.doNothing().when(comicList).clear();
        Mockito.when(comicList.size()).thenReturn(TEST_COMIC_LIST_SIZE);

        assertEquals(TEST_COMIC_LIST_SIZE, model.getComicCount());

        Mockito.verify(comicRepository, Mockito.times(1)).findAll();
        Mockito.verify(comicList, Mockito.times(1)).clear();
        Mockito.verify(comicList, Mockito.times(1)).size();
    }

    @Test
    public void testGetComicCount()
    {
        model.reload = false;

        Mockito.when(comicList.size()).thenReturn(TEST_COMIC_LIST_SIZE);

        assertEquals(TEST_COMIC_LIST_SIZE, model.getComicCount());

        Mockito.verify(comicRepository, Mockito.never()).findAll();
        Mockito.verify(comicList, Mockito.never()).clear();
        Mockito.verify(comicList, Mockito.times(1)).size();
    }

    @Test
    public void testGetComicReload()
    {
        model.reload = true;

        Mockito.when(comicRepository.findAll()).thenReturn(comicList);
        Mockito.doNothing().when(comicList).clear();
        Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);

        assertSame(comic, model.getComic(TEST_COMIC_INDEX));

        Mockito.verify(comicRepository, Mockito.times(1)).findAll();
        Mockito.verify(comicList, Mockito.times(1)).clear();
        Mockito.verify(comicList, Mockito.times(1)).get(TEST_COMIC_INDEX);
    }

    @Test
    public void testGetComic()
    {
        model.reload = false;

        Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);

        assertSame(comic, model.getComic(TEST_COMIC_INDEX));

        Mockito.verify(comicRepository, Mockito.never()).findAll();
        Mockito.verify(comicList, Mockito.never()).clear();
        Mockito.verify(comicList, Mockito.times(1)).get(TEST_COMIC_INDEX);
    }

    @Test
    public void testAddComicSelectionListener()
    {
        assertTrue(model.listeners.isEmpty());
        model.addComicSelectionListener(comicSelectionListener);
        assertFalse(model.listeners.isEmpty());
    }

    @Test
    public void testFireComicSelectionChangedEvent()
    {
        Mockito.doNothing().when(comicSelectionListener).selectionChanged();
        model.addComicSelectionListener(comicSelectionListener);
        model.fireSelectionChangedEvent();
        Mockito.verify(comicSelectionListener, Mockito.times(1)).selectionChanged();
    }

    @Test
    public void testFireComicListChangedEvent()
    {
        Mockito.doNothing().when(comicSelectionListener).comicListChanged();
        model.addComicSelectionListener(comicSelectionListener);
        model.fireListChangedEvent();
        Mockito.verify(comicSelectionListener, Mockito.times(1)).comicListChanged();
    }

    @Test
    public void testReload()
    {
        model.addComicSelectionListener(comicSelectionListener);

        Mockito.doNothing().when(comicSelectionListener).comicListChanged();

        model.reload();

        Mockito.verify(comicSelectionListener, Mockito.times(1)).comicListChanged();
    }

    @Test
    public void testHasSelections()
    {
        model.selections.add(comic);

        assertTrue(model.hasSelections());
    }

    @Test
    public void testHasSelectionsNothingSelected()
    {
        model.selections.clear();

        assertFalse(model.hasSelections());
    }

    @Test
    public void testTotalComicCount()
    {
        Mockito.when(comicRepository.count()).thenReturn(TEST_COMIC_COUNT);

        assertEquals(TEST_COMIC_COUNT, model.getTotalComics());

        Mockito.verify(comicRepository, Mockito.times(1)).count();
    }

    @Test
    public void testDuplicatePageCount()
    {
        Mockito.when(pageRepository.getDuplicatePageCount()).thenReturn(TEST_DUPLICATE_PAGE_COUNT);

        assertEquals(TEST_DUPLICATE_PAGE_COUNT, model.getDuplicatePageCount());

        Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePageCount();
    }

    @Test
    public void testSelectedComics()
    {
        assertSame(model.selections, model.getSelectedComics());
    }

    @Test
    public void testAllComics()
    {
        model.reload = false;
        assertSame(model.allComics, model.getAllComics());
    }
}
