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

package org.comixedproject.rest.comicpages;

import static org.comixedproject.batch.comicpages.MarkPagesWithHashConfiguration.PARAM_MARK_PAGES_TARGET_HASH;
import static org.comixedproject.batch.comicpages.MarkPagesWithHashConfiguration.PARAM_MARK_PAGES_WITH_HASH_STARTED;
import static org.comixedproject.batch.comicpages.UnmarkPagesWithHashConfiguration.PARAM_UNMARK_PAGES_TARGET_HASH;
import static org.comixedproject.batch.comicpages.UnmarkPagesWithHashConfiguration.PARAM_UNMARK_PAGES_WITH_HASH_STARTED;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.blockedpage.DeleteBlockedPagesRequest;
import org.comixedproject.model.net.blockedpage.MarkPageWithHashRequest;
import org.comixedproject.model.net.blockedpage.UnmarkPageWithHashRequest;
import org.comixedproject.model.net.comicpages.SetBlockedPageRequest;
import org.comixedproject.service.comicpages.BlockedHashException;
import org.comixedproject.service.comicpages.BlockedHashService;
import org.comixedproject.views.View;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * <code>BlockedHashController</code> provides endpoints for working with instances of {@link
 * BlockedHash}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class BlockedHashController {
  @Autowired private BlockedHashService blockedHashService;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Autowired
  @Qualifier("markPagesWithHashJob")
  private Job markPagesWithHashJob;

  @Autowired
  @Qualifier("unmarkPagesWithHashJob")
  private Job unmarkPagesWithHashJob;

  /**
   * Retrieves the list of all blocked pages.
   *
   * @return the list of blocked page hashes
   */
  @GetMapping(value = "/api/pages/blocked", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.BlockedHashList.class)
  public List<BlockedHash> getAll() {
    log.info("Load all blocked pages");
    return this.blockedHashService.getAll();
  }

  /**
   * Returns a single blocked page by its hash.
   *
   * @param hash the page hash
   * @return the blocked page
   * @throws BlockedHashException if an error occurs
   */
  @GetMapping(value = "/api/pages/blocked/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  public BlockedHash getByHash(@PathVariable("hash") final String hash)
      throws BlockedHashException {
    log.info("Loading blocked page: hash={}", hash);
    return this.blockedHashService.getByHash(hash);
  }

  /**
   * Updates the details for a blocked page.
   *
   * @param hash the page hash
   * @param blockedHash the updated details
   * @return the updated record
   * @throws BlockedHashException if an error occurs
   */
  @PutMapping(value = "/api/pages/blocked/{hash}")
  @JsonView(View.BlockedHashDetail.class)
  @PreAuthorize("hasRole('ADMIN')")
  public BlockedHash updateBlockedPage(
      @PathVariable("hash") final String hash, @RequestBody() final BlockedHash blockedHash)
      throws BlockedHashException {
    log.info(
        "Updating blocked page: hash={} label={}", blockedHash.getHash(), blockedHash.getHash());
    return this.blockedHashService.updateBlockedPage(hash, blockedHash);
  }

  /**
   * Blocks pages by type.
   *
   * @param request the request body
   * @throws JobInstanceAlreadyCompleteException if an error occurs
   * @throws JobExecutionAlreadyRunningException if an error occurs
   * @throws JobParametersInvalidException if an error occurs
   * @throws JobRestartException if an error occurs
   */
  @PostMapping(
      value = "/api/pages/blocked/add",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public void blockPageHashes(@RequestBody() final SetBlockedPageRequest request)
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> hashes = request.getHashes();
    log.info("Block {} hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    this.blockedHashService.blockPages(hashes);
    this.launchMarkPagesWithHashProcess(hashes);
  }

  /**
   * Marks all comics with hashes from a givens et for deletion.
   *
   * @param request the request body
   * @throws JobInstanceAlreadyCompleteException if a job error occurs
   * @throws JobExecutionAlreadyRunningException if a job error occurs
   * @throws JobParametersInvalidException if a job error occurs
   * @throws JobRestartException if a job error occurs
   */
  @PostMapping(value = "/api/pages/blocked/mark", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public void markPagesWithHash(@RequestBody() final MarkPageWithHashRequest request)
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> hashes = request.getHashes();
    log.info("Marking pages with hash for deletion");
    launchMarkPagesWithHashProcess(hashes);
  }

  /**
   * Launches the process to mark all pages with a hash for deletion.
   *
   * @param hashes the hash
   * @throws JobExecutionAlreadyRunningException if an error occurs
   * @throws JobRestartException if an error occurs
   * @throws JobInstanceAlreadyCompleteException if an error occurs
   * @throws JobParametersInvalidException if an error occurs
   */
  private void launchMarkPagesWithHashProcess(final List<String> hashes)
      throws JobExecutionAlreadyRunningException, JobRestartException,
          JobInstanceAlreadyCompleteException, JobParametersInvalidException {
    for (int index = 0; index < hashes.size(); index++) {
      final String hash = hashes.get(index);
      log.trace("Marking pages with hash: {}", hash);
      this.jobLauncher.run(
          this.markPagesWithHashJob,
          new JobParametersBuilder()
              .addLong(PARAM_MARK_PAGES_WITH_HASH_STARTED, System.currentTimeMillis())
              .addString(PARAM_MARK_PAGES_TARGET_HASH, hash)
              .toJobParameters());
    }
  }

  /**
   * Unblocks pages by hash.
   *
   * @param request the request body
   * @throws JobInstanceAlreadyCompleteException if a job error occurs
   * @throws JobExecutionAlreadyRunningException if a job error occurs
   * @throws JobParametersInvalidException if a job error occurs
   * @throws JobRestartException if a job error occurs
   */
  @PostMapping(
      value = "/api/pages/blocked/remove",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public void unblockPageHashes(@RequestBody() final SetBlockedPageRequest request)
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> hashes = request.getHashes();
    log.info("Unblock {} hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    this.blockedHashService.unblockPages(hashes);
    this.launchUnmarkPagesWithHashProcess(hashes);
  }

  /**
   * Unmarks all comics with hashes from a givens et for deletion.
   *
   * @param request the request body
   * @throws JobInstanceAlreadyCompleteException if a job error occurs
   * @throws JobExecutionAlreadyRunningException if a job error occurs
   * @throws JobParametersInvalidException if a job error occurs
   * @throws JobRestartException if a job error occurs
   */
  @PostMapping(value = "/api/pages/blocked/unmark", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public void unmarkPagesWithHash(@RequestBody() final UnmarkPageWithHashRequest request)
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> hashes = request.getHashes();
    log.info("Marking pages with hash for deletion");
    this.launchUnmarkPagesWithHashProcess(hashes);
  }

  /**
   * Launches the process to unmark all pages with a given set of hashes.
   *
   * @param hashes the hashes
   * @throws JobInstanceAlreadyCompleteException if a job error occurs
   * @throws JobExecutionAlreadyRunningException if a job error occurs
   * @throws JobParametersInvalidException if a job error occurs
   * @throws JobRestartException if a job error occurs
   */
  private void launchUnmarkPagesWithHashProcess(final List<String> hashes)
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    for (int index = 0; index < hashes.size(); index++) {
      final String hash = hashes.get(index);
      log.trace("Unmarking pages with hash: {}", hash);
      this.jobLauncher.run(
          this.unmarkPagesWithHashJob,
          new JobParametersBuilder()
              .addLong(PARAM_UNMARK_PAGES_WITH_HASH_STARTED, System.currentTimeMillis())
              .addString(PARAM_UNMARK_PAGES_TARGET_HASH, hash)
              .toJobParameters());
    }
  }

  /**
   * Generates and downloads a file containing the blocked page list.
   *
   * @return the blocked page file
   * @throws IOException if an error occurs
   */
  @GetMapping(value = "/api/pages/blocked/file", produces = MediaType.APPLICATION_JSON_VALUE)
  public DownloadDocument downloadFile() throws IOException {
    log.info("Downloading blocked page file");
    return this.blockedHashService.createFile();
  }

  /**
   * Processes an uploaded blocked page file.
   *
   * @param file the uploaded file
   * @return the updated blocked page list
   * @throws BlockedHashException if a service exception occurs
   * @throws IOException if a file exception occurs
   */
  @PostMapping(value = "/api/pages/blocked/file", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.BlockedHashList.class)
  @PreAuthorize("hasRole('ADMIN')")
  public List<BlockedHash> uploadFile(final MultipartFile file)
      throws BlockedHashException, IOException {
    log.info("Received uploaded blocked page file: {}", file.getOriginalFilename());
    return this.blockedHashService.uploadFile(file.getInputStream());
  }

  /**
   * Deletes a set of blocked pages by their hash value.
   *
   * @param request the request body
   * @return the list of deleted blocked page hashes
   */
  @PostMapping(
      value = "/api/pages/blocked/delete",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.BlockedHashList.class)
  @PreAuthorize("hasRole('ADMIN')")
  public List<String> deleteBlockedPages(@RequestBody() final DeleteBlockedPagesRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Deleting {} blocked hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    return this.blockedHashService.deleteBlockedPages(hashes);
  }
}
