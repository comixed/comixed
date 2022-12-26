/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.library;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.metadata.Issue;
import org.comixedproject.repositories.library.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>IssueService</code> provides services for working with instances of {@link Issue}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class IssueService {
  @Autowired private IssueRepository issueRepository;

  /**
   * Returns the number of issues for the given series and volume.
   *
   * @param series the series name
   * @param volume the volume
   * @return the count
   */
  public long getCountForSeriesAndVolume(final String series, final String volume) {
    log.debug("Getting issue count: series={} volume={}", series, volume);
    return this.issueRepository.getCountForSeriesAndVolume(series, volume);
  }

  /**
   * Returns all issues for the given publisher, series, and volume.
   *
   * @param publisher the publisher
   * @param series the series name
   * @param volume the volume
   * @return the issues
   */
  public List<Issue> getAll(final String publisher, final String series, final String volume) {
    log.debug("Getting all  issues: publisher={} series={} volume={}", publisher, series, volume);
    return this.issueRepository.getAll(publisher, series, volume);
  }

  /**
   * Saves the provided issues. Any issues for the series and volume are deleted first.
   *
   * @param issues the issues
   * @return the saved issues
   */
  @Transactional
  public List<Issue> saveAll(final List<Issue> issues) {
    this.deleteSeriesAndVolume(issues.get(0).getSeries(), issues.get(0).getVolume());
    this.issueRepository.flush();
    log.debug("Saving {} issue{}", issues.size(), issues.size() == 1 ? "" : "s");
    return this.issueRepository.saveAll(issues);
  }

  /**
   * Deletes all issues for the given series and volume.
   *
   * @param series the series name
   * @param volume the volume
   */
  @Transactional
  public void deleteSeriesAndVolume(final String series, final String volume) {
    log.debug("Deleting all issues: series={} volume={}", series, volume);
    this.issueRepository.deleteSeriesAndVolume(series, volume);
  }
}
