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
import static org.junit.Assert.assertSame;

import org.comixed.ComixEdTestContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ComixEdTestContext.class)
@TestPropertySource(locations =
{"classpath:details-view.properties",
 "classpath:test-application.properties"})
public class ComicTableModelTest
{
    private static final int TEST_COMIC_COUNT = 717;
    @Mock
    private ComicSelectionModel comicSelectionModel;
    @InjectMocks
    private ComicTableModel comicTableModel;
    @Mock
    private Comic comic;
    @Captor
    ArgumentCaptor<Integer> index;

    @Test
    public void testGetRowCount()
    {
        Mockito.when(comicSelectionModel.getComicCount()).thenReturn(TEST_COMIC_COUNT);

        assertEquals(TEST_COMIC_COUNT, comicTableModel.getRowCount());

        Mockito.verify(comicSelectionModel, Mockito.atLeastOnce()).getComicCount();
    }

    // TODO need a way to test the columns
    // @Test
    // public void testGetColumnCount()
    // {
    // assertNotNull(comicTableModel.columnNames);
    // assertNotEquals(0, comicTableModel.columnNames.size());
    // assertEquals(comicTableModel.columnNames.size(),
    // comicTableModel.getColumnCount());
    // }

    @Test
    public void testGetColumnName()
    {
        for (int index = 0;
             index < comicTableModel.columnNames.size();
             index++)
        {
            String name = comicTableModel.columnNames.get(index).getName();

            assertEquals(name, comicTableModel.getColumnName(index));
        }
    }

    /*
     * TODO: Need a better way to test this
     * 
     * @Test
     * public void testGetValueAt()
     * {
     * assertEquals(TEST_COMIC_NAME, comicTableModel.getValueAt(TEST_COMIC_ROW,
     * 0));
     * }
     */

    @Test(expected = IndexOutOfBoundsException.class)
    public void testGetComicAtBadRow()
    {
        Mockito.when(comicSelectionModel.getComicCount()).thenReturn(17);

        try
        {
            comicTableModel.getComicAt(comicTableModel.getRowCount() + 1);

            Mockito.verify(comicSelectionModel, Mockito.atLeastOnce());
        }
        catch (IndexOutOfBoundsException expected)
        {
            throw expected;
        }
    }

    @Test(expected = IndexOutOfBoundsException.class)
    public void testGetComicAtNegativeRow()
    {
        comicTableModel.getComicAt(-1);
    }

    @Test
    public void testGetComicAt()
    {
        Mockito.when(comicSelectionModel.getComicCount()).thenReturn(18);
        Mockito.when(comicSelectionModel.getComic(Mockito.anyInt())).thenReturn(comic);

        Comic result = comicTableModel.getComicAt(17);

        assertSame(comic, result);

        Mockito.verify(comicSelectionModel, Mockito.times(1)).getComicCount();
        Mockito.verify(comicSelectionModel, Mockito.times(1)).getComic(index.capture());
    }
}
