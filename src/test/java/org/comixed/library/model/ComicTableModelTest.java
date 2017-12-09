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
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;

import org.comixed.ComixEdTestContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ComixEdTestContext.class)
@TestPropertySource(locations = "classpath:details-view.properties")
public class ComicTableModelTest
{
    private static final int TEST_COMIC_COUNT = 17;
    private static final String TEST_COMIC_NAME = "Comic Name";
    private static final int TEST_COMIC_ROW = 7;

    @Autowired
    @InjectMocks
    private ComicTableModel comicTableModel;

    /*
     * TODO: need a better way to test this
     * 
     * @Test
     * public void testGetRowCount()
     * {
     * assertEquals(TEST_COMIC_COUNT, comicTableModel.getRowCount());
     * }
     */

    @Test
    public void testGetColumnCount()
    {
        assertNotNull(comicTableModel.columnNames);
        assertNotEquals(0, comicTableModel.columnNames.size());
        assertEquals(comicTableModel.columnNames.size(), comicTableModel.getColumnCount());
    }

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
}
