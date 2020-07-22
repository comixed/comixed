/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.model.scraping;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>ScrapingCache</code> holds the details for a single scraping interaction. The data is
 * stored and retrieved to avoid having to go back to data source.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "scraping_cache")
public class ScrapingCache {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "source", length = 32, updatable = false, nullable = false)
  @Getter
  @Setter
  private String source;

  @Column(name = "cache_key", length = 256, updatable = false, nullable = false)
  @Getter
  @Setter
  private String cacheKey;

  @Column(name = "date_fetched", nullable = false, updatable = false)
  @Getter
  @Setter
  @Temporal(TemporalType.TIMESTAMP)
  private Date fetched = new Date();

  @OneToMany(
      mappedBy = "scrapingCache",
      fetch = FetchType.EAGER,
      cascade = CascadeType.ALL,
      orphanRemoval = true)
  @OrderColumn(name = "entry_number")
  @Getter
  private List<ScrapingCacheEntry> entries = new ArrayList<>();
}
