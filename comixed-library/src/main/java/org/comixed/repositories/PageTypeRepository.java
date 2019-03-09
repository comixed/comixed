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

package org.comixed.repositories;

import org.comixed.library.model.PageType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/**
 * <code>PageTypeRepository</code> retrieves instances of {@link PageType} from
 * the database.
 * 
 * @author The ComiXed Project
 *
 */
public interface PageTypeRepository extends
                                    CrudRepository<PageType,
                                                   Long>
{
    /**
     * Returns the default offset type.
     * 
     * @return the default offset type
     */
    @Query("SELECT pt FROM PageType pt WHERE pt.name = 'story'")
    PageType getDefaultPageType();

}
