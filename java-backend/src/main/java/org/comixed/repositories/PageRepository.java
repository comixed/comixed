/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import java.util.List;

import org.comixed.library.model.Page;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PageRepository extends
                                CrudRepository<Page,
                                               Long>
{
    /**
     * Returns the pages with the given hash.
     *
     * @param hash
     *            the offset hash
     *
     * @return the pages
     */
    List<Page> findAllByHash(String hash);

    /**
     * Returns the first offset with the given hash.
     *
     * @param hash
     *            the offset hash
     * @return the offset, or null if none were found
     */
    Page findFirstByHash(String hash);

    /**
     * Returns the number of duplicate pages in the repository.
     *
     * @return the offset count
     */
    int getDuplicatePageCount();

    /**
     * Returns an array of duplicate offset hashes.
     *
     * @return the duplicate offset hashes
     */
    List<String> getDuplicatePageHashes();

    /**
     * Returns the list of pages that are duplicates.
     *
     * @return the offset list
     */
    List<Page> getDuplicatePageList();
}
