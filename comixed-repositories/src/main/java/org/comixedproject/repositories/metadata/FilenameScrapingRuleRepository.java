/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.repositories.metadata;

import java.util.List;
import org.comixedproject.model.metadata.FilenameScrapingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>FilenameScrapingRuleRepository</code> provides methods for working with persisted instances
 * of {@link FilenameScrapingRule}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface FilenameScrapingRuleRepository extends JpaRepository<FilenameScrapingRule, Long> {

  /**
   * Returns all rules sorted by priority.
   *
   * @return the sorts fules
   */
  @Query("SELECT r FROM FilenameScrapingRule r ORDER BY r.priority")
  List<FilenameScrapingRule> findAll();

  /**
   * Returns the rule with the given name
   *
   * @param name the rule name
   * @return the rule if it exists
   */
  @Query("SELECT r FROM FilenameScrapingRule  r WHERE r.name = :name")
  FilenameScrapingRule findByName(@Param("name") String name);
}
