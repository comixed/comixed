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

import java.util.Locale;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicTableModelTest
{
    private static final int TEST_COMIC_COUNT = 17;
    private static final String TEST_COMIC_NAME = "Comic Name";
    private static final int TEST_COMIC_ROW = 7;

    @InjectMocks
    private ComicTableModel comicTableModel;

    @Mock
    private ComicSelectionModel comicSelectionModel;

    @Mock
    private MessageSource messageSource;

    @Mock
    private Comic comic;

    @Test
    public void testGetRowCount()
    {
        Mockito.when(comicSelectionModel.getComicCount()).thenReturn(TEST_COMIC_COUNT);

        assertEquals(TEST_COMIC_COUNT, comicTableModel.getRowCount());

        Mockito.verify(comicSelectionModel, Mockito.times(1)).getComicCount();
    }

    @Test
    public void testGetColumnCount()
    {
        assertEquals(ComicTableModel.COLUMN_NAMES.length, comicTableModel.getColumnCount());
    }

    @Test
    public void testGetColumnName()
    {
        for (int index = 0;
             index < ComicTableModel.COLUMN_NAMES.length;
             index++)
        {
            String name = ComicTableModel.COLUMN_NAMES[index];
            String label = "view.table." + name + ".label";
            Mockito.when(messageSource.getMessage(Mockito.anyString(), Mockito.any(), Mockito.any(Locale.class)))
                   .thenReturn(name);

            assertEquals(name, comicTableModel.getColumnName(index));

            Mockito.verify(messageSource, Mockito.times(1)).getMessage(label, null, Locale.getDefault());
        }
    }

    @Test
    public void testGetValueAt()
    {
        Mockito.when(comicSelectionModel.getComic(Mockito.anyInt())).thenReturn(comic);
        Mockito.when(comic.getSeries()).thenReturn(TEST_COMIC_NAME);

        assertEquals(TEST_COMIC_NAME, comicTableModel.getValueAt(TEST_COMIC_ROW, 0));

        Mockito.verify(comicSelectionModel, Mockito.times(1)).getComic(TEST_COMIC_ROW);
        Mockito.verify(comic, Mockito.times(1)).getSeries();
    }
}
