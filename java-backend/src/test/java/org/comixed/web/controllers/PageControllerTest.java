/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2018, The ComixEd Project.
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

import org.comixed.library.model.Page;
import org.comixed.library.model.PageType;
import org.comixed.repositories.PageRepository;
import org.comixed.repositories.PageTypeRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageControllerTest {
	private static final long PAGE_TYPE_ID = 717;
	private static final long PAGE_ID = 129;

	@InjectMocks
	private PageController pageController;

	@Mock
	private PageRepository pageRepository;

	@Mock
	private Page page;

	@Mock
	private PageTypeRepository pageTypeRepository;

	@Mock
	private PageType pageType;

	@Test
	public void testSetPageTypeForNonexistentPage() {
		Mockito.when(pageRepository.findOne(PAGE_ID)).thenReturn(null);

		pageController.updateTypeForPage(PAGE_ID, PAGE_TYPE_ID);

		Mockito.verify(pageRepository, Mockito.times(1)).findOne(PAGE_ID);
		Mockito.verify(pageTypeRepository, Mockito.never()).findOne(PAGE_TYPE_ID);
		Mockito.verify(pageRepository, Mockito.never()).save(Mockito.any(Page.class));
	}

	@Test
	public void testSetPageTypeWithNonexistentType() {
		Mockito.when(pageRepository.findOne(PAGE_ID)).thenReturn(page);
		Mockito.when(pageTypeRepository.findOne(PAGE_TYPE_ID)).thenReturn(null);

		pageController.updateTypeForPage(PAGE_ID, PAGE_TYPE_ID);

		Mockito.verify(pageRepository, Mockito.times(1)).findOne(PAGE_ID);
		Mockito.verify(pageTypeRepository, Mockito.times(1)).findOne(PAGE_TYPE_ID);
		Mockito.verify(pageRepository, Mockito.never()).save(Mockito.any(Page.class));
	}

	@Test
	public void testSetPageType() {
		Mockito.when(pageRepository.findOne(PAGE_ID)).thenReturn(page);
		Mockito.when(pageTypeRepository.findOne(PAGE_TYPE_ID)).thenReturn(pageType);
		Mockito.doNothing().when(page).setPageType(pageType);
		Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

		pageController.updateTypeForPage(PAGE_ID, PAGE_TYPE_ID);

		Mockito.verify(pageRepository, Mockito.times(1)).findOne(PAGE_ID);
		Mockito.verify(pageTypeRepository, Mockito.times(1)).findOne(PAGE_TYPE_ID);
		Mockito.verify(page, Mockito.times(1)).setPageType(pageType);
		Mockito.verify(pageRepository, Mockito.times(1)).save(page);
	}

}
