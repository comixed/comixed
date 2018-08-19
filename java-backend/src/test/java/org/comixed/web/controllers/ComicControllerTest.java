/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

import static org.junit.Assert.assertSame;

import java.sql.Date;
import java.text.ParseException;
import java.util.List;

import org.comixed.library.model.Comic;
import org.comixed.repositories.ComicRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicControllerTest
{
    @InjectMocks
    private ComicController controller;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private List<Comic> comicList;

    @Test
    public void testGetComicsAddedSince() throws ParseException
    {
        Mockito.when(comicRepository.findByDateAddedGreaterThan(Mockito.any(Date.class))).thenReturn(comicList);

        List<Comic> result = controller.getComicsAddedSince(0L);

        Mockito.verify(comicRepository, Mockito.times(1)).findByDateAddedGreaterThan(new Date(0L));

        assertSame(comicList, result);
    }
}
