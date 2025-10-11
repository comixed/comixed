/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.model.comicpages;

/**
 * <code>ComicPageType</code> represents the type of page for a {@link ComicPage}.
 *
 * @author Darryl L. Pierce
 */
public enum ComicPageType {
  FRONT_COVER,
  BACK_COVER,
  INNER_COVER,
  ROUNDUP,
  EDITORIAL,
  LETTERS,
  ADVERTISEMENT,
  PREVIEW,
  STORY,
  OTHER;
}
