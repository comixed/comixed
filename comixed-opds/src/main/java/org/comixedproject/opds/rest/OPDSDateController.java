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

package org.comixedproject.opds.rest;

import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.comixedproject.opds.service.OPDSNavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>OPDSDateController</code> provides endpoints for listing comics by store date year and
 * month.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSDateController {
  @Autowired private OPDSNavigationService opdsNavigationService;
  @Autowired private OPDSAcquisitionService opdsAcquisitionService;

  /**
   * Returns navigation links for the store date years in the library.
   *
   * @param principal the user principal
   * @param unread the unread flag
   * @return the years as navigation links
   */
  @GetMapping(value = "/opds/dates/released", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.opds.date.get-years")
  @ResponseBody
  public OPDSNavigationFeed getYearsFeed(
      final Principal principal,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    final String email = principal.getName();
    log.info("Loading comic years: email={} unread={}", email, unread);
    return this.opdsNavigationService.getYearsFeed(email, unread);
  }

  /**
   * Returns navigation links for the weeks of the given year in the library.
   *
   * @param principal the user principal
   * @param year the year
   * @param unread the unread flag
   * @return the weeks as navigation links
   * @throws OPDSException if an error occurs
   */
  @GetMapping(
      value = "/opds/dates/released/years/{year}/weeks",
      produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.opds.date.get-weeks")
  @ResponseBody
  public OPDSNavigationFeed getWeeksFeedForYear(
      final Principal principal,
      @PathVariable("year") @NonNull final Integer year,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread)
      throws OPDSException {
    final String email = principal.getName();
    log.info("Loading comics: year={} email={} unread={}", year, email, unread);
    return this.opdsNavigationService.getWeeksFeedForYear(year, email, unread);
  }

  /**
   * Returns an acquisition feed for all comics in the given week of the given year.
   *
   * @param principal the user principal
   * @param year the year
   * @param week the week
   * @param unread the unread flag
   * @return the comics as acquisition links
   */
  @GetMapping(
      value = "/opds/dates/released/years/{year}/weeks/{week}",
      produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.opds.date.get-comics")
  @ResponseBody
  public OPDSAcquisitionFeed loadComicsForYearAndWeek(
      final Principal principal,
      @PathVariable("year") @NonNull final Integer year,
      @PathVariable("week") @NonNull final Integer week,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    final String email = principal.getName();
    log.info("Loading comics for year {} and week {} for {}", year, week, email);
    return this.opdsAcquisitionService.getComicsFeedForYearAndWeek(email, year, week, unread);
  }
}
